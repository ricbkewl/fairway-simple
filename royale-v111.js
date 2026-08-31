/* Version 111: Royale Jakarta mapping safety reset.
   The previous Royale GPS endpoints were diagram-derived estimates and are not reliable enough for live play.
   Keep verified route/scorecard data, but disable GPS until every hole is remapped against satellite imagery. */
(function(){
  const priorRoyaleRoundCourse=royaleRoundCourse;

  royaleRoundCourse=function(value='west-south'){
    const course=priorRoyaleRoundCourse(value);
    return {...course,greens:[],mappingStatus:'needs-remap',catalogOnly:true};
  };

  const royaleCatalog=courses.find(course=>course.id==='catalog-royale-jakarta');
  if(royaleCatalog){
    royaleCatalog.greens=[];
    royaleCatalog.catalogOnly=true;
    royaleCatalog.catalog_note='Official scorecard and route data retained. Live GPS temporarily disabled while North, South and West are remapped hole-by-hole against verified satellite imagery.';
  }

  const priorRound=round;
  round=function(){
    const route=royaleRouteFromCourseName(s.course)||s.royaleRoute;
    const isRoyale=s.catalogCourseId==='catalog-royale-jakarta'||!!route;
    if(!isRoyale){priorRound();return;}
    if(s.done){s.v='recap';recap();return;}

    ensureCurrentHolePar();
    const h=s.hole,p=Number(s.pars[h-1])||4,c=royaleRoundCourse(route||'west-south');
    const meters=Number(c.tee_meters?.[s.teeSet||'black']?.[h-1]||c.tee_meters?.black?.[h-1]||0);
    const yards=meters?Math.round(meters*1.0936133):'—';
    app.classList.add('round-fullscreen','royale-scorecard-play');
    app.innerHTML=`<section class="royale-safe-round">
      <div class="hole-map-summary round-map-summary">
        <div><small>${esc(t('hole'))}</small><b>${h}</b></div>
        <div class="hole-distance-summary"><small>${esc(t('distance'))}</small><b><span>${yards}</span> <i>YDS</i></b></div>
        <div><small>${esc(t('par'))}</small><b>${p}</b></div>
        <div class="route-remaining-summary"><small>${esc(t('routeRemaining'))}</small><b><span>${yards}</span> <i>YDS</i></b></div>
        <div class="round-qr-summary round-menu-summary"><button onclick="showAppMenu()" aria-label="${esc(t('menu'))}"><i></i><i></i><i></i></button></div>
      </div>
      <div class="round-course-name-strip">${esc(c.name)}</div>
      <div class="royale-mapping-review-card">
        <span class="royale-review-icon">⛳</span>
        <b>GPS mapping under review</b>
        <p>We found that the previous Royale Jakarta hole coordinates were not reliable enough for live guidance. Scorecard play remains available while North, South and West are remapped accurately.</p>
        <small>Official par and tee-distance data are preserved.</small>
      </div>
      <div class="hole-edge-navigation" aria-label="Change hole">
        <button class="hole-edge-arrow previous" onclick="prev()" aria-label="Previous hole" ${h===1?'disabled':''}>‹</button>
        <button class="hole-edge-arrow next" onclick="next()" aria-label="Next hole">›</button>
      </div>
      ${floatingRoundScoreControl()}
    </section>`;
  };

  /* Repair an already-open Royale round immediately so the bad map is not shown again. */
  if(s?.v==='round'&&(s.catalogCourseId==='catalog-royale-jakarta'||royaleRouteFromCourseName(s.course)))setTimeout(()=>render(),0);
})();
