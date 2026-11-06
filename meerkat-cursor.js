(() => {
  'use strict';
  const fine=window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const root=document.createElement('div');
  root.id='meerkat-cursor';root.setAttribute('aria-hidden','true');
  const facing=document.createElement('div');facing.className='meerkat-facing';
  const pose=document.createElement('div');pose.className='meerkat-pose';
  const body=document.createElement('div');body.className='meerkat-body meerkat-part';
  const source='Cursor/Cursor%20Source.webp';
  const img=new Image();img.alt='';img.draggable=false;img.src=source;
  body.append(img);facing.append(body);pose.append(facing);root.append(pose);document.body.append(root);
  let ready=false,active=false,last=null,pending=0,x=0,y=0,direction=1,tilt=0,targetTilt=0,previousFrame=0;
  function hide(){active=false;root.classList.remove('is-visible');document.documentElement.classList.remove('meerkat-cursor-active');last=null;previousFrame=0;if(pending){cancelAnimationFrame(pending);pending=0;}}
  function paint(now){
    pending=0;
    const dt=previousFrame?Math.min(now-previousFrame,64):16.67;previousFrame=now;
    let delta=((targetTilt-tilt+540)%360+360)%360-180;
    if(Math.abs(delta)<.05)tilt+=delta;
    else tilt+=delta*(1-Math.exp(-dt/65));
    root.style.transform=`translate3d(${x}px,${y}px,0)`;
    facing.style.transform=`scaleX(${direction})`;
    pose.style.transform=`rotate(${tilt}deg)`;
    root.dataset.tilt=String(tilt);root.dataset.targetTilt=String(targetTilt);
    root.dataset.direction=direction===1?'right':'left';
    if(active&&Math.abs(delta)>=.05)pending=requestAnimationFrame(paint);else previousFrame=0;
  }
  function schedule(){if(!pending)pending=requestAnimationFrame(paint);}
  function move(e){
    if(!ready||!fine.matches||e.pointerType==='touch'){hide();return;}
    if(e.target instanceof Element&&e.target.closest('iframe')){hide();return;}
    x=e.clientX-11.333;y=e.clientY-24.4835;
    if(last){const dx=e.clientX-last.x,dy=e.clientY-last.y;
      if(Math.abs(dx)>1.5)direction=dx>0?1:-1;
      if(Math.hypot(dx,dy)>1.5)targetTilt=Math.atan2(dy,Math.abs(dx))*180/Math.PI*direction;
    }
    last={x:e.clientX,y:e.clientY};active=true;
    root.classList.add('is-visible');document.documentElement.classList.add('meerkat-cursor-active');schedule();
  }
  function loaded(){ready=true;root.dataset.ready='true';}
  if(img.complete&&img.naturalWidth)loaded();else img.addEventListener('load',loaded,{once:true});
  img.addEventListener('error',hide);
  window.addEventListener('pointermove',move,{passive:true});
  document.documentElement.addEventListener('pointerleave',hide);
  window.addEventListener('blur',hide);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
  document.addEventListener('pointerover',e=>{if(e.target instanceof HTMLIFrameElement)hide();},{passive:true});
  document.addEventListener('keydown',e=>{if(e.key==='Tab')hide();});
  fine.addEventListener('change',hide);
})();