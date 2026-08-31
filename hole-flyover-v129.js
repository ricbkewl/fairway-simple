/* Version 131: cinematic hole-to-hole camera flyover with a no-snap landing handoff. */
(function(){
  const FLYOVER_MS=3450;
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

  /* Update the existing round UI in place after the camera arrives. The previous
     version called showRoundHole(), which let the normal camera-orientation path
     immediately reassert itself. That second camera command is the snap visible
     in the screen recording. */
  function adoptArrivedHole(targetHole){
    const course=selectedRoundCourse(),green=course?.greens?.[targetHole-1],par=Number(s.pars[targetHole-1])||4;
    if(!green||!selectedTee(green)||!green.center){s.hole=targetHole;showRoundHole();return;}
    s.hole=targetHole;
    stopLocation();
    const yards=mappedHoleDistance(green);
    if($('roundMapHole'))$('roundMapHole').textContent=targetHole;
    if($('roundMapDistance'))$('roundMapDistance').textContent=yards;
    if($('roundMapPar'))$('roundMapPar').textContent=par;
    if($('centerYards'))$('centerYards').textContent=yards;
    $('liveHoleMap')?.setAttribute('aria-label',`Forward-facing course view of Hole ${targetHole}`);
    const previous=document.querySelector('.hole-edge-arrow.previous');if(previous)previous.disabled=targetHole===1;
    const name=myRoundPlayerName(),holeScore=scoreValue(name)||par,roundTotal=total(name,targetHole);
    if($('roundHoleScore'))$('roundHoleScore').textContent=holeScore;
    if($('roundScoreTotal'))$('roundScoreTotal').textContent=`Tap · Total ${roundTotal}`;
    if(inlineHoleMap?.provider==='google'){
      try{inlineHoleMap.raw.setMapTypeId(liveMapStyle);}catch{}
      drawGoogleLiveHole(green);
    }
    const segment=activeRouteSegment(null,green);
    if(segment)loadWeather(segment.origin,segment.target,segment.origin);
    save();
    /* Give Google one quiet second after landing before GPS/orientation callbacks
       are allowed to steer the camera again. */
    const priorUserMoved=inlineUserMovedMap;inlineUserMovedMap=true;
    setTimeout(()=>{
      inlineUserMovedMap=priorUserMoved;
      startLocation(green);
    },1100);
  }

  function settleHoleWithoutSnap(targetHole){
    if(flyoverFrame)cancelAnimationFrame(flyoverFrame);flyoverFrame=null;flyoverActive=false;
    removeFlyoverCard();
    adoptArrivedHole(targetHole);
    const done=flyoverResolve;flyoverResolve=null;if(done)done(true);
  }
  window.skipHoleFlyover=function(){if(flyoverActive&&flyoverResolve)flyoverResolve('skip')};

  function runGoogleFlyover(targetHole){
    return new Promise(resolve=>{
      const course=selectedRoundCourse(),green=course?.greens?.[targetHole-1],tee=selectedTee(green);
      if(!green||!tee||!green.center||inlineHoleMap?.provider!=='google'||!inlineHoleMap.raw){resolve(false);return;}
      const raw=inlineHoleMap.raw,startCenter=inlineHoleMap.getCenter?.()||tee,startZoom=Number(raw.getZoom?.()||18),startHeading=Number(raw.getHeading?.()||0),startTilt=Number(raw.getTilt?.()||67.5);
      const destination=flyoverCenter(green),heading=targetHeading(green),cruiseZoom=clamp(startZoom-1.65,15.9,17.35),finalZoom=clamp(startZoom,17.3,19),par=Number(s.pars[targetHole-1])||4,yards=targetYards(green);
      showFlyoverCard(targetHole,par,yards);stopLocation();flyoverActive=true;flyoverResolve=resolve;
      const started=performance.now();
      function frame(now){
        if(!flyoverActive){resolve(false);return;}
        if(flyoverResolve===null){settleHoleWithoutSnap(targetHole);return;}
        const t=clamp((now-started)/FLYOVER_MS,0,1);
        let center,zoom,tilt,cameraHeading;
        if(t<.23){
          const p=smoothstep(t/.23);center=startCenter;zoom=lerp(startZoom,cruiseZoom,p);tilt=lerp(startTilt,35,p);cameraHeading=headingLerp(startHeading,heading,p*.25);
        }else if(t<.66){
          const p=smoothstep((t-.23)/.43);center=pointLerp(startCenter,destination,p);zoom=cruiseZoom;tilt=lerp(35,44,p);cameraHeading=headingLerp(startHeading,heading,.25+.63*p);
        }else{
          const p=smoothstep((t-.66)/.34);center=destination;zoom=lerp(cruiseZoom,finalZoom,p);tilt=lerp(44,67.5,p);cameraHeading=headingLerp(headingLerp(startHeading,heading,.88),heading,p);
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
