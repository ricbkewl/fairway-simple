const app = document.querySelector('#app');
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const SUPABASE_URL = 'https://rntmqjqbmjfcpwbbflyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_r6fBc5CmRwlyLhTnk7u6BA_rRA1Pmoj';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const roundDefault = {v:'home',course:'',courseId:null,holes:18,players:['You'],pars:[],scores:{},hole:1,done:false};
let s = JSON.parse(localStorage.atgRound || 'null') || roundDefault;
let courses = [];
let currentUser = null;
let adminRole = null;
let cloudError = '';
let cloudLoading = true;
let draft=null,map=null,locationWatch=null;
let courseSearchResults=[];
let lastCourseSearch=0;
const save=()=>{localStorage.atgRound=JSON.stringify(s)};
const rel=n=>n===0?'E':n>0?'+'+n:n;
const parTotal=n=>s.pars.slice(0,n).reduce((a,b)=>a+b,0);
const total=(p,n=s.holes)=>Array.from({length:n},(_,i)=>s.scores[p]?.[i+1]||0).reduce((a,b)=>a+b,0);
const courseById=id=>courses.find(c=>c.id===id);

function render(){save();stopLocation();if(map){if(draft){const center=map.getCenter();draft.mapView={lat:center.lat,lng:center.lng,zoom:map.getZoom()}}map.remove();map=null}app.className='';({home,setup,pars,round,recap,coursesView,mapCourse}[s.v]||home)()}
function home(){app.className='home-page';app.innerHTML=`<section class="home-hero"><div class="home-kicker">FAITH · FELLOWSHIP · FAIRWAYS</div><div class="logo-wrap"><img src="agape-golf-logo.png" alt="Agape Tumoutou Golfers logo" class="landing-logo"></div><div class="home-brand">Agape Tumoutou Golfers</div><h1>Saved to <span>Serve</span></h1><p class="scripture"><strong>Who hath saved us, and called us with an holy calling</strong><br><span>... 2 Tim. 1:9</span></p><div class="feature-pills"><span>⛳ Shared Courses</span><span>◎ Live GPS</span><span>＋ Group Scoring</span></div></section><section class="home-actions">${cloudLoading?'<div class="notice">Loading shared courses…</div>':''}${cloudError?`<div class="error-notice">${esc(cloudError)}</div>`:''}<button class="primary home-primary" onclick="start()" ${cloudLoading?'disabled':''}>Start a Round <b>→</b></button><button class="secondary home-secondary" onclick="openCourses()">${adminRole?'Map & Manage Courses':'Explore Shared Courses'}</button><div class="account-bar">${currentUser?`<span class="account-status"><i></i>${adminRole?esc(adminRole.replace('_',' ')):'Signed in'}</span><button class="back" onclick="signOutAdmin()">Sign out</button>`:`<span class="small home-muted">Course managers</span><button class="back" onclick="signInAdmin()">Admin sign in</button>`}</div></section><footer class="home-footer">Saved to serve · Ready to play</footer>`}
async function initializeCloud(){
  cloudLoading=true;render();
  const {data:{session}}=await db.auth.getSession();
  currentUser=session?.user||null;
  await loadAdminRole();
  await loadCourses();
  cloudLoading=false;render();
}
async function loadAdminRole(){
  adminRole=null;
  if(!currentUser)return;
  const {data,error}=await db.from('app_admins').select('role').eq('user_id',currentUser.id).maybeSingle();
  if(!error)adminRole=data?.role||null;
}
async function loadCourses(){
  const {data,error}=await db.from('courses').select('id,name,holes,pars,greens,updated_at').order('name');
  if(error){cloudError='Shared courses could not be loaded. Check your internet connection and try again.';courses=[];return}
  cloudError='';courses=data||[];
}
async function signInAdmin(){
  const email=prompt('Administrator email:');if(!email)return;
  const password=prompt('Administrator password:');if(!password)return;
  const {data,error}=await db.auth.signInWithPassword({email:email.trim(),password});
  if(error){alert('Sign-in failed: '+error.message);return}
  currentUser=data.user;await loadAdminRole();
  if(!adminRole){await db.auth.signOut();currentUser=null;alert('This account is not an authorized course administrator.');return}
  render();
}
async function signOutAdmin(){await db.auth.signOut();currentUser=null;adminRole=null;s.v='home';render()}
function start(){s={...roundDefault,v:'setup',players:['You'],scores:{},pars:[]};render()}
function setup(){const options=courses.map(c=>`<option value="${esc(c.id)}" ${s.courseId===c.id?'selected':''}>${esc(c.name)} (${c.holes} holes)</option>`).join('');app.innerHTML=`<button class="back" onclick="s.v='home';render()">← Back</button><h1>Start a Round</h1><label>Saved course</label><select id="savedCourse" onchange="chooseCourse(this.value)"><option value="">Custom scorecard without GPS</option>${options}</select>${s.courseId?`<div class="notice">GPS green markers are available for this course.</div>`:`<label>Course name</label><input id="course" value="${esc(s.course)}" placeholder="e.g., Oak Valley Golf Club"><label>How many holes?</label><div class="row"><button class="choice ${s.holes===9?'on':''}" onclick="setHoles(9)">9 Holes</button><button class="choice ${s.holes===18?'on':''}" onclick="setHoles(18)">18 Holes</button></div>`}<label>Players</label>${s.players.map((p,i)=>`<div class="card row"><b>${esc(p)}</b>${s.players.length>1?`<button class="back" onclick="removePlayer(${i})">Remove</button>`:''}</div>`).join('')}<input id="name" placeholder="Add player name"><button class="secondary" onclick="addPlayer()">Add player +</button><button class="primary" onclick="goPars()">Continue</button>`}
function chooseCourse(id){const c=courseById(id);if(c){s.courseId=c.id;s.course=c.name;s.holes=c.holes;s.pars=[...c.pars]}else{s.courseId=null;s.course='';s.pars=[]}render()}
function setHoles(n){s.holes=n;render()}
function addPlayer(){const n=$('name').value.trim();if(n&&!s.players.includes(n)){s.players.push(n);render()}}
function removePlayer(i){s.players.splice(i,1);render()}
function goPars(){if(!s.courseId)s.course=$('course').value.trim()||'Friendly Round';s.pars=Array.from({length:s.holes},(_,i)=>s.pars[i]||4);s.v='pars';render()}
function pars(){app.innerHTML=`<button class="back" onclick="s.v='setup';render()">← Back</button><h1>Set hole pars</h1><p class="muted">Adjust any hole that is not par 4.</p>${s.pars.map((x,i)=>`<div class="card row"><b>Hole ${i+1}</b><div class="stepper"><button onclick="changePar(${i},-1)">−</button><span>${x}</span><button onclick="changePar(${i},1)">+</button></div></div>`).join('')}<button class="primary" onclick="s.v='round';render()">Start Round</button>`}
function changePar(i,d){s.pars[i]=Math.max(3,Math.min(6,s.pars[i]+d));render()}
function scoreValue(p){return s.scores[p]?.[s.hole]||0}
function round(){const h=s.hole,p=s.pars[h-1],pt=parTotal(h),c=courseById(s.courseId),green=c?.greens?.[h-1];app.innerHTML=`<div class="row"><div><div class="brand small-brand">Agape Tumoutou Golfers</div><span class="small muted">${esc(s.course)}</span></div><button class="back" onclick="s.v='recap';render()">Scorecard</button></div><section class="hole"><div class="eyebrow">Hole ${h} of ${s.holes} · Par ${p}</div><h1>Enter scores</h1></section>${green?yardagePanel():`<div class="notice">No GPS markers for this hole. Add them from Map & Manage Courses.</div>`}${s.players.map(x=>`<div class="card score"><div><b>${esc(x)}</b><div class="small muted">Total ${total(x,h)} · ${rel(total(x,h)-pt)}</div></div><div class="stepper"><button onclick="changeScore('${encodeURIComponent(x)}',-1)">−</button><span>${scoreValue(x)||'–'}</span><button onclick="changeScore('${encodeURIComponent(x)}',1)">+</button></div><span class="green">${scoreValue(x)?rel(scoreValue(x)-p):''}</span></div>`).join('')}<div class="row"><button class="secondary half" onclick="prev()">Previous</button><button class="primary fit" onclick="next()">${h===s.holes?'Finish':'Next Hole →'}</button></div>`;if(green)startLocation(green)}
function yardagePanel(){return`<section class="gps-card"><div class="row"><div><b>Live GPS Yardage</b><div id="gpsStatus" class="small muted">Requesting your location…</div></div><button class="locate" onclick="refreshLocation()">Refresh</button></div><div class="yardages"><div><span id="frontYards">–</span><small>Front</small></div><div class="center-yard"><span id="centerYards">–</span><small>Center</small></div><div><span id="backYards">–</span><small>Back</small></div></div></section>`}
function startLocation(green){if(!navigator.geolocation){$('gpsStatus').textContent='GPS is not supported by this browser.';return}locationWatch=navigator.geolocation.watchPosition(pos=>{$('gpsStatus').textContent=`Accuracy ±${Math.round(pos.coords.accuracy*1.094)} yd`;const here={lat:pos.coords.latitude,lng:pos.coords.longitude};['front','center','back'].forEach(k=>{const el=$(k+'Yards');if(el)el.textContent=green[k]?Math.round(distanceYards(here,green[k])):'–'})},err=>{if($('gpsStatus'))$('gpsStatus').textContent=err.code===1?'Location permission was denied. Allow it in browser settings.':'Unable to get a GPS signal.'},{enableHighAccuracy:true,maximumAge:3000,timeout:15000})}
function stopLocation(){if(locationWatch!==null){navigator.geolocation.clearWatch(locationWatch);locationWatch=null}}
function refreshLocation(){const g=courseById(s.courseId)?.greens?.[s.hole-1];stopLocation();if(g)startLocation(g)}
function distanceYards(a,b){const R=6371000,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng),q=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))*1.0936133}
function changeScore(encoded,d){const p=decodeURIComponent(encoded);s.scores[p]??={};s.scores[p][s.hole]=Math.max(1,(s.scores[p][s.hole]||0)+d);render()}
function prev(){if(s.hole>1){s.hole--;render()}}
function next(){if(s.hole<s.holes){s.hole++;render()}else{s.done=true;s.v='recap';render()}}
function recap(){app.innerHTML=`<button class="back" onclick="s.v='round';render()">← Back to round</button><h1>${s.done?'Round Complete':'Live Scorecard'}</h1><p class="muted">${esc(s.course)} · ${s.holes} holes</p><div class="table-wrap"><table><thead><tr><th>Player</th>${s.pars.map((_,i)=>`<th>${i+1}</th>`).join('')}<th>Total</th><th>+/−</th></tr></thead><tbody>${s.players.map(x=>`<tr><td><b>${esc(x)}</b></td>${s.pars.map((_,i)=>`<td>${s.scores[x]?.[i+1]||'–'}</td>`).join('')}<td>${total(x)||'–'}</td><td class="green">${total(x)?rel(total(x)-parTotal(s.holes)):'–'}</td></tr>`).join('')}<tr><td><b>Par</b></td>${s.pars.map(x=>`<td>${x}</td>`).join('')}<td>${parTotal(s.holes)}</td><td>E</td></tr></tbody></table></div><button class="primary" onclick="s.v='home';render()">Done</button>`}
function openCourses(){s.v='coursesView';render()}
function coursesView(){app.innerHTML=`<button class="back" onclick="s.v='home';render()">← Back</button><h1>Shared Courses</h1><p class="muted">Every golfer receives these course maps automatically. Only authorized administrators can change them.</p>${cloudError?`<div class="error-notice">${esc(cloudError)}</div>`:''}${courses.length?courses.map((c,i)=>`<div class="card"><div class="row"><div><b>${esc(c.name)}</b><div class="small muted">${c.holes} holes · ${mappedCount(c)} fully mapped</div></div>${adminRole?`<button class="back" onclick="editCourse(${i})">Edit</button>`:''}</div></div>`).join(''):'<div class="empty">No shared courses have been mapped yet.</div>'}${adminRole?'<button class="primary" onclick="newCourse()">Map a New Course</button>':currentUser?'<div class="notice">Your account does not have course-manager permission.</div>':'<button class="secondary" onclick="signInAdmin()">Admin sign in</button>'}`}
function mappedCount(c){return c.greens.filter(g=>g.front&&g.center&&g.back).length}
function newCourse(){if(!adminRole){alert('Administrator sign-in required.');return}const name=prompt('Course name:');if(!name?.trim())return;const holes=confirm('Does this course have 18 holes?\nChoose Cancel for 9 holes.')?18:9;draft={id:crypto.randomUUID(),isNew:true,name:name.trim(),holes,pars:Array(holes).fill(4),greens:Array.from({length:holes},()=>({front:null,center:null,back:null})),mapHole:1,target:'center'};s.v='mapCourse';render()}
function editCourse(i){if(!adminRole){alert('Administrator sign-in required.');return}draft=JSON.parse(JSON.stringify(courses[i]));draft.isNew=false;draft.mapHole=1;draft.target='center';s.v='mapCourse';render()}
function mapCourse(){if(!adminRole){s.v='coursesView';render();return}const h=draft.mapHole,g=draft.greens[h-1];app.innerHTML=`<button class="back" onclick="cancelMapping()">← Courses</button><h1>${esc(draft.name)}</h1><div class="row map-toolbar"><button class="back" onclick="mapPrev()">←</button><b>Hole ${h} of ${draft.holes}</b><button class="back" onclick="mapNext()">→</button></div><div class="row"><span>Par</span><div class="stepper"><button onclick="draft.pars[${h-1}]=Math.max(3,draft.pars[${h-1}]-1);render()">−</button><span>${draft.pars[h-1]}</span><button onclick="draft.pars[${h-1}]=Math.min(6,draft.pars[${h-1}]+1);render()">+</button></div></div><p class="muted small">Choose a marker, then tap its exact position on the map.</p><div class="marker-tabs">${['front','center','back'].map(k=>`<button class="marker-tab ${draft.target===k?'on':''} ${g[k]?'set':''}" onclick="draft.target='${k}';render()">${k[0].toUpperCase()+k.slice(1)} ${g[k]?'✓':''}</button>`).join('')}</div><form class="course-search" onsubmit="event.preventDefault();searchCourseAddress()"><label for="courseSearch">Find course by name or address</label><div class="search-row"><input id="courseSearch" autocomplete="street-address" placeholder="Sierra Lakes Golf Club or street address"><button id="courseSearchButton" type="submit">Search</button></div></form><div id="courseSearchResults" class="search-results"></div><div class="search-divider"><span>or</span></div><button class="secondary locate-map" onclick="centerOnMe()">Use My Location to Find Course</button><div id="courseMap" aria-label="Course mapping map"></div><div id="mapMessage" class="notice">Tap the map to set the ${draft.target} of hole ${h}.</div><button class="secondary" onclick="clearMarker()">Clear ${draft.target} marker</button><button id="saveCourseButton" class="primary" onclick="saveMappedCourse()">Save Shared Course</button>`;setTimeout(initMap,0)}
function initMap(){const g=draft.greens[draft.mapHole-1],existing=g[draft.target],any=g.center||g.front||g.back,view=draft.mapView?[draft.mapView.lat,draft.mapView.lng]:(existing||any||[34.1,-117.3]),zoom=draft.mapView?.zoom??(existing||any?18:10);map=L.map('courseMap').setView(view,zoom);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap'}).addTo(map);Object.entries(g).forEach(([k,p])=>{if(p)L.circleMarker(p,{radius:8,color:k==='front'?'#f4a340':k==='center'?'#176b45':'#174f9c',fillOpacity:.9}).addTo(map).bindTooltip(k)});map.on('click',e=>{draft.greens[draft.mapHole-1][draft.target]={lat:e.latlng.lat,lng:e.latlng.lng};render()})}
function centerOnMe(){if(!navigator.geolocation){$('mapMessage').textContent='GPS is not supported.';return}$('mapMessage').textContent='Finding your location…';navigator.geolocation.getCurrentPosition(p=>map.setView([p.coords.latitude,p.coords.longitude],18),()=>{$('mapMessage').textContent='Location unavailable. Pan and zoom the map manually.'},{enableHighAccuracy:true,timeout:15000})}
async function searchCourseAddress(){
  const input=$('courseSearch'),button=$('courseSearchButton'),box=$('courseSearchResults'),query=input?.value.trim();
  if(!query||query.length<3){box.innerHTML='<div class="search-error">Enter a course name or full address.</div>';return}
  const cache=JSON.parse(localStorage.atgGeocodeCache||'{}'),key=query.toLowerCase();
  if(cache[key]){showCourseSearchResults(cache[key]);return}
  if(Date.now()-lastCourseSearch<1100){box.innerHTML='<div class="search-error">Please wait a moment before searching again.</div>';return}
  lastCourseSearch=Date.now();button.disabled=true;button.textContent='Searching…';box.innerHTML='';
  try{
    const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q='+encodeURIComponent(query);
    const response=await fetch(url,{headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Search unavailable');
    const results=(await response.json()).map(x=>({lat:Number(x.lat),lon:Number(x.lon),name:x.display_name}));
    cache[key]=results;localStorage.atgGeocodeCache=JSON.stringify(cache);showCourseSearchResults(results);
  }catch(error){box.innerHTML='<div class="search-error">Location search is temporarily unavailable. You can still use your location or move the map manually.</div>'}
  finally{button.disabled=false;button.textContent='Search'}
}
function showCourseSearchResults(results){courseSearchResults=results;const box=$('courseSearchResults');box.innerHTML=results.length?results.map((r,i)=>`<button type="button" onclick="chooseCourseSearchResult(${i})"><b>${esc(r.name.split(',')[0])}</b><span>${esc(r.name)}</span></button>`).join(''):'<div class="search-error">No matching location found. Try the complete street address.</div>'}
function chooseCourseSearchResult(i){const result=courseSearchResults[i];if(!result||!map)return;map.setView([result.lat,result.lon],17);draft.mapView={lat:result.lat,lng:result.lon,zoom:17};$('courseSearchResults').innerHTML='';$('mapMessage').textContent='Course found. Zoom in, choose a marker, and tap the green.'}
function clearMarker(){draft.greens[draft.mapHole-1][draft.target]=null;render()}
function mapPrev(){if(draft.mapHole>1){draft.mapHole--;render()}}
function mapNext(){if(draft.mapHole<draft.holes){draft.mapHole++;render()}}
function cancelMapping(){draft=null;s.v='coursesView';render()}
async function saveMappedCourse(){
  if(!adminRole||!currentUser){alert('Administrator sign-in required.');return}
  const button=$('saveCourseButton');if(button){button.disabled=true;button.textContent='Saving…'}
  const payload={id:draft.id,name:draft.name,holes:draft.holes,pars:draft.pars,greens:draft.greens,updated_by:currentUser.id,updated_at:new Date().toISOString()};
  let result;
  if(draft.isNew)result=await db.from('courses').insert({...payload,created_by:currentUser.id});
  else result=await db.from('courses').update(payload).eq('id',draft.id);
  if(result.error){alert('Course could not be saved: '+result.error.message);if(button){button.disabled=false;button.textContent='Save Shared Course'}return}
  await loadCourses();draft=null;s.v='coursesView';render();
}
initializeCloud();
