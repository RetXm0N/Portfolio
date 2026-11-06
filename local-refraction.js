/* Time-based light and direct media refraction, driven by the same optical flow. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  if (reduced.matches || !fine.matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'optical-flow';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483643;visibility:hidden;filter:none';
  const gl = canvas.getContext('webgl2', {
    alpha:true, premultipliedAlpha:true, antialias:false, depth:false, stencil:false,
    powerPreference:'low-power', preserveDrawingBuffer:false
  });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return;

  const vertex = `#version 300 es
    precision highp float;
    out vec2 uv;
    void main() {
      vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
      uv = p; gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    }`;
  const common = `#version 300 es
    precision highp float;
    in vec2 uv;
    out vec4 color;
    uniform sampler2D field;
    uniform vec2 texel;
    uniform vec2 aspect;
    uniform float dt;
    vec4 sampleField(vec2 p) {
      vec2 q = clamp(p, texel*.5, 1.0-texel*.5) / texel - .5;
      vec2 i = floor(q), f = fract(q);
      vec2 a = (i+.5)*texel;
      return mix(mix(texture(field,a),texture(field,a+vec2(texel.x,0)),f.x),
                 mix(texture(field,a+vec2(0,texel.y)),texture(field,a+texel),f.x),f.y);
    }`;
  const shaders = {
    advect: `
      uniform int strokes;
      uniform vec4 paths[8];
      uniform vec4 forces[8];
      uniform float opacities[8];
      void main() {
        vec2 v = sampleField(uv).xy;
        vec2 mid = uv - v * dt * .5 / aspect;
        vec4 old = sampleField(uv - sampleField(mid).xy * dt / aspect);
        vec2 velocity = old.xy * exp(-dt*2.1);
        float ink = old.z * exp(-dt*2.8);
        float opacityMass = old.w * exp(-dt*2.8);
        for (int i=0;i<8;i++) {
          if (i>=strokes) break;
          vec2 a=paths[i].xy*aspect, b=paths[i].zw*aspect;
          vec2 ab=b-a, p=uv*aspect;
          float t=clamp(dot(p-a,ab)/max(dot(ab,ab),.0000001),0.0,1.0);
          vec2 offset=p-(a+t*ab);
          float radius=forces[i].z;
          float brush=exp(-dot(offset,offset)/(radius*radius)*2.0);
          vec2 direction=normalize(ab+vec2(.000001));
          vec2 normal=vec2(-direction.y,direction.x);
          float side=dot(offset,normal)/radius;
          // A moving stroke imparts momentum to both sides; their shear curls the wake.
          velocity += forces[i].xy * brush * .22;
          velocity += normal * side * brush * forces[i].w * .12;
          float deposit=brush * forces[i].w * .24;
          float total=ink+deposit;
          opacityMass=(opacityMass+deposit*opacities[i])*min(1.0,1.5/max(total,.000001));
          ink=min(1.5,total);
        }
        // Decay follows elapsed seconds, never a fixed number of mouse events.
        if (ink<.0008) {ink=0.0;opacityMass=0.0;velocity*=.95;}
        // Carry each stroke's opacity through the flow, without brightening old slow strokes.
        color=vec4(clamp(velocity,vec2(-2.2),vec2(2.2)),ink,opacityMass);
      }`,
    curl: `
      void main() {
        float l=texture(field,uv-vec2(texel.x,0)).y;
        float r=texture(field,uv+vec2(texel.x,0)).y;
        float b=texture(field,uv-vec2(0,texel.y)).x;
        float t=texture(field,uv+vec2(0,texel.y)).x;
        color=vec4((r-l-t+b)*.5,0,0,1);
      }`,
    confine: `
      uniform sampler2D curlField;
      void main() {
        float l=abs(texture(curlField,uv-vec2(texel.x,0)).x);
        float r=abs(texture(curlField,uv+vec2(texel.x,0)).x);
        float b=abs(texture(curlField,uv-vec2(0,texel.y)).x);
        float t=abs(texture(curlField,uv+vec2(0,texel.y)).x);
        vec2 n=vec2(r-l,t-b);
        n/=length(n)+.00001;
        float c=texture(curlField,uv).x;
        vec4 state=texture(field,uv);
        state.xy+=vec2(n.y,-n.x)*c*dt*19.0;
        color=state;
      }`,
    divergence: `
      void main() {
        float l=texture(field,uv-vec2(texel.x,0)).x;
        float r=texture(field,uv+vec2(texel.x,0)).x;
        float b=texture(field,uv-vec2(0,texel.y)).y;
        float t=texture(field,uv+vec2(0,texel.y)).y;
        color=vec4((r-l+t-b)*.5,0,0,1);
      }`,
    pressure: `
      uniform sampler2D divergenceField;
      void main() {
        float l=texture(field,uv-vec2(texel.x,0)).x;
        float r=texture(field,uv+vec2(texel.x,0)).x;
        float b=texture(field,uv-vec2(0,texel.y)).x;
        float t=texture(field,uv+vec2(0,texel.y)).x;
        float div=texture(divergenceField,uv).x;
        color=vec4((l+r+b+t-div)*.25,0,0,1);
      }`,
    project: `
      uniform sampler2D pressureField;
      void main() {
        float l=texture(pressureField,uv-vec2(texel.x,0)).x;
        float r=texture(pressureField,uv+vec2(texel.x,0)).x;
        float b=texture(pressureField,uv-vec2(0,texel.y)).x;
        float t=texture(pressureField,uv+vec2(0,texel.y)).x;
        vec4 state=texture(field,uv);
        state.xy-=vec2(r-l,t-b)*.5;
        if(uv.x<texel.x||uv.x>1.0-texel.x) state.x=0.0;
        if(uv.y<texel.y||uv.y>1.0-texel.y) state.y=0.0;
        color=state;
      }`,
    film: `
      uniform sampler2D filmPrevious;
      uniform int strokes;
      uniform vec4 paths[8];
      uniform vec4 forces[8];
      uniform float opacities[8];
      uniform vec2 lineWidths;
      vec4 readFilm(vec2 p) {
        vec2 q=clamp(p,texel*.5,1.0-texel*.5)/texel-.5;
        vec2 a=(floor(q)+.5)*texel, f=fract(q);
        return mix(mix(texture(filmPrevious,a),texture(filmPrevious,a+vec2(texel.x,0)),f.x),
                   mix(texture(filmPrevious,a+vec2(0,texel.y)),texture(filmPrevious,a+texel),f.x),f.y);
      }
      void main() {
        vec2 v=sampleField(uv).xy;
        vec2 mid=uv-v*dt*.5/aspect;
        vec4 films=readFilm(uv-sampleField(mid).xy*dt/aspect)*exp(-dt*2.8);
        vec2 p=uv*aspect;
        for(int i=0;i<8;i++) {
          if(i>=strokes) break;
          vec2 a=paths[i].xy*aspect,b=paths[i].zw*aspect,ab=b-a;
          float t=clamp(dot(p-a,ab)/max(dot(ab,ab),.0000001),0.0,1.0);
          vec2 offset=p-(a+t*ab);
          // Independent spatial footprints: cyan 1/2, pale neutral 1/3.
          vec2 radii=max(forces[i].z*lineWidths,vec2(.00001));
          vec2 deposit=exp(-dot(offset,offset)/(radii*radii)*2.0)*forces[i].w*.24;
          float cyanTotal=films.x+deposit.x;
          films.y=(films.y+deposit.x*opacities[i])*min(1.0,1.5/max(cyanTotal,.000001));
          films.x=min(1.5,cyanTotal);
          float neutralTotal=films.z+deposit.y;
          films.w=(films.w+deposit.y*opacities[i])*min(1.0,1.5/max(neutralTotal,.000001));
          films.z=min(1.5,neutralTotal);
        }
        if(films.x<.0008) films.xy=vec2(0);
        if(films.z<.0008) films.zw=vec2(0);
        color=films;
      }`,
    light: `
      uniform bool displacementOutput;
      uniform vec2 opticalStep;
      uniform sampler2D filmField;
      uniform vec2 lineWidths;
      vec4 readFilm(vec2 p) {
        vec2 q=clamp(p,texel*.5,1.0-texel*.5)/texel-.5;
        vec2 a=(floor(q)+.5)*texel, f=fract(q);
        return mix(mix(texture(filmField,a),texture(filmField,a+vec2(texel.x,0)),f.x),
                   mix(texture(filmField,a+vec2(0,texel.y)),texture(filmField,a+texel),f.x),f.y);
      }
      float coverage(float h) {
        float aa=min(.012,fwidth(h));
        return smoothstep(.004-aa,.035+aa,h);
      }
      float lightAlpha(float h,vec2 slope,float opacity) {
        float edge=clamp(length(slope)*9.5,0.0,1.0);
        float fold=pow(edge,1.35);
        return (fold*.31+pow(edge,.6)*.018+h*.006)*coverage(h)*.24*opacity;
      }
      void main() {
        if(displacementOutput) {
          vec4 flow=sampleField(uv);
          // The half-width field limits image refraction without resizing the emitted light.
          vec4 lensField=readFilm(uv);
          float h=lensField.x;
          float opacity=clamp(lensField.y/max(h,.000001),0.0,1.0);
          vec2 refractionStep=opticalStep*.5;
          float l=readFilm(uv-vec2(refractionStep.x,0)).x;
          float r=readFilm(uv+vec2(refractionStep.x,0)).x;
          float b=readFilm(uv-vec2(0,refractionStep.y)).x;
          float t=readFilm(uv+vec2(0,refractionStep.y)).x;
          vec2 slope=vec2(r-l,t-b);
          float lens=smoothstep(.008,.08,h)*opacity;
          vec2 bend=clamp(slope*8.0+flow.xy*.045,vec2(-.38),vec2(.38))*lens;
          color=vec4(.5+bend.x,.5-bend.y,.5,1.0);
          return;
        }
        vec4 films=readFilm(uv);
        if(max(films.x,films.z)<.0008) {
          color=vec4(0.0);
          return;
        }
        float cyanOpacity=clamp(films.y/max(films.x,.000001),0.0,1.0);
        float neutralOpacity=clamp(films.w/max(films.z,.000001),0.0,1.0);
        // Sample over the same fraction of each footprint to preserve peak brightness.
        vec2 cyanStep=opticalStep*lineWidths.x;
        vec2 neutralStep=opticalStep*lineWidths.y;
        vec2 cyanSlope=vec2(
          readFilm(uv+vec2(cyanStep.x,0)).x-readFilm(uv-vec2(cyanStep.x,0)).x,
          readFilm(uv+vec2(0,cyanStep.y)).x-readFilm(uv-vec2(0,cyanStep.y)).x);
        vec2 neutralSlope=vec2(
          readFilm(uv+vec2(neutralStep.x,0)).z-readFilm(uv-vec2(neutralStep.x,0)).z,
          readFilm(uv+vec2(0,neutralStep.y)).z-readFilm(uv-vec2(0,neutralStep.y)).z);
        float h=sampleField(uv).z;
        float l=sampleField(uv-vec2(opticalStep.x,0)).z;
        float r=sampleField(uv+vec2(opticalStep.x,0)).z;
        float b=sampleField(uv-vec2(0,opticalStep.y)).z;
        float t=sampleField(uv+vec2(0,opticalStep.y)).z;
        vec2 slope=vec2(r-l,t-b);
        float interference=.5+.5*cos(h*6.8+atan(slope.y,slope.x)*.65+.25);
        float cyanAlpha=lightAlpha(films.x,cyanSlope,cyanOpacity)*interference;
        float neutralAlpha=lightAlpha(films.z,neutralSlope,neutralOpacity)*(1.0-interference);
        // Premultiplied compositing keeps both components transparent.
        vec3 rgb=vec3(0.0,1.0,1.0)*cyanAlpha+
          vec3(.66,.80,1.0)*neutralAlpha*(1.0-cyanAlpha);
        float alpha=cyanAlpha+neutralAlpha*(1.0-cyanAlpha);
        color=vec4(rgb,alpha);
      }`
  };

  const programs = new Map(), textures = [], framebuffers = [];
  function compile(type, source) {
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
      const message=gl.getShaderInfoLog(shader);
      gl.deleteShader(shader); throw new Error(message);
    }
    return shader;
  }
  try {
    const vs=compile(gl.VERTEX_SHADER,vertex);
    for (const [name,body] of Object.entries(shaders)) {
      const fs=compile(gl.FRAGMENT_SHADER,common+body);
      const program=gl.createProgram();
      gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
      gl.deleteShader(fs);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      const uniforms=new Map();
      programs.set(name,{program,uniforms});
    }
    gl.deleteShader(vs);
  } catch(error) {
    for(const {program} of programs.values()) gl.deleteProgram(program);
    // Unsupported drivers leave the ordinary page and cursor usable.
    return;
  }

  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  document.body.append(canvas);
  const ns='http://www.w3.org/2000/svg';
  let svg=null,filterDefinitions=null,mapCanvas=null,mapContext=null;
  let mapBuffer=null,mapPixels=null,mapImageData=null,mapWidth=0,mapHeight=0;
  let nextFilterId=0;
  const mediaFilters=new Map();
  function makeSvg(tag,attrs={}) {
    const node=document.createElementNS(ns,tag);
    for(const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
    return node;
  }
  function createRefraction() {
    svg=makeSvg('svg',{'aria-hidden':'true',width:'1',height:'1'});
    svg.style.cssText='position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none';
    filterDefinitions=makeSvg('defs');svg.append(filterDefinitions);document.body.append(svg);
    mapCanvas=document.createElement('canvas');mapContext=mapCanvas.getContext('2d');
  }
  function releaseMediaFilter(element,binding) {
    if(element.style.getPropertyValue('filter')===binding.applied) {
      if(binding.original) element.style.setProperty('filter',binding.original,binding.priority);
      else element.style.removeProperty('filter');
    }
    binding.filter.remove();
    mediaFilters.delete(element);
  }
  function clearRefraction() {
    for(const [element,binding] of mediaFilters) releaseMediaFilter(element,binding);
  }
  function applyRefraction(mapUrl) {
    const keep=new Set();
    const selector='.portfolio-image,.portfolio-video,.opening-video,.interaction-photo';
    for(const element of document.querySelectorAll(selector)) {
      // The emitted light is a separate overlay and must never be refracted.
      if(element===canvas||element.id==='optical-flow'||element.tagName==='CANVAS') continue;
      const rect=element.getBoundingClientRect();
      if(rect.width<1||rect.height<1||rect.right<=0||rect.left>=width||rect.bottom<=0||rect.top>=height) continue;
      const style=getComputedStyle(element);
      if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0) continue;
      const localWidth=parseFloat(style.width)||element.offsetWidth||rect.width;
      const localHeight=parseFloat(style.height)||element.offsetHeight||rect.height;
      const sx=rect.width/localWidth,sy=rect.height/localHeight;
      if(!Number.isFinite(sx)||!Number.isFinite(sy)||sx<=0||sy<=0) continue;
      let binding=mediaFilters.get(element);
      if(!binding) {
        const id='optical-media-refraction-'+(++nextFilterId);
        const filter=makeSvg('filter',{id,filterUnits:'userSpaceOnUse',primitiveUnits:'userSpaceOnUse',
          x:'0',y:'0','color-interpolation-filters':'sRGB'});
        const image=makeSvg('feImage',{result:'flow',preserveAspectRatio:'none'});
        const displace=makeSvg('feDisplacementMap',{in:'SourceGraphic',in2:'flow',
          xChannelSelector:'R',yChannelSelector:'G'});
        filter.append(image,displace);filterDefinitions.append(filter);
        const original=element.style.getPropertyValue('filter');
        const priority=element.style.getPropertyPriority('filter');
        const base=style.filter&&style.filter!=='none'?style.filter+' ':'';
        const applied=base+'url("#'+id+'")';
        binding={filter,image,displace,original,priority,applied};
        mediaFilters.set(element,binding);
        element.style.setProperty('filter',applied,priority);
      }
      // Explicit pixel coordinates keep the viewport map aligned with each real media element.
      binding.filter.setAttribute('width',String(localWidth));
      binding.filter.setAttribute('height',String(localHeight));
      binding.image.setAttribute('x',String(-rect.left/sx));
      binding.image.setAttribute('y',String(-rect.top/sy));
      binding.image.setAttribute('width',String(width/sx));
      binding.image.setAttribute('height',String(height/sy));
      binding.image.setAttribute('href',mapUrl);
      binding.displace.setAttribute('scale',String(24/Math.max(sx,sy)));
      keep.add(element);
    }
    for(const [element,binding] of mediaFilters) {
      if(!keep.has(element)) releaseMediaFilter(element,binding);
    }
  }
  createRefraction();

  let fieldRead,fieldWrite,curlTarget,divTarget,pressureRead,pressureWrite,filmRead,filmWrite;
  let width=0,height=0,simWidth=0,simHeight=0,frame=0,lastFrame=0,lastMove=-Infinity;
  let lastMap=-Infinity,previous=null,queue=[],destroyed=false;
  const strokePaths=new Float32Array(32),strokeForces=new Float32Array(32);
  const strokeOpacities=new Float32Array(8);
  function target(w,h,byte=false) {
    const texture=gl.createTexture(); textures.push(texture);
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,byte?gl.RGBA8:gl.RGBA16F,w,h,0,gl.RGBA,byte?gl.UNSIGNED_BYTE:gl.HALF_FLOAT,null);
    const fbo=gl.createFramebuffer();framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) throw new Error('Optical flow framebuffer unavailable');
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    return {texture,fbo,w,h};
  }
  function disposeTargets() {
    for(const texture of textures) gl.deleteTexture(texture);
    for(const fbo of framebuffers) gl.deleteFramebuffer(fbo);
    textures.length=0;framebuffers.length=0;
  }
  function resize() {
    if(destroyed) return;
    stop();disposeTargets();
    width=innerWidth;height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    const scale=Math.min(1,704/Math.max(width,height));
    simWidth=Math.max(32,Math.round(width*scale));
    simHeight=Math.max(32,Math.round(height*scale));
    try {
      fieldRead=target(simWidth,simHeight);fieldWrite=target(simWidth,simHeight);
      curlTarget=target(simWidth,simHeight);divTarget=target(simWidth,simHeight);
      pressureRead=target(simWidth,simHeight);pressureWrite=target(simWidth,simHeight);
      filmRead=target(simWidth,simHeight);filmWrite=target(simWidth,simHeight);
      if(svg) {
        mapWidth=Math.min(width,512);mapHeight=Math.max(32,Math.round(mapWidth*height/width));
        mapBuffer=target(mapWidth,mapHeight,true);
        mapCanvas.width=mapWidth;mapCanvas.height=mapHeight;
        mapPixels=new Uint8Array(mapWidth*mapHeight*4);
        mapImageData=mapContext.createImageData(mapWidth,mapHeight);
        mapImageData.data.fill(128);
        for(let i=3;i<mapImageData.data.length;i+=4) mapImageData.data[i]=255;
        mapContext.putImageData(mapImageData,0,0);
      }
    } catch(error) {destroy();}
  }
  let current;
  function uniform(name) {
    if(!current.uniforms.has(name)) current.uniforms.set(name,gl.getUniformLocation(current.program,name));
    return current.uniforms.get(name);
  }
  function bind(name,texture,unit) {
    gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.uniform1i(uniform(name),unit);
  }
  function use(name,output,step) {
    current=programs.get(name);gl.useProgram(current.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER,output?output.fbo:null);
    gl.viewport(0,0,output?output.w:canvas.width,output?output.h:canvas.height);
    gl.uniform2f(uniform('texel'),1/simWidth,1/simHeight);
    const referenceScale=Math.min(1,352/Math.max(width,height));
    gl.uniform2f(uniform('opticalStep'),1/Math.max(32,Math.round(width*referenceScale)),1/Math.max(32,Math.round(height*referenceScale)));
    gl.uniform2f(uniform('aspect'),width/height,1);
    gl.uniform1f(uniform('dt'),step);
    bind('field',fieldRead.texture,0);
    gl.uniform2f(uniform('lineWidths'),.5,1/3);
    if(name==='light') bind('filmField',filmRead.texture,1);
  }
  const draw=()=>gl.drawArrays(gl.TRIANGLES,0,3);
  function uploadStrokes(count) {
    gl.uniform1i(uniform('strokes'),count);
    gl.uniform4fv(uniform('paths[0]'),strokePaths);
    gl.uniform4fv(uniform('forces[0]'),strokeForces);
    gl.uniform1fv(uniform('opacities[0]'),strokeOpacities);
  }
  function renderMap(now) {
    if(!svg || now-lastMap<40) return;
    lastMap=now;
    use('light',mapBuffer,0);gl.uniform1i(uniform('displacementOutput'),1);draw();
    gl.readPixels(0,0,mapWidth,mapHeight,gl.RGBA,gl.UNSIGNED_BYTE,mapPixels);
    const stride=mapWidth*4;
    for(let row=0;row<mapHeight;row++) {
      mapImageData.data.set(mapPixels.subarray((mapHeight-1-row)*stride,(mapHeight-row)*stride),row*stride);
    }
    mapContext.putImageData(mapImageData,0,0);
    applyRefraction(mapCanvas.toDataURL('image/png'));
  }
  function tick(now) {
    frame=0;
    if(destroyed || document.hidden || reduced.matches || now-lastMove>1550) {stop();return;}
    const elapsed=Math.min(.035,Math.max(.005,(now-(lastFrame||now-16.7))/1000));
    lastFrame=now;
    const items=queue.splice(0,8);
    strokePaths.fill(0);strokeForces.fill(0);strokeOpacities.fill(0);
    items.forEach((s,i)=>{
      strokePaths.set([s.ax,s.ay,s.bx,s.by],i*4);
      strokeForces.set([s.vx,s.vy,s.radius,s.strength],i*4);
      strokeOpacities[i]=s.opacity;
    });
    use('film',filmWrite,elapsed);bind('filmPrevious',filmRead.texture,1);
    uploadStrokes(items.length);draw();
    [filmRead,filmWrite]=[filmWrite,filmRead];
    use('advect',fieldWrite,elapsed);uploadStrokes(items.length);draw();
    [fieldRead,fieldWrite]=[fieldWrite,fieldRead];
    use('curl',curlTarget,elapsed);draw();
    use('confine',fieldWrite,elapsed);bind('curlField',curlTarget.texture,1);draw();
    [fieldRead,fieldWrite]=[fieldWrite,fieldRead];
    use('divergence',divTarget,elapsed);draw();
    // A warm pressure field converges quickly at this deliberately small simulation size.
    for(let i=0;i<6;i++) {
      use('pressure',pressureWrite,elapsed);bind('field',pressureRead.texture,0);
      bind('divergenceField',divTarget.texture,1);draw();
      [pressureRead,pressureWrite]=[pressureWrite,pressureRead];
    }
    use('project',fieldWrite,elapsed);bind('pressureField',pressureRead.texture,1);draw();
    [fieldRead,fieldWrite]=[fieldWrite,fieldRead];
    renderMap(now);
    use('light',null,elapsed);gl.uniform1i(uniform('displacementOutput'),0);draw();
    canvas.style.visibility='visible';
    frame=requestAnimationFrame(tick);
  }
  function stop() {
    if(frame) cancelAnimationFrame(frame);
    frame=0;lastFrame=0;previous=null;queue.length=0;
    canvas.style.visibility='hidden';
    clearRefraction();lastMap=-Infinity;
    if(fieldRead && !gl.isContextLost()) {
      for(const state of [fieldRead,fieldWrite,pressureRead,pressureWrite,filmRead,filmWrite]) {
        if(!state) continue;
        gl.bindFramebuffer(gl.FRAMEBUFFER,state.fbo);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }
  }
  function pointer(event) {
    if(destroyed||reduced.matches||!fine.matches||!event.isPrimary||event.pointerType==='touch') return;
    const now=performance.now();
    const p={x:event.clientX/width,y:1-event.clientY/height,time:now};
    if(previous) {
      const ms=now-previous.time;
      const dx=(p.x-previous.x)*width,dy=(p.y-previous.y)*height;
      const distance=Math.hypot(dx,dy);
      if(ms>0&&ms<180&&distance>.2) {
        const seconds=Math.max(ms,1)/1000;
        const speed=distance/seconds;
        // Small movements create no new wake; any existing wake can finish fading.
        if(speed<=180) {previous=p;return;}
        const strength=Math.min(1.5,Math.max(.10,speed/1800));
        const segment=speed<650?(speed-180)/470:(speed-650)/550;
        const speedMix=Math.max(0,Math.min(1,segment));
        const eased=speedMix*speedMix*(3-2*speedMix);
        const opacity=speed<650?.15*eased:.15+.60*eased;
        const radius=Math.min(84,24+Math.sqrt(speed)*.9)/height;
        queue.push({ax:previous.x,ay:previous.y,bx:p.x,by:p.y,
          vx:Math.max(-2,Math.min(2,dx/seconds/height)),
          vy:Math.max(-2,Math.min(2,dy/seconds/height)),radius,strength,opacity});
        // Coalesce bursts without deleting an already-rendered trail.
        if(queue.length>8) {
          const first=queue.shift();queue[0].ax=first.ax;queue[0].ay=first.ay;
        }
        lastMove=now;
        if(!frame) frame=requestAnimationFrame(tick);
      }
    }
    previous=p;
  }
  function visibility() {if(document.hidden) stop();}
  function changed() {if(reduced.matches||!fine.matches) stop();}
  function leave(event) {if(!event.relatedTarget) previous=null;}
  function destroy() {
    if(destroyed) return;
    stop();destroyed=true;disposeTargets();
    for(const {program} of programs.values()) gl.deleteProgram(program);
    gl.deleteVertexArray(vao);
    canvas.remove();svg?.remove();
    window.removeEventListener('pointermove',pointer);
    window.removeEventListener('resize',resize);
    window.removeEventListener('blur',stop);
    window.removeEventListener('pointerout',leave);
    document.removeEventListener('visibilitychange',visibility);
    reduced.removeEventListener?.('change',changed);fine.removeEventListener?.('change',changed);
  }
  canvas.addEventListener('webglcontextlost',destroy,{once:true});
  window.addEventListener('pointermove',pointer,{passive:true});
  window.addEventListener('pointerout',leave,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('blur',stop);
  document.addEventListener('visibilitychange',visibility);
  reduced.addEventListener?.('change',changed);fine.addEventListener?.('change',changed);
  resize();
})();
