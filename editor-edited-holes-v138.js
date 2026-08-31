/* Version 138: show previously edited holes as reference overlays while mapping. */
(function(){
  function editorHoleReady(g){return Boolean((g?.tees?.black||g?.tee)&&g?.center)}
  function editedHoleIndices(){
    return (draft?.greens||[]).map((g,i)=>editorHoleReady(g)?i+1:null).filter(Boolean);
  }
  function editedHolesVisible(){return localStorage.atgEditorEditedHoles!=='off'}
  window.toggleEditedHoleReferences=function(){
    localStorage.atgEditorEditedHoles=editedHolesVisible()?'off':'on';
    render();
  };
  window.highlightEditedHole=function(hole){
    if(!draft||hole===draft.mapHole)return;
    draft._referenceHole=Number(hole)||null;
    render();
  };
  function referenceStrip(){
    if(!draft?.greens?.length)return'';
    const edited=editedHoleIndices(),current=draft.mapHole||1,visible=editedHolesVisible();
    const pills=Array.from({length:draft.holes||draft.greens.length},(_,i)=>{
      const h=i+1,done=edited.includes(h),active=h===current,ref=h===draft._referenceHole;
      return `<button type="button" class="edited-hole-pill ${done?'done':''} ${active?'current':''} ${ref?'reference':''}" ${done&&!active?`onclick="highlightEditedHole(${h})"`:''} ${done&&!active?'':'disabled'} aria-label="Hole ${h}${done?' edited':''}${active?' current':''}">${h}${done?' ✓':''}</button>`;
    }).join('');
    return `<section class="edited-holes-panel"><div><small>EDITED HOLES</small><b>${edited.length} mapped</b><span>Use completed holes as landmarks while mapping this hole.</span></div><button type="button" class="edited-holes-toggle ${visible?'on':''}" onclick="toggleEditedHoleReferences()">${visible?'Hide':'Show'} references</button><div class="edited-hole-strip">${pills}</div></section>`;
  }
  function getRawGoogleMap(){
    try{return map?.raw||map?._raw||map?.googleMap||null}catch{return null}
  }
  function addGoogleReferences(rawMap){
    if(!rawMap||!editedHolesVisible()||!draft)return;
    const current=draft.mapHole||1,focus=draft._referenceHole;
    (draft.greens||[]).forEach((g,i)=>{
      const h=i+1;if(h===current||!editorHoleReady(g))return;
      const route=holeRoute(g);if(route.length<2)return;
      const emphasized=h===focus;
      new google.maps.Polyline({map:rawMap,path:route.map(googlePoint),strokeColor:emphasized?'#f1c75b':'#ffffff',strokeOpacity:emphasized?.9:.42,strokeWeight:emphasized?5:2,zIndex:emphasized?5:1});
      const tee=selectedTee(g)||g.tee,center=g.center;
      if(tee)new google.maps.Marker({map:rawMap,position:googlePoint(tee),title:`Hole ${h} tee`,label:{text:`H${h}`,color:'#111',fontSize:'11px',fontWeight:'700'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:emphasized?7:5,fillColor:emphasized?'#f1c75b':'#ffffff',fillOpacity:.9,strokeColor:'#173126',strokeWeight:1.5},zIndex:emphasized?7:2});
      if(center)new google.maps.Marker({map:rawMap,position:googlePoint(center),title:`Hole ${h} green`,icon:{path:google.maps.SymbolPath.CIRCLE,scale:emphasized?6:4,fillColor:'#176b45',fillOpacity:.85,strokeColor:'#ffffff',strokeWeight:1.5},zIndex:emphasized?6:2});
    });
  }
  function addLeafletReferences(leafletMap){
    if(!leafletMap||!editedHolesVisible()||!draft||!window.L)return;
    const current=draft.mapHole||1,focus=draft._referenceHole;
    (draft.greens||[]).forEach((g,i)=>{
      const h=i+1;if(h===current||!editorHoleReady(g))return;
      const route=holeRoute(g);if(route.length<2)return;
      const emphasized=h===focus;
      L.polyline(route.map(p=>[p.lat,p.lng]),{color:emphasized?'#f1c75b':'#ffffff',weight:emphasized?5:2,opacity:emphasized?.9:.45,dashArray:emphasized?null:'6 7',interactive:false}).addTo(leafletMap);
      const tee=selectedTee(g)||g.tee;
      if(tee)L.circleMarker([tee.lat,tee.lng],{radius:emphasized?7:5,color:'#173126',weight:1.5,fillColor:emphasized?'#f1c75b':'#ffffff',fillOpacity:.9}).addTo(leafletMap).bindTooltip(`H${h}`,{permanent:true,direction:'center',className:'edited-hole-map-label'});
      if(g.center)L.circleMarker([g.center.lat,g.center.lng],{radius:emphasized?6:4,color:'#fff',weight:1.5,fillColor:'#176b45',fillOpacity:.85,interactive:false}).addTo(leafletMap);
    });
  }
  const priorMapCourse138=mapCourse;
  mapCourse=function(){
    priorMapCourse138();
    const toolbar=app.querySelector('.map-toolbar')||app.querySelector('.editor-provider-toggle');
    if(toolbar&&!app.querySelector('.edited-holes-panel'))toolbar.insertAdjacentHTML('beforebegin',referenceStrip());
  };
  const priorInitMap138=initMap;
  initMap=async function(){
    await priorInitMap138();
    if(!draft||!editedHolesVisible())return;
    setTimeout(()=>{
      try{
        if((draft.mapProvider||'maptiler')==='google')addGoogleReferences(getRawGoogleMap());
        else addLeafletReferences(map);
      }catch(error){console.warn('Edited-hole reference overlay unavailable',error)}
    },80);
  };
})();
