(() => {
  'use strict';
  const stage=document.querySelector('#intro .intro-visual');
  const media=stage?.querySelector('.opening-video');
  const canvas=stage?.querySelector('canvas');
  if(!stage||!media||!canvas)return;
  const paths=[[[426,50],[566,50],[557,128],[566,132],[566,135],[424,241],[415,241]],[[162,314],[206,327],[207,380],[235,395],[238,404],[196,432],[175,439],[147,427],[136,394],[139,383],[154,379],[142,343],[146,341],[156,347],[157,320]],[[294,450],[304,420],[317,410],[339,398],[345,385],[365,378],[394,390],[384,415],[382,441],[345,435],[318,440]],[[180,476],[269,425],[277,447],[292,505],[218,541],[197,550],[188,527]],[[487,422],[508,390],[515,387],[532,498],[499,551],[492,552],[492,515],[486,467]],[[615,496],[655,466],[649,447],[666,433],[713,419],[717,501],[722,505],[639,564],[621,541],[623,537]],[[263,534],[296,531],[307,486],[312,486],[329,511],[345,494],[349,496],[363,517],[368,517],[380,495],[392,523],[415,504],[406,536],[420,553],[408,551],[399,556],[390,574],[388,610],[355,565],[330,599],[315,563],[310,563],[286,585],[285,554]],[[239,568],[243,562],[264,589],[262,643],[233,657],[217,638],[214,627],[242,611]],[[438,552],[463,587],[459,609],[459,633],[434,660],[423,669],[423,626],[418,624],[397,626],[397,615],[422,596],[432,564]],[[392,637],[412,635],[415,653],[411,674],[394,697],[366,708],[363,690],[379,686],[381,675],[364,667],[375,651],[387,662],[397,651]],[[389,773],[404,760],[405,755],[399,744],[398,736],[403,728],[414,722],[411,713],[412,706],[421,696],[429,691],[427,682],[430,672],[441,660],[456,655],[462,663],[465,675],[465,683],[455,695],[462,700],[467,713],[468,724],[466,737],[459,743],[463,750],[464,763],[460,771],[453,775],[455,785],[452,803],[445,811],[436,816],[422,783],[418,781],[409,784],[400,785],[395,783]],[[486,638],[521,600],[526,600],[531,690],[535,695],[488,803],[484,807],[479,799],[485,788],[489,718],[490,665]],[[737,660],[762,644],[764,644],[756,701],[712,703],[702,818],[731,817],[735,822],[716,911],[723,927],[732,934],[737,930],[740,913],[745,913],[754,944],[731,1032],[744,1064],[799,1064],[798,733],[742,658]],[[109,836],[135,811],[152,818],[132,844]],[[164,820],[197,790],[228,805],[228,813],[222,826],[214,834],[192,841],[190,835]],[[261,788],[266,781],[282,795],[284,830],[313,836],[304,850],[264,841]],[[369,819],[373,815],[383,821],[407,829],[408,851],[410,870],[377,854]],[[416,904],[436,860],[460,898],[456,958],[445,939]],[[475,900],[482,876],[485,877],[491,895],[483,913]],[[480,924],[502,907],[517,918],[507,930],[491,939]],[[263,24],[271,23],[314,44],[317,65],[311,71],[266,54]],[[304,87],[315,76],[321,78],[329,91],[329,153],[312,149],[315,137],[313,114],[291,111],[285,115],[272,111],[267,105],[268,95],[277,89]],[[320,165],[325,165],[331,210],[336,219],[344,248],[329,262],[316,284],[305,305],[301,302],[300,274],[294,249],[281,230],[294,210],[303,201]],[[352,163],[373,166],[388,188],[386,219],[381,219],[375,193],[369,176]],[[544,178],[551,170],[557,151],[560,121],[565,112],[574,105],[584,103],[602,115],[607,128],[603,161],[603,177],[610,185],[593,177],[577,177],[559,182],[556,188],[543,188]],[[673,73],[683,73],[728,87],[724,146],[728,151],[729,162],[734,165],[717,180],[654,154],[653,147],[660,136],[670,131]],[[662,235],[665,231],[674,221],[682,220],[692,222],[698,228],[702,240],[702,250],[698,261],[701,265],[689,261],[663,244],[660,239]],[[567,235],[571,232],[578,237],[633,254],[631,274],[635,277],[677,290],[670,329],[638,335],[639,357],[572,314],[566,315]],[[799,73],[802,73],[802,85],[817,115],[821,133],[828,140],[824,153],[819,169],[811,183],[811,192],[816,199],[813,202],[822,222],[832,236],[825,249],[817,278],[811,300],[793,319],[789,318],[790,304],[787,301],[787,263],[789,255],[787,242],[790,231],[787,223],[792,211],[780,188],[783,173],[780,167],[782,161],[778,154],[780,147],[778,136],[774,115]],[[146,424],[165,449],[173,449],[176,439],[187,430],[195,412],[205,400],[219,388],[230,384],[241,384],[250,389],[270,392],[287,382],[296,381],[302,394],[299,408],[307,419],[320,423],[329,431],[326,489],[316,498],[298,501],[284,498],[273,492],[267,481],[264,473],[260,474],[222,508],[211,508],[209,500],[203,495],[201,508],[194,499],[190,504],[188,514],[181,509],[178,514],[173,509],[167,503],[164,514],[158,514],[151,501],[146,512],[138,503],[128,495],[125,483],[127,466],[137,455],[132,447],[132,431]],[[174,523],[220,574],[247,543],[271,523],[280,523],[307,569],[322,535],[326,534],[331,572],[330,633],[291,609],[275,636],[267,644],[248,630],[227,649],[213,645],[201,635],[137,705],[108,677],[78,630],[109,567],[115,564],[150,597],[155,597]],[[567,364],[577,372],[586,388],[592,406],[607,455],[607,466],[604,470],[598,462],[533,432],[534,385],[541,389],[564,410],[567,409]],[[605,385],[617,381],[630,394],[636,384],[645,381],[655,383],[664,366],[671,366],[678,373],[679,381],[677,394],[666,397],[666,417],[662,422],[654,422],[648,436],[634,447],[624,436],[606,432],[602,426],[611,413],[605,406],[604,394]],[[840,383],[844,391],[840,399],[843,410],[832,416],[827,432],[826,438],[809,454],[798,460],[794,449],[794,440],[801,437],[805,425],[807,407]],[[459,452],[465,457],[471,472],[487,487],[502,498],[506,542],[502,543],[466,507],[461,499],[460,471]],[[803,530],[797,519],[796,507],[802,498],[814,490],[827,486],[837,488],[846,493],[851,504],[851,517],[845,526],[840,532],[848,542],[850,548],[846,560],[832,573],[820,582],[808,585],[793,584],[784,578],[780,570],[780,558],[783,546],[791,537]],[[124,744],[167,759],[171,757],[194,722],[200,725],[196,760],[231,769],[233,774],[193,783],[190,786],[214,814],[209,820],[181,800],[179,805],[177,836],[170,838],[158,798],[139,809],[126,813],[125,810],[151,773],[150,769],[122,750]],[[325,708],[329,708],[330,723],[322,804],[325,819],[320,826],[300,782],[290,776]],[[435,800],[438,789],[453,767],[473,747],[493,739],[510,732],[520,733],[527,739],[527,785],[523,792],[504,792],[489,795],[475,802],[463,810],[451,824],[441,839],[438,838]],[[758,692],[786,695],[782,719],[786,723],[817,723],[822,729],[813,751],[788,747],[783,751],[777,793],[771,796],[743,789],[744,779],[750,760],[751,746],[746,743],[711,740],[715,713],[752,719],[757,714]],[[606,593],[634,602],[663,612],[675,620],[686,633],[694,635],[694,642],[679,647],[668,659],[661,669],[662,680],[668,694],[662,698],[659,720],[660,731],[675,762],[681,778],[678,782],[667,783],[662,766],[653,750],[630,724],[613,707],[635,666],[639,644],[636,629],[616,605]],[[602,775],[610,775],[748,851],[755,851],[765,876],[776,916],[784,940],[791,945],[770,983],[723,970],[744,934],[744,929],[732,920],[719,894],[706,876],[677,868],[589,810],[589,804]],[[463,866],[463,889],[469,893],[484,892],[489,886],[477,864],[480,859],[516,860],[520,866],[499,891],[500,896],[515,911],[533,886],[540,888],[546,927],[537,930],[517,925],[534,950],[528,951],[515,966],[507,962],[504,935],[499,938],[488,951],[489,957],[497,967],[495,974],[460,978],[454,973],[472,952],[469,945],[458,932],[454,952],[444,953],[432,937],[431,929],[449,921],[452,913],[453,900],[429,888],[429,884]],[[563,857],[577,849],[633,850],[642,866],[640,876],[630,886],[630,895],[635,902],[635,932],[638,947],[634,959],[626,970],[613,979],[600,985],[579,988],[566,982],[556,974],[551,963],[549,948],[554,930],[560,921],[571,912],[573,907],[567,891],[561,886],[555,873],[555,866]],[[243,922],[247,918],[256,918],[312,930],[307,1040],[302,1038],[291,1044],[278,1043],[266,1039],[253,1027],[244,1015]],[[73,107],[85,108],[143,82],[153,77],[164,76],[175,78],[188,84],[197,92],[198,99],[194,107],[183,114],[169,116],[118,113],[90,123],[83,124],[75,120],[72,114]],[[238,119],[253,119],[263,121],[272,125],[274,134],[269,143],[258,151],[250,155],[247,164],[244,151],[241,149],[243,143],[236,124]],[[404,65],[407,65],[411,78],[415,77],[420,69],[423,70],[424,81],[417,92],[417,103],[422,113],[416,114],[408,109],[398,112],[404,98],[405,91],[401,78]],[[434,70],[487,54],[491,59],[491,68],[484,76],[492,81],[491,87],[480,93],[490,96],[490,101],[432,111]],[[521,74],[528,73],[538,82],[545,79],[557,71],[564,69],[568,73],[566,80],[558,97],[554,109],[557,122],[554,127],[548,130],[540,111],[512,103],[527,86],[522,80]],[[652,72],[665,65],[675,55],[683,60],[698,62],[695,70],[696,77],[702,85],[701,88],[690,88],[682,94],[679,109],[674,110],[655,103],[656,99],[662,91],[662,80],[658,71]],[[127,180],[132,165],[141,156],[154,153],[168,154],[181,160],[190,171],[196,181],[200,196],[207,217],[218,234],[231,244],[244,242],[251,246],[255,252],[258,261],[253,270],[239,277],[232,279],[224,275],[218,264],[189,251],[174,246],[154,243],[140,243],[129,248],[116,244],[105,237],[99,230],[96,218],[99,205],[106,197],[123,189],[128,185]],[[86,303],[163,334],[163,384],[149,391],[88,362],[85,358]],[[240,332],[242,321],[248,314],[256,309],[263,310],[270,317],[273,330],[275,334],[285,338],[292,348],[296,363],[294,376],[288,386],[272,395],[253,396],[235,392],[223,387],[217,378],[216,366],[219,354],[229,340]],[[458,278],[495,264],[504,274],[507,271],[513,276],[513,279],[523,282],[526,288],[443,325],[437,324],[447,310]],[[534,264],[541,260],[549,260],[553,265],[552,270],[561,267],[563,257],[572,253],[580,255],[588,260],[593,271],[605,299],[603,305],[553,321],[540,320],[538,314],[540,307],[532,286],[532,271]],[[558,226],[585,216],[595,216],[631,230],[636,231],[641,235],[625,254],[616,258],[613,252],[557,233]],[[381,357],[404,361],[427,354],[433,357],[400,395],[398,401],[391,399],[392,386],[385,365],[379,364]],[[525,389],[531,376],[540,367],[552,360],[563,358],[576,362],[582,367],[585,380],[589,388],[594,407],[539,432]],[[410,432],[433,421],[439,421],[456,446],[456,454],[423,471],[417,471],[409,437]],[[68,464],[83,445],[110,425],[124,425],[138,430],[145,439],[151,453],[156,468],[154,480],[155,500],[162,516],[170,532],[171,549],[163,564],[157,566],[143,550],[109,535],[84,522],[74,511],[68,491],[66,477]],[[205,471],[214,461],[225,457],[237,461],[249,474],[258,472],[267,459],[275,453],[284,456],[292,463],[299,477],[297,494],[290,507],[280,515],[264,516],[253,511],[240,508],[231,512],[215,509],[207,502],[203,485]],[[250,550],[260,555],[273,573],[280,587],[287,590],[330,561],[365,576],[368,582],[293,629],[284,641],[273,648],[258,651],[242,632],[224,602],[225,595],[251,560],[253,556]],[[142,606],[169,627],[170,632],[157,646],[151,646],[127,627],[128,621]],[[182,660],[197,641],[234,664],[234,680],[217,695],[195,700],[182,689],[177,678],[181,670]],[[497,559],[504,550],[517,548],[532,554],[543,566],[554,586],[564,605],[578,619],[589,634],[603,647],[615,665],[628,677],[633,699],[634,720],[619,737],[598,752],[577,761],[556,759],[543,753],[529,739],[519,724],[512,709],[504,681],[498,653],[494,627],[492,604],[492,580]],[[556,530],[609,557],[615,592],[621,595],[622,605],[618,608],[567,575],[564,577]],[[72,848],[87,838],[95,819],[111,801],[128,780],[157,788],[171,782],[175,785],[157,805],[171,807],[182,801],[186,805],[167,827],[169,832],[185,830],[195,824],[199,828],[190,841],[174,855],[161,857],[153,865],[134,871],[121,869],[103,859],[86,850],[72,850]],[[505,785],[512,778],[540,801],[545,811],[532,891],[529,894],[454,904],[432,871],[434,866],[494,853]],[[603,773],[639,749],[643,753],[666,771],[666,776],[672,778],[672,814],[669,821],[675,824],[661,837],[635,831],[611,808],[604,806],[601,798],[601,780]],[[553,903],[564,885],[575,879],[583,879],[598,882],[612,891],[622,905],[628,923],[631,946],[627,957],[613,978],[607,976],[607,958],[602,956],[595,962],[595,945],[583,947],[586,929],[565,925],[566,916],[570,908]],[[646,925],[679,869],[683,868],[688,880],[697,919],[691,925],[679,923],[676,929],[673,943],[677,955],[672,975],[668,981],[664,980],[653,955],[649,944],[649,922]]];
  // Hand-traced silhouettes from the newly supplied opening artwork.
  paths.push(...[[[665,73],[668,55],[675,52],[678,72],[691,72],[688,52],[707,50],[709,65],[708,89],[701,91],[697,106],[690,107],[688,93],[681,87],[678,104],[672,106],[670,88],[663,77]],[[311,137],[320,121],[331,102],[337,99],[342,100],[351,110],[362,122],[371,135],[377,145],[374,152],[368,154],[361,151],[355,157],[349,149],[341,149],[337,159],[331,159],[325,155],[320,162],[315,160],[311,156]],[[541,194],[548,181],[561,169],[573,159],[588,156],[603,156],[615,162],[625,168],[628,179],[624,191],[611,201],[598,205],[584,213],[568,217],[553,217],[544,212],[540,204]],[[221,272],[234,260],[243,252],[249,252],[256,261],[262,272],[249,281],[235,292]],[[356,210],[365,195],[377,176],[382,176],[392,201],[401,225],[410,251],[417,279],[421,305],[426,340],[433,374],[439,397],[443,411],[440,415],[436,412],[429,392],[419,369],[407,338],[396,309],[385,276],[373,249],[361,224]],[[498,207],[510,216],[528,231],[549,248],[564,260],[562,278],[557,301],[551,330],[535,316],[514,292],[490,272],[479,269],[489,249]],[[589,237],[601,258],[616,263],[621,278],[614,289],[630,307],[614,315],[593,323],[566,328],[581,291],[572,286],[570,278]],[[331,282],[340,277],[347,282],[352,278],[355,295],[365,311],[373,323],[376,332],[372,350],[366,360],[349,363],[335,362],[325,358],[321,346],[323,330],[329,305]],[[83,432],[92,427],[107,429],[110,457],[114,468],[131,466],[147,469],[152,477],[154,506],[149,515],[136,512],[132,499],[124,500],[120,516],[108,516],[92,510]],[[250,366],[258,362],[270,363],[277,370],[277,378],[270,388],[266,393],[264,416],[262,440],[260,461],[265,474],[271,489],[270,500],[259,502],[240,498],[233,493],[237,476],[246,473],[250,451],[253,428],[257,393],[251,387],[248,378]],[[96,547],[108,541],[127,540],[138,547],[151,562],[153,578],[144,593],[136,599],[119,580],[105,561]],[[368,503],[377,505],[382,516],[384,533],[380,554],[396,531],[405,529],[413,533],[420,545],[418,557],[407,574],[426,574],[441,576],[449,582],[445,591],[423,600],[436,606],[438,625],[426,627],[408,618],[388,591],[391,608],[388,632],[380,642],[374,638],[370,625],[367,592],[354,617],[340,628],[335,625],[334,610],[339,590],[348,574],[333,572],[324,557],[325,540],[330,536],[340,543],[354,560],[353,529],[359,509]],[[135,663],[144,650],[155,649],[165,638],[173,640],[177,648],[174,663],[187,667],[195,679],[194,688],[185,695],[174,689],[169,705],[161,711],[151,700],[148,691],[139,683]],[[331,658],[352,681],[377,707],[360,739],[329,788]],[[453,729],[464,737],[471,762],[475,731],[477,724],[485,729],[495,753],[495,777],[504,809],[515,845],[505,844],[497,837],[485,837],[468,840],[450,852],[436,879],[432,867],[423,842],[416,815],[412,789],[413,769],[419,760],[431,764],[440,776],[444,771],[441,751],[442,733]],[[134,807],[160,804],[185,801],[202,842],[221,878],[180,914],[107,912],[121,897],[101,889],[101,881],[130,870]],[[336,833],[351,819],[377,800],[386,821],[405,843],[386,860],[368,880],[351,860]],[[589,865],[598,876],[616,881],[635,878],[640,889],[652,899],[674,904],[676,928],[682,941],[693,944],[686,953],[670,961],[666,971],[646,976],[618,975],[596,967],[580,954],[582,933],[588,907],[592,886],[584,883]]]);
  const settings={speed:0.7,glow:1.6,pixels:1.5,tail:0.65};
  const W=1400,H=384,BINS=24;
  const display=canvas.getContext('2d');
  const buffer=document.createElement('canvas'),ctx=buffer.getContext('2d');
  const halo=document.createElement('canvas'),hctx=halo.getContext('2d');
  let running=false,visible=false,raf=0,last=0,time=0,hits=0,bounces=0,nextNudge=20,autoMoves=0;
  let pointer=null,pendingPointer=null;
  const colors=Array.from({length:BINS},(_,i)=>{const q=Math.pow((i+.5)/BINS,.65);return `rgba(${Math.round(20+38*q)},${Math.round(170+60*q)},${Math.round(195+55*q)},${.48+.52*q})`;});
  const shapes=paths.map((points,index)=>{
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const scale=Math.min(.40,70/Math.max(maxX-minX,maxY-minY));
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    const pts=points.map(p=>[(p[0]-cx)*scale,(p[1]-cy)*scale]);
    const segments=[],sparks=[];let length=0;
    pts.forEach((a,i)=>{
      const b=pts[(i+1)%pts.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),count=Math.max(1,Math.ceil(len/2));
      for(let j=0;j<count;j++){const f=j/count,g=(j+1)/count;segments.push(a[0]+dx*f,a[1]+dy*f,a[0]+dx*g,a[1]+dy*g,length+len*(f+g)/2);}
      const angle=Math.atan2(dy,dx)+Math.PI/2;
      for(let d=0;d<len;d+=7){const hash=Math.sin((length+d)*7.123+index*19.37)*43758.5453,seed=hash-Math.floor(hash),off=(seed-.5)*8;sparks.push(a[0]+dx*d/len+Math.cos(angle)*off,a[1]+dy*d/len+Math.sin(angle)*off,length+d,seed>.76?2.6:1.4);}
      length+=len;
    });
    const driftX=Math.cos(index*2.399)*9,driftY=Math.sin(index*2.399)*8;
    return {segments:new Float32Array(segments),sparks:new Float32Array(sparks),length,phase:index*.173,flow:.82+(index%5)*.1,x:(index%15+.5)*W/15,y:(Math.floor(index/15)+.5)*H/6,vx:driftX,vy:driftY,driftX,driftY,halfW:(maxX-minX)*scale/2+13,halfH:(maxY-minY)*scale/2+13,collisionHalfW:(maxX-minX)*scale/2+2,collisionHalfH:(maxY-minY)*scale/2+2,angle:0,spin:0,cos:1,sin:0,lastHit:-1,collidesWithNeons:true,visualSize:Math.hypot((maxX-minX)*scale,(maxY-minY)*scale)};
  });
  // The thirty smallest silhouettes pass through other neons; wall and pointer responses stay active.
  const wallOnlyShapes=[...shapes].sort((a,b)=>a.visualSize-b.visualSize).slice(0,30);
  for(const shape of wallOnlyShapes) shape.collidesWithNeons=false;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  function bounds(s){return {x:Math.abs(s.cos)*s.halfW+Math.abs(s.sin)*s.halfH,y:Math.abs(s.sin)*s.halfW+Math.abs(s.cos)*s.halfH};}
  function constrain(s){
    const b=bounds(s);
    const x=clamp(s.x,b.x,W-b.x),y=clamp(s.y,b.y,H-b.y);
    if(x!==s.x){const sign=s.x<b.x?1:-1;s.vx=sign*Math.max(Math.abs(s.vx)*.55,4);s.driftX=sign*Math.abs(s.driftX);s.x=x;bounces++;}
    if(y!==s.y){const sign=s.y<b.y?1:-1;s.vy=sign*Math.max(Math.abs(s.vy)*.55,4);s.driftY=sign*Math.abs(s.driftY);s.y=y;bounces++;}
  }
  // Sweep along x to check only nearby shapes, then resolve overlapping rotated boxes.
  function resolveCollision(a,b){
    if(!a.collidesWithNeons||!b.collidesWithNeons)return;
    const dx=b.x-a.x,dy=b.y-a.y;
    const alignment=a.cos*b.cos+a.sin*b.sin;
    const cross=a.cos*b.sin-a.sin*b.cos;
    const axes=[
      [a.cos,a.sin,a.collisionHalfW+b.collisionHalfW*Math.abs(alignment)+b.collisionHalfH*Math.abs(cross)],
      [-a.sin,a.cos,a.collisionHalfH+b.collisionHalfW*Math.abs(cross)+b.collisionHalfH*Math.abs(alignment)],
      [b.cos,b.sin,b.collisionHalfW+a.collisionHalfW*Math.abs(alignment)+a.collisionHalfH*Math.abs(cross)],
      [-b.sin,b.cos,b.collisionHalfH+a.collisionHalfW*Math.abs(cross)+a.collisionHalfH*Math.abs(alignment)]
    ];
    let depth=Infinity,nx=0,ny=0;
    for(const [x,y,radius] of axes){
      const distance=dx*x+dy*y,overlap=radius-Math.abs(distance);
      if(overlap<=0)return;
      if(overlap<depth){depth=overlap;const direction=distance<0?-1:1;nx=x*direction;ny=y*direction;}
    }
    const separation=(depth+.1)*.5;
    a.x-=nx*separation;a.y-=ny*separation;
    b.x+=nx*separation;b.y+=ny*separation;
    const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
    if(relative<0){
      const impulse=-(1+.72)*relative*.5;
      a.vx-=nx*impulse;a.vy-=ny*impulse;
      b.vx+=nx*impulse;b.vy+=ny*impulse;
      const twist=clamp((dx*-ny+dy*nx)*relative*.00012,-.18,.18);
      a.spin=clamp(a.spin-twist,-.75,.75);
      b.spin=clamp(b.spin+twist,-.75,.75);
    }
    constrain(a);constrain(b);
  }
  function collideShapes(){
    const nearby=shapes.filter(s=>s.collidesWithNeons).map(s=>{
      const x=Math.abs(s.cos)*s.collisionHalfW+Math.abs(s.sin)*s.collisionHalfH;
      const y=Math.abs(s.sin)*s.collisionHalfW+Math.abs(s.cos)*s.collisionHalfH;
      return {s,left:s.x-x,right:s.x+x,top:s.y-y,bottom:s.y+y};
    }).sort((a,b)=>a.left-b.left);
    for(let i=0;i<nearby.length;i++){
      const a=nearby[i];
      for(let j=i+1;j<nearby.length&&nearby[j].left<=a.right;j++){
        const b=nearby[j];
        if(b.top>a.bottom||b.bottom<a.top)continue;
        resolveCollision(a.s,b.s);
      }
    }
  }
  function pointDistance(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
  function segmentDistance(ax,ay,bx,by,cx,cy,dx,dy){
    const ux=bx-ax,uy=by-ay,vx=dx-cx,vy=dy-cy,den=ux*vy-uy*vx;
    if(Math.abs(den)>1e-8){const t=((cx-ax)*vy-(cy-ay)*vx)/den,u=((cx-ax)*uy-(cy-ay)*ux)/den;if(t>=0&&t<=1&&u>=0&&u<=1)return 0;}
    return Math.min(pointDistance(ax,ay,cx,cy,dx,dy),pointDistance(bx,by,cx,cy,dx,dy),pointDistance(cx,cy,ax,ay,bx,by),pointDistance(dx,dy,ax,ay,bx,by));
  }
  function nudge(){
    for(const s of shapes){
      if(time-s.lastHit<1.5)continue;
      const b=bounds(s),angle=Math.random()*Math.PI*2;
      let dx=Math.cos(angle),dy=Math.sin(angle);
      if(s.x<b.x+100)dx=Math.max(.45,Math.abs(dx));
      else if(s.x>W-b.x-100)dx=-Math.max(.45,Math.abs(dx));
      if(s.y<b.y+65)dy=Math.max(.45,Math.abs(dy));
      else if(s.y>H-b.y-65)dy=-Math.max(.45,Math.abs(dy));
      const length=Math.hypot(dx,dy);dx/=length;dy/=length;
      const speed=45+Math.random()*20;
      s.vx=dx*speed;s.vy=dy*speed;
      s.driftX=dx*7;s.driftY=dy*7;
    }
    autoMoves++;canvas.dataset.autoMoves=String(autoMoves);
  }
  function update(dt){
    if(time>=nextNudge){nudge();nextNudge=time+20;}
    const sweep=pendingPointer;pendingPointer=null;
    for(const s of shapes){
      const head=(time*s.length*.42*settings.speed*s.flow+s.phase*s.length)%s.length,tail=s.length*settings.tail;
      if(sweep&&time-s.lastHit>.1){
        const b=bounds(s);
        const near=Math.max(sweep.ax,sweep.bx)>=s.x-b.x-18&&Math.min(sweep.ax,sweep.bx)<=s.x+b.x+18&&Math.max(sweep.ay,sweep.by)>=s.y-b.y-18&&Math.min(sweep.ay,sweep.by)<=s.y+b.y+18;
        if(near){const a=s.segments;for(let i=0;i<a.length;i+=5){let behind=head-a[i+4];if(behind<0)behind+=s.length;if(behind>=tail)continue;
          const ax=s.x+a[i]*s.cos-a[i+1]*s.sin,ay=s.y+a[i]*s.sin+a[i+1]*s.cos,bx=s.x+a[i+2]*s.cos-a[i+3]*s.sin,by=s.y+a[i+2]*s.sin+a[i+3]*s.cos;
          if(segmentDistance(sweep.ax,sweep.ay,sweep.bx,sweep.by,ax,ay,bx,by)<16){
            const mouseSpeed=Math.hypot(sweep.vx,sweep.vy),angle=mouseSpeed>25?Math.atan2(sweep.vy,sweep.vx):Math.atan2(s.y-sweep.by,s.x-sweep.bx);
            const force=clamp(mouseSpeed*.7,130,800);s.vx+=Math.cos(angle)*force;s.vy+=Math.sin(angle)*force;
            const armX=(ax+bx)/2-s.x,armY=(ay+by)/2-s.y;
            const turn=(armX*Math.sin(angle)-armY*Math.cos(angle))/Math.max(12,Math.hypot(armX,armY));
            s.spin=clamp(s.spin+turn*clamp(force/650,.25,.75),-.75,.75);
            const v=Math.hypot(s.vx,s.vy);if(v>950){s.vx*=950/v;s.vy*=950/v;}s.lastHit=time;hits++;break;
          }
        }}
      }
      const damp=Math.exp(-1.15*dt);s.vx=s.driftX+(s.vx-s.driftX)*damp;s.vy=s.driftY+(s.vy-s.driftY)*damp;
      s.spin*=Math.exp(-2.1*dt);s.angle=clamp(s.angle+s.spin*dt,-Math.PI*25/180,Math.PI*25/180);
      if(Math.abs(s.angle)>=Math.PI*25/180&&Math.sign(s.spin)===Math.sign(s.angle))s.spin=0;
      s.cos=Math.cos(s.angle);s.sin=Math.sin(s.angle);
      s.x+=s.vx*dt;s.y+=s.vy*dt;constrain(s);
    }
    collideShapes();
    canvas.dataset.hits=String(hits);canvas.dataset.bounces=String(bounces);
  }
  function draw(){
    ctx.clearRect(0,0,buffer.width,buffer.height);ctx.setTransform(buffer.width/W,0,0,buffer.height/H,0,0);
    const batches=Array.from({length:BINS},()=>new Path2D());
    for(const s of shapes){const head=(time*s.length*.42*settings.speed*s.flow+s.phase*s.length)%s.length,tail=s.length*settings.tail,a=s.segments;
      for(let i=0;i<a.length;i+=5){let behind=head-a[i+4];if(behind<0)behind+=s.length;if(behind>=tail)continue;const bin=Math.min(BINS-1,Math.floor((1-behind/tail)*BINS));batches[bin].moveTo(s.x+a[i]*s.cos-a[i+1]*s.sin,s.y+a[i]*s.sin+a[i+1]*s.cos);batches[bin].lineTo(s.x+a[i+2]*s.cos-a[i+3]*s.sin,s.y+a[i+2]*s.sin+a[i+3]*s.cos);}
    }
    ctx.lineCap='round';ctx.lineJoin='round';
    for(let i=0;i<BINS;i++){ctx.strokeStyle=colors[i];ctx.lineWidth=2.2+.7*i/(BINS-1);ctx.stroke(batches[i]);}
    ctx.fillStyle='#32ddf4';
    for(const s of shapes){const head=(time*s.length*.42*settings.speed*s.flow+s.phase*s.length)%s.length,tail=s.length*settings.tail,a=s.sparks;
      for(let i=0;i<a.length;i+=4){let behind=head-a[i+2];if(behind<0)behind+=s.length;if(behind>=tail)continue;ctx.globalAlpha=.85*Math.pow(1-behind/tail,.7);ctx.fillRect(s.x+a[i]*s.cos-a[i+1]*s.sin,s.y+a[i]*s.sin+a[i+1]*s.cos,a[i+3],a[i+3]);}
    }
    ctx.globalAlpha=1;ctx.resetTransform();hctx.clearRect(0,0,halo.width,halo.height);hctx.filter=`blur(${1.7*settings.glow}px)`;hctx.drawImage(buffer,0,0,halo.width,halo.height);
    display.clearRect(0,0,canvas.width,canvas.height);display.globalCompositeOperation='lighter';display.globalAlpha=.9;display.drawImage(halo,0,0,canvas.width,canvas.height);display.globalAlpha=1;display.globalCompositeOperation='source-over';display.drawImage(buffer,0,0,canvas.width,canvas.height);display.globalCompositeOperation='source-over';
  }
  function layout(){
    // Match object-fit:contain's actual media rectangle, excluding letterboxes.
    const boxW=media.clientWidth,boxH=media.clientHeight,aspect=(media.videoWidth||1400)/(media.videoHeight||900);
    const fullW=Math.min(boxW,boxH*aspect),fullH=fullW/aspect;
    // Opening_PingPong.mp4 active scene spans source rows 258–643.
    const w=fullW,h=fullH*386/900;
    canvas.style.width=w+'px';canvas.style.height=h+'px';canvas.style.left=(boxW-w)/2+'px';canvas.style.top=((boxH-fullH)/2+fullH*258/900)+'px';
    canvas.width=Math.max(1,Math.round(w));canvas.height=Math.max(1,Math.round(h));
    buffer.width=Math.max(1,Math.ceil(w/settings.pixels));buffer.height=Math.max(1,Math.ceil(h/settings.pixels));halo.width=Math.ceil(buffer.width/2);halo.height=Math.ceil(buffer.height/2);
    display.imageSmoothingEnabled=false;pointer=pendingPointer=null;draw();
  }
  canvas.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch')return;
    const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*W/r.width,y=(event.clientY-r.top)*H/r.height,now=performance.now();
    if(pointer){const dt=Math.max(.008,(now-pointer.t)/1000);pendingPointer={ax:pendingPointer?.ax??pointer.x,ay:pendingPointer?.ay??pointer.y,bx:x,by:y,vx:clamp((x-pointer.x)/dt,-2200,2200),vy:clamp((y-pointer.y)/dt,-2200,2200)};}
    pointer={x,y,t:now};
  },{passive:true});
  canvas.addEventListener('pointerleave',()=>{pointer=null;});
  function tick(now){if(!running){raf=0;return;}if(!last||now-last>=1000/60-.5){const dt=last?Math.min((now-last)/1000,.033):0;last=now;time+=dt;update(dt);draw();}raf=requestAnimationFrame(tick);}
  function sync(){const active=visible&&!document.hidden;if(active===running)return;running=active;last=0;pointer=pendingPointer=null;if(active&&!raf)raf=requestAnimationFrame(tick);else if(!active&&raf){cancelAnimationFrame(raf);raf=0;}}
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0}).observe(stage);
  document.addEventListener('visibilitychange',sync);
  new ResizeObserver(layout).observe(stage);media.addEventListener('loadedmetadata',layout);
  canvas.dataset.wallOnlyCount=String(wallOnlyShapes.length);canvas.dataset.neonCount=String(shapes.length);canvas.dataset.hits='0';canvas.dataset.bounces='0';layout();
})();

