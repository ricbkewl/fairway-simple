/* Version 130: smoother cinematic hole-to-hole camera flyover for Google play maps. */
(function(){
  const FLYOVER_MS=3300;
  let flyoverFrame=null,flyoverResolve=null,flyoverActive=false;

  function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches}
  function flyoverAllowed(){return localStorage.atgHoleFlyover!=='off'&&!reducedMotion()}
  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
  function smoothstep(t){t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10)}
  function lerp(a,b,t){return a+(b-a)*t}
  function pointLerp(a,b,t){return{lat:lerp(a.lat,b.lat,t),lng:lerp(a.lng,b.lng,t)}}
  function headingLerp(a,b,t){let delta=((b-a+540)%360)-180;return(a+delta*t+360)%360}
  function routeTarget(green){const route=holeRoute(green);return route[1]||green.center}
  function flyoverCenter(green){const tee=selectedTee(green),target=routeTarget(green)||green.center;return tee&&target?pointBetween(tee,target,.42):(tee||green.center)}
  function targetHeading(green){const tee=selectedTee(green),target=routeTarget(green)||green.center;return tee&&target?bearingDegrees(tee,target):0}
  function targetYards(green){return mappedHoleDistance(green)||Math.round(distanceYards(selectedTee(green),green.center))}

  function removeFlyoverCard(){document.querySelector('.hole-flyover-card')?.remove();document.querySelector('.live-hole-map')?.classList.remove('hole-flyover-active')}
  function showFlyoverCard(hole,par,yards){
    removeFlyoverCard();
    const host=document.querySelector('.live-hole-map');if(!host)return;
    host.classList.add('hole-flyover-active');
    const card=document.createElement('div');card.className='hole-flyover-card';
    card.innerHTML=`<small>NEXT HOLE</small><b>Hole ${hole}</b><span>Par ${par} · ${yards} yd</span><button type="button">Skip</button>`;
    card.querySelector('button').addEventListener('click',skipHoleFlyover);
    host.appendChild(card);
  }

  function settleHoleWithoutSnap(targetHole){
    if(flyoverFrame)cancelAnimationFrame(flyoverFrame);flyoverFrame=null;flyoverActive=false;
    removeFlyoverCard();
    s.hole=targetHole;
    /* Prevent the normal hole refresh/geolocation callbacks from immediately fighting
       the final flyover camera. We release control after the UI has caught up. */
    const priorUserMoved=inlineUserMovedMap;
    inlineUserMovedMap=true;
    showRoundHole();
    setTimeout(()=>{inlineUserMovedMap=priorUserMoved;},850);
    const done=flyoverResolve;flyoverResolve=null;if(done)done(true);
  }
  window.skipHoleFlyover=function(){if(flyoverActive&&flyoverResolve)flyoverResolve('skip')};

  function runGoogleFlyover(targetHole){
    return new Promise(resolve=>{
      const course=selectedRoundCourse(),green=course?.greens?.[targetHole-1],tee=selectedTee(green);
      if(!green||!tee||!green.center||inlineHoleMap?.provider!=='google'||!inlineHoleMap.raw){resolve(false);return;}
      const raw=inlineHoleMap.raw,startCenter=inlineHoleMap.getCenter?.()||tee,startZoom=Number(raw.getZoom?.()||18),startHeading=Number(raw.getHeading?.()||0),startTilt=Number(raw.getTilt?.()||67.5);
      const destination=flyoverCenter(green),heading=targetHeading(green),cruiseZoom=clamp(startZoom-1.75,15.8,17.25),finalZoom=clamp(startZoom,17.3,19),par=Number(s.pars[targetHole-1])||4,yards=targetYards(green);
      showFlyoverCard(targetHole,par,yards);stopLocation();flyoverActive=true;flyoverResolve=resolve;
      const started=performance.now();
      function frame(now){
        if(!flyoverActive){resolve(false);return;}
        if(flyoverResolve===null){settleHoleWithoutSnap(targetHole);return;}
        const t=clamp((now-started)/FLYOVER_MS,0,1);
        let center,zoom,tilt,cameraHeading;
        if(t<.24){
          const p=smoothstep(t/.24);
          center=startCenter;
          zoom=lerp(startZoom,cruiseZoom,p);
          tilt=lerp(startTilt,34,p);
          cameraHeading=headingLerp(startHeading,heading,p*.28);
        }else if(t<.68){
          const p=smoothstep((t-.24)/.44);
          center=pointLerp(startCenter,destination,p);
          zoom=cruiseZoom;
          tilt=lerp(34,43,p);
          cameraHeading=headingLerp(startHeading,heading,.28+.62*p);
        }else{
          const p=smoothstep((t-.68)/.32);
          center=pointLerp(pointLerp(startCenter,destination,1),destination,p);
          zoom=lerp(cruiseZoom,finalZoom,p);
          tilt=lerp(43,67.5,p);
          cameraHeading=headingLerp(headingLerp(startHeading,heading,.9),heading,p);
        }
        try{raw.moveCamera({center,zoom,heading:cameraHeading,tilt});}catch{}
        if(t>=1){settleHoleWithoutSnap(targetHole);return;}
        flyoverFrame=requestAnimationFrame(frame);
      }
      const originalResolve=flyoverResolve;
      flyoverResolve=value=>{if(value==='skip'){settleHoleWithoutSnap(targetHole);return;}originalResolve(value)};
      flyoverFrame=requestAnimationFrame(frame);
    });
  }

  async function moveHoleWithFlyover(targetHole){
    if(flyoverActive||targetHole<1||targetHole>s.holes)return;
    const course=selectedRoundCourse(),target=course?.greens?.[targetHole-1];
    if(!flyoverAllowed()||inlineHoleMap?.provider!=='google'||!selectedTee(target)||!target?.center){s.hole=targetHole;showRoundHole();return;}
    await runGoogleFlyover(targetHole);
  }

  const priorPrev129=prev,priorNext129=next;
  prev=function(){if(s.hole>1)return moveHoleWithFlyover(s.hole-1);return priorPrev129();};
  next=function(){if(s.hole<s.holes)return moveHoleWithFlyover(s.hole+1);return priorNext129();};

  window.setHoleFlyoverEnabled=function(enabled){localStorage.atgHoleFlyover=enabled?'on':'off';};
})();
