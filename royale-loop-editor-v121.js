/* Version 121: edit Royale Jakarta as three independent 9-hole loops and compose golfer routes from verified loop maps. */
(function(){
  const LOOP_KEYS=['north','west','south'];
  const loopName=key=>`Royale Jakarta Golf Club · ${ROYALE_JAKARTA_LOOPS[key]?.label||key}`;
  const normalized=value=>typeof courseMatchKey==='function'?courseMatchKey(value||''):String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  const isRoyaleName=name=>normalized(name).includes('royalejakarta');
  const completeGreen=g=>Boolean((g?.tees?.black||g?.tee)&&g?.front&&g?.center&&g?.back);
  const completeNine=greens=>Array.isArray(greens)&&greens.length>=9&&greens.slice(0,9).every(completeGreen);

  function exactLoopCourse(key){
    const target=normalized(loopName(key));
    return courses.find(c=>c.id!=='catalog-royale-jakarta'&&normalized(c.name)===target&&Number(c.holes)===9)||null;
  }

  function existingNorthSource(){
    const exact=exactLoopCourse('north');if(exact)return exact;
    return courses.find(c=>c.id!=='catalog-royale-jakarta'&&isRoyaleName(c.name)&&normalized(c.name).includes('north')&&completeNine(c.greens))||null;
  }

  function seedLoopGreens(key){
    const exact=exactLoopCourse(key);if(exact)return JSON.parse(JSON.stringify(exact.greens.slice(0,9)));
    if(key==='north'){
      const source=existingNorthSource();
      if(source&&completeNine(source.greens))return JSON.parse(JSON.stringify(source.greens.slice(0,9)));
    }
    return Array.from({length:9},()=>({tee:null,tees:{black:null,blue:null,white:null,red:null},aim1:null,aim2:null,front:null,center:null,back:null,_review:'manual-remap'}));
  }

  window.openRoyaleLoopEditor=function(key){
    if(!adminRole){alert('Administrator sign-in required.');return;}
    if(!LOOP_KEYS.includes(key)||!ROYALE_JAKARTA_LOOPS[key])return;
    document.querySelector('.royale-loop-picker-overlay')?.remove();
    const existing=exactLoopCourse(key),loop=ROYALE_JAKARTA_LOOPS[key];
    draft=existing?JSON.parse(JSON.stringify(existing)):{id:crypto.randomUUID(),isNew:true,name:loopName(key),holes:9,pars:[...loop.pars],greens:seedLoopGreens(key)};
    draft.isNew=!existing;
    draft.name=loopName(key);
    draft.holes=9;
    draft.pars=[...loop.pars];
    draft.greens=(draft.greens||seedLoopGreens(key)).slice(0,9);
    while(draft.greens.length<9)draft.greens.push({tee:null,tees:{black:null,blue:null,white:null,red:null},aim1:null,aim2:null,front:null,center:null,back:null,_review:'manual-remap'});
    draft.mapHole=1;
    draft.target='center';
    draft.mapProvider=draft.mapProvider||'maptiler';
    draft.mapStyle=draft.mapStyle||'satellite';
    draft.royaleLoopKey=key;
    draft.royaleFacilityLoop=true;
    const first=draft.greens.find(g=>g?.center||g?.tee||g?.tees?.black||g?.front||g?.back);
    if(first){const p=first.center||first.tee||first.tees?.black||first.front||first.back;draft.mapView={lat:p.lat,lng:p.lng,zoom:18};}
    else draft.mapView={lat:-6.2712,lng:106.8998,zoom:16};
    s.v='mapCourse';render();
  };

  function royaleLoopPicker(){
    document.querySelector('.royale-loop-picker-overlay')?.remove();
    const overlay=document.createElement('div');overlay.className='royale-loop-picker-overlay';
    const status=key=>{const exact=exactLoopCourse(key);if(exact&&completeNine(exact.greens))return '9 holes GPS ready';if(key==='north'&&existingNorthSource())return 'Existing North mapping found';return 'Ready to map';};
    overlay.innerHTML=`<section class="royale-loop-picker" role="dialog" aria-modal="true" aria-label="Choose Royale Jakarta nine to edit">
      <header><div><small>ROYALE JAKARTA COURSE EDITOR</small><h2>Edit each nine separately</h2><p>Map North, West and South as independent 9-hole loops. ATG will combine the completed loops automatically for whichever route a golfer selects.</p></div><button type="button" aria-label="Close" onclick="this.closest('.royale-loop-picker-overlay').remove()">×</button></header>
      <div class="royale-loop-options">
        ${LOOP_KEYS.map(key=>`<button type="button" onclick="openRoyaleLoopEditor('${key}')"><b>${ROYALE_JAKARTA_LOOPS[key].label} 9</b><span>${status(key)}</span><i>→</i></button>`).join('')}
      </div>
      <div class="royale-loop-note"><b>Your North work is protected.</b><span>If a saved North mapping already exists, ATG reuses it rather than replacing it. West and South are saved as their own 9-hole course maps.</span></div>
    </section>`;
    document.body.appendChild(overlay);
  }
  window.showRoyaleLoopPicker=royaleLoopPicker;

  if(typeof editCourse==='function'){
    const priorEditCourse121=editCourse;
    editCourse=function(i){
      const course=courses[i];
      if(course&&(course.id==='catalog-royale-jakarta'||course.royaleFacility||isRoyaleName(course.name))){royaleLoopPicker();return;}
      priorEditCourse121(i);
    };
  }
  if(typeof mapCatalogCourse==='function'){
    const priorMapCatalog121=mapCatalogCourse;
    mapCatalogCourse=function(i){
      const course=courses[i];
      if(course&&(course.id==='catalog-royale-jakarta'||course.royaleFacility||isRoyaleName(course.name))){royaleLoopPicker();return;}
      priorMapCatalog121(i);
    };
  }

  const priorRoyaleCourse121=royaleRoundCourse;
  royaleRoundCourse=function(value='west-south'){
    const base=priorRoyaleCourse121(value),keys=royaleRouteKeys(value),mapped=[];
    for(const key of keys){
      const course=key==='north'?(exactLoopCourse(key)||existingNorthSource()):exactLoopCourse(key);
      if(!course||!completeNine(course.greens))return {...base,greens:[],mappingStatus:'needs-remap',catalogOnly:true};
      mapped.push(...JSON.parse(JSON.stringify(course.greens.slice(0,9))));
    }
    return {...base,greens:mapped,mappingStatus:'gps-ready',catalogOnly:false,royaleFacility:true};
  };
})();
