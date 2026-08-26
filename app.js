const app = document.querySelector('#app');
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const SUPABASE_URL = 'https://rntmqjqbmjfcpwbbflyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_r6fBc5CmRwlyLhTnk7u6BA_rRA1Pmoj';
const APP_URL = 'https://rickbewl.github.io/fairway-simple/';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}
});
const CLUBS=['Driver','3 Wood','5 Wood','7 Wood','2 Hybrid','3 Hybrid','4 Hybrid','5 Hybrid','2 Iron','3 Iron','4 Iron','5 Iron','6 Iron','7 Iron','8 Iron','9 Iron','Pitching Wedge','Gap Wedge','Sand Wedge','Lob Wedge'];
const roundDefault = {v:'home',course:'',courseId:null,holes:18,players:[''],pars:[],scores:{},hole:1,done:false,resumeView:null,ownerUserId:null};
let s = JSON.parse(localStorage.atgRound || 'null') || roundDefault;
if(s.players?.length===1&&s.players[0]==='You'&&['home','setup'].includes(s.v))s.players=[''];
let courses = JSON.parse(localStorage.atgCourses||'[]');
let currentUser = null;
let adminRole = null;
let cloudError = '';
let cloudLoading = true;
let draft=null,map=null,locationWatch=null;
let courseSearchResults=[];
let lastCourseSearch=0;
let sharedPlayers=[];
let historyRounds=[],historyDetail=null,historyLoading=false,historyError='';
let clubDistances={},clubProfileError='';
let roundChannel=null,subscribedRoundId=null,realtimeTimer=null;
let chatMessages=[],chatTimer=null;
let pendingScores=JSON.parse(localStorage.atgPendingScores||'{}');
let scoreSyncPromise=null;
let recoveryMode=false;
const save=()=>{localStorage.atgRound=JSON.stringify(s)};
const rel=n=>n===0?'E':n>0?'+'+n:n;
const parTotal=n=>s.pars.slice(0,n).reduce((a,b)=>a+b,0);
const total=(p,n=s.holes)=>Array.from({length:n},(_,i)=>s.scores[p]?.[i+1]||0).reduce((a,b)=>a+b,0);
const courseById=id=>courses.find(c=>c.id===id);

function render(){save();stopLocation();if(map){if(draft){const center=map.getCenter();draft.mapView={lat:center.lat,lng:center.lng,zoom:map.getZoom()}}map.remove();map=null}app.className='';({home,setup,pars,round,recap,coursesView,mapCourse,accountView,historyView,historyDetailView,clubsView,chatView}[s.v]||home)();if(s.v!=='home')bottomNav()}
function home(){const canResume=(s.sharedRoundId||['setup','pars','round','recap'].includes(s.resumeView))&&!s.done;app.className='home-page';app.innerHTML=`<section class="home-hero"><div class="home-kicker">FAITH · FELLOWSHIP · FAIRWAYS</div><div class="logo-wrap"><img src="agape-golf-logo.png" alt="Agape Tumoutou Golfers logo" class="landing-logo"></div><div class="home-brand">Agape Tumoutou Golfers</div><h1>Saved to <span>Serve</span></h1><p class="scripture"><strong>Who hath saved us, and called us with an holy calling</strong><br><span>... 2 Tim. 1:9</span></p><div class="feature-pills"><span>⛳ Shared Courses</span><span>◎ Live GPS</span><span>＋ Protected Scoring</span></div></section><section class="home-actions">${cloudLoading?'<div class="notice">Loading shared courses…</div>':''}${cloudError?`<div class="error-notice">${esc(cloudError)}</div>`:''}${canResume?'<button class="primary home-primary" onclick="resumeRound()">Resume Current Round <b>→</b></button><button class="secondary home-secondary" onclick="start()">Start a New Round</button>':`<button class="primary home-primary" onclick="start()" ${cloudLoading?'disabled':''}>Create a Round <b>→</b></button>`}<button class="secondary home-secondary" onclick="joinRound()">Join with Round Code</button>${!currentUser?'<button class="secondary home-secondary" onclick="createAccount()">Create Golfer Account</button>':''}${currentUser?'<button class="secondary home-secondary" onclick="openHistory()">Previous Matches</button>':''}<button class="secondary home-secondary" onclick="openCourses()">${adminRole?'Map & Manage Courses':'Explore Shared Courses'}</button>${adminRole==='super_admin'?'<button class="admin-tool" onclick="promoteCourseAdmin()">＋ Add Course Admin</button>':''}<div class="account-bar">${currentUser?`<span class="account-status"><i></i>${adminRole?esc(adminRole.replace('_',' ')):'Golfer signed in'}</span><button class="back" onclick="accountAction()">Account</button>`:`<span class="small home-muted">Already registered?</span><span><button class="back" onclick="signInAccount()">Sign in</button> · <button class="back" onclick="forgotPassword()">Forgot password?</button></span>`}</div></section><footer class="home-footer">Saved to serve · Ready to play</footer>`}
function bottomNav(){app.insertAdjacentHTML('beforeend',`<nav class="bottom-nav ${s.sharedRoundId?'has-chat':''}" aria-label="Main navigation"><button onclick="goHome()"><span>⌂</span>Home</button>${s.sharedRoundId?'<button onclick="openCurrentRound()"><span>🏌</span>Round</button>':''}<button onclick="openCoursesFromNav()"><span>⛳</span>Courses</button>${s.sharedRoundId?'<button onclick="openRoundChat()"><span>💬</span>Chat</button>':''}<button onclick="accountAction()"><span>${currentUser?'●':'♙'}</span>${currentUser?'Account':'Login'}</button></nav>`)}
function rememberRoundView(){if(['setup','pars','round','recap'].includes(s.v)&&!s.done)s.resumeView=s.v}
function goHome(){rememberRoundView();s.v='home';render()}
async function resumeRound(){if(s.sharedRoundId)await loadSharedRound(false);s.v=s.resumeView||'round';render()}
async function openCurrentRound(){if(!s.sharedRoundId){await resumeRound();return}await loadSharedRound(false);s.resumeView='round';s.v='round';render()}
function openCoursesFromNav(){rememberRoundView();s.v='coursesView';render()}
async function accountAction(){if(!currentUser){await signInAccount();return}rememberRoundView();s.v='accountView';render()}
function accountView(){if(!currentUser){s.v='home';render();return}app.innerHTML=`<button class="back" onclick="goHome()">← Back</button><h1>My Account</h1><section class="profile-card"><div class="profile-icon">♙</div><div><b>${esc(currentUser.email||'Golfer')}</b><div class="small muted">${adminRole?esc(adminRole.replace('_',' ')):'Golfer account'}</div></div></section><div class="notice remember-notice">✓ You will stay signed in securely on this device until you choose Sign Out.</div><button class="primary" onclick="openClubs()">My Clubs & Distances</button><button class="secondary" onclick="openHistory()">View Previous Matches</button><button class="secondary" onclick="changePassword()">Change Password</button>${adminRole==='super_admin'?'<button class="secondary" onclick="promoteCourseAdmin()">Add Course Admin</button>':''}<button class="secondary danger-button" onclick="signOutAdmin()">Sign Out</button>`}
async function initializeCloud(){
  cloudLoading=true;render();
  const {data:{session}}=await db.auth.getSession();
  currentUser=session?.user||null;
  if(s.ownerUserId&&s.ownerUserId!==currentUser?.id)s={...roundDefault};
  await Promise.all([loadAdminRole(),loadCourses(),loadClubDistances()]);
  cloudLoading=false;render();
  await syncPendingScores();
  const linkedCode=new URLSearchParams(location.search).get('join');
  const pendingCode=linkedCode||localStorage.atgPendingJoinCode;
  if(pendingCode&&!recoveryMode)setTimeout(()=>joinRoundWithCode(pendingCode),250);
}
async function loadAdminRole(){
  adminRole=null;
  if(!currentUser)return;
  const {data,error}=await db.from('app_admins').select('role').eq('user_id',currentUser.id).maybeSingle();
  if(!error)adminRole=data?.role||null;
}
async function loadCourses(){
  const {data,error}=await db.from('courses').select('id,name,holes,pars,greens,updated_at').order('name');
  if(error){cloudError=courses.length?'You are offline. Using the courses saved on this device.':'Shared courses could not be loaded. Connect to the internet and try again.';return}
  cloudError='';courses=data||[];localStorage.atgCourses=JSON.stringify(courses);
}
async function loadClubDistances(){
  clubDistances={};clubProfileError='';
  if(!currentUser)return;
  const {data,error}=await db.from('golfer_club_distances').select('club,carry_yards').eq('user_id',currentUser.id);
  if(error){clubProfileError='Club recommendations are not ready yet. Install the Supabase club-distance update first.';return}
  for(const item of data||[])clubDistances[item.club]=item.carry_yards;
}
function openClubs(){if(!currentUser){alert('Please sign in first.');return}s.v='clubsView';render()}
function clubsView(){
  if(!currentUser){s.v='home';render();return}
  app.innerHTML=`<button class="back" onclick="accountAction()">← Account</button><h1>My Clubs</h1><p class="muted">Enter the distance you normally carry each club in the air. Leave clubs you do not carry blank.</p>${clubProfileError?`<div class="error-notice">${esc(clubProfileError)}</div>`:''}<section class="club-grid">${CLUBS.map(club=>`<label class="club-row"><span>${esc(club)}</span><span class="club-input"><input data-club="${esc(club)}" type="number" inputmode="numeric" min="20" max="350" step="1" value="${clubDistances[club]||''}" placeholder="—"><small>yd</small></span></label>`).join('')}</section><div class="notice">Recommendations use the distance to the center of the green. Wind, elevation, lie, hazards and rollout can change the right club.</div><button id="saveClubsButton" class="primary" onclick="saveClubDistances()" ${clubProfileError?'disabled':''}>Save My Clubs</button>`;
}
async function saveClubDistances(){
  const distances={};
  for(const input of document.querySelectorAll('[data-club]')){
    if(input.value==='')continue;
    const yards=Number(input.value);
    if(!Number.isInteger(yards)||yards<20||yards>350){alert(`Enter a carry distance from 20 to 350 yards for ${input.dataset.club}.`);input.focus();return}
    distances[input.dataset.club]=yards;
  }
  if(!Object.keys(distances).length&&!confirm('Save an empty bag? Club suggestions will remain turned off.'))return;
  const button=$('saveClubsButton');button.disabled=true;button.textContent='Saving…';
  const {error}=await db.rpc('save_my_club_distances',{p_distances:distances});
  if(error){button.disabled=false;button.textContent='Save My Clubs';alert('Club distances could not be saved: '+error.message);return}
  clubDistances=distances;clubProfileError='';alert('Your club distances are saved. Live club suggestions are now ready.');accountAction();
}
function suggestedClubFor(yards){
  if(!Number.isFinite(yards))return null;
  const bag=Object.entries(clubDistances).map(([club,carry])=>({club,carry:Number(carry)})).filter(x=>Number.isFinite(x.carry)).sort((a,b)=>a.carry-b.carry);
  if(!bag.length)return null;
  const shortest=bag[0],longest=bag[bag.length-1];
  if(yards>longest.carry+35)return{club:longest.club,note:`Your longest saved carry is ${longest.carry} yd. Choose a safe lay-up target.`};
  if(yards<shortest.carry-15)return{club:shortest.club,note:`Your shortest saved carry is ${shortest.carry} yd. Consider a partial swing.`};
  const closest=bag.reduce((best,item)=>Math.abs(item.carry-yards)<Math.abs(best.carry-yards)?item:best,bag[0]);
  return{club:closest.club,note:`Saved carry ${closest.carry} yd · center is ${yards} yd`};
}
function updateClubSuggestion(centerYards){
  const title=$('clubSuggestion'),note=$('clubSuggestionNote');if(!title||!note)return;
  const suggestion=suggestedClubFor(centerYards);
  if(!suggestion){title.textContent='Set up My Clubs';note.textContent='Add your carry distances under Account to receive suggestions.';return}
  title.textContent=suggestion.club;note.textContent=suggestion.note;
}
async function signInAdmin(){
  const email=prompt('Administrator email:');if(!email)return;
  const password=prompt('Administrator password:');if(!password)return;
  const {data,error}=await db.auth.signInWithPassword({email:email.trim(),password});
  if(error){alert('Sign-in failed: '+error.message);return}
  currentUser=data.user;await Promise.all([loadAdminRole(),loadClubDistances()]);
  if(!adminRole){await db.auth.signOut();currentUser=null;alert('This account is not an authorized course administrator.');return}
  render();
}
async function signInAccount(){
  const email=prompt('Email address:');if(!email)return false;
  const password=prompt('Password:');if(!password)return false;
  const {data,error}=await db.auth.signInWithPassword({email:email.trim(),password});
  if(error){alert('Sign-in failed: '+error.message);if(confirm('Would you like a password-reset email?'))await sendPasswordReset(email.trim());return false}
  currentUser=data.user;await Promise.all([loadAdminRole(),loadClubDistances()]);render();return true;
}
async function createAccount(){
  const email=prompt('Enter your email address:');if(!email)return false;
  const password=prompt('Create a password with at least 8 characters:');if(!password)return false;
  if(password.length<8){alert('Please use at least 8 characters.');return false}
  const confirmed=prompt('Enter the new password again:');if(password!==confirmed){alert('The passwords did not match.');return false}
  const {data,error}=await db.auth.signUp({email:email.trim(),password});
  if(error){alert('Account could not be created: '+error.message);return false}
  if(!data.session){alert('Account created. Check your email and confirm it, then return and sign in.');return false}
  currentUser=data.user;await Promise.all([loadAdminRole(),loadClubDistances()]);render();return true;
}
async function sendPasswordReset(email){
  const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:APP_URL});
  if(error){alert('Password reset could not be sent: '+error.message);return false}
  alert('Password-reset email sent. Open the link on this device, then return to the app.');return true;
}
async function forgotPassword(){const email=prompt('Enter your golfer-account email:');if(email?.trim())await sendPasswordReset(email.trim())}
async function changePassword(){
  if(!currentUser){alert('Open the password-reset link from your email first.');return false}
  const password=prompt('Enter a new password with at least 8 characters:');if(!password)return false;
  if(password.length<8){alert('Use at least 8 characters.');return false}
  const confirmPassword=prompt('Enter the new password again:');if(password!==confirmPassword){alert('The passwords did not match.');return false}
  const {error}=await db.auth.updateUser({password});
  if(error){alert('Password could not be changed: '+error.message);return false}
  recoveryMode=false;history.replaceState({},'',location.pathname);alert('Your password has been changed.');s.v='accountView';render();return true;
}
async function signOutAdmin(){await stopRoundRealtime();await db.auth.signOut();delete localStorage.atgPendingJoinCode;currentUser=null;adminRole=null;historyRounds=[];historyDetail=null;clubDistances={};clubProfileError='';s={...roundDefault};render()}
async function promoteCourseAdmin(){
  if(adminRole!=='super_admin'){alert('Only a super admin can add course administrators.');return}
  const email=prompt('Enter the email of an existing app user:');
  if(!email)return;
  if(!confirm(`Give ${email.trim()} permission to map and edit shared courses?`))return;
  const {data,error}=await db.rpc('set_course_admin',{target_email:email.trim()});
  if(error){alert('Administrator was not added: '+error.message);return}
  alert(`${data.email} is now a course administrator.`);
}
async function start(){if(!currentUser){alert('Each golfer needs an account so scores can be protected. Please sign in or create an account first.');await signInAccount();if(!currentUser)return}if(s.resumeView&&!s.done&&!confirm('Start a new round? Your unfinished round will be replaced.'))return;s={...roundDefault,v:'setup',players:[''],scores:{},pars:[],resumeView:'setup',sharedRoundId:null,joinCode:null,ownerUserId:currentUser.id};render()}
function setup(){const options=courses.map(c=>`<option value="${esc(c.id)}" ${s.courseId===c.id?'selected':''}>${esc(c.name)} (${c.holes} holes)</option>`).join('');app.innerHTML=`<button class="back" onclick="goHome()">← Back</button><h1>Create a Round</h1><p class="muted">You will receive a code for the other golfers after setting the pars.</p><label>Saved course</label><select id="savedCourse" onchange="chooseCourse(this.value)"><option value="">Custom scorecard without GPS</option>${options}</select>${s.courseId?`<div class="notice">GPS green markers are available for this course.</div>`:`<label>Course name</label><input id="course" value="${esc(s.course)}" placeholder="e.g., Oak Valley Golf Club"><label>How many holes?</label><div class="row"><button class="choice ${s.holes===9?'on':''}" onclick="setHoles(9)">9 Holes</button><button class="choice ${s.holes===18?'on':''}" onclick="setHoles(18)">18 Holes</button></div>`}<label>Your player name</label><input aria-label="Your player name" value="${esc(s.players[0]||'')}" placeholder="Enter your name" oninput="updatePlayer(0,this.value)"><div class="notice">Each additional golfer will join on their own phone and enter their own name.</div><button class="primary" onclick="goPars()">Continue</button>`}
function chooseCourse(id){const c=courseById(id);if(c){s.courseId=c.id;s.course=c.name;s.holes=c.holes;s.pars=[...c.pars]}else{s.courseId=null;s.course='';s.pars=[]}render()}
function setHoles(n){s.holes=n;render()}
function addPlayer(){const n=$('name').value.trim();if(n&&!s.players.includes(n)){s.players.push(n);render()}}
function updatePlayer(i,name){s.players[i]=name;save()}
function removePlayer(i){s.players.splice(i,1);render()}
function goPars(){const names=s.players.map(x=>x.trim()).filter(Boolean);if(!names.length){alert('Enter at least one player name.');return}if(new Set(names.map(x=>x.toLowerCase())).size!==names.length){alert('Each player needs a different name.');return}s.players=names;if(!s.courseId)s.course=$('course').value.trim()||'Friendly Round';s.pars=Array.from({length:s.holes},(_,i)=>s.pars[i]||4);s.v='pars';s.resumeView='pars';render()}
function pars(){app.innerHTML=`<button class="back" onclick="s.v='setup';render()">← Back</button><h1>Set hole pars</h1><p class="muted">Adjust any hole that is not par 4.</p>${s.pars.map((x,i)=>`<div class="card row"><b>Hole ${i+1}</b><div class="stepper"><button onclick="changePar(${i},-1)">−</button><span>${x}</span><button onclick="changePar(${i},1)">+</button></div></div>`).join('')}<button id="createRoundButton" class="primary" onclick="createSharedRound()">Create Protected Round</button>`}
function changePar(i,d){s.pars[i]=Math.max(3,Math.min(6,s.pars[i]+d));render()}
async function createSharedRound(){
  if(!currentUser){alert('Please sign in first.');return}
  const button=$('createRoundButton');if(button){button.disabled=true;button.textContent='Creating round…'}
  const {data,error}=await db.rpc('create_shared_round',{p_course_id:s.courseId||null,p_course_name:s.course,p_holes:s.holes,p_pars:s.pars,p_display_name:s.players[0]});
  if(error){alert('Round could not be created: '+error.message);if(button){button.disabled=false;button.textContent='Create Protected Round'}return}
  s.sharedRoundId=data.round_id;s.joinCode=data.join_code;s.hole=1;s.done=false;s.resumeView='round';
  await loadSharedRound(false);s.v='round';render();
  alert(`Round created. Share code ${s.joinCode} with the other golfers.`);
}
async function joinRound(){
  const code=prompt('Enter the 6-character round code:');if(!code)return;
  await joinRoundWithCode(code.trim());
}
async function joinRoundWithCode(code){
  if(!code)return;
  localStorage.atgPendingJoinCode=code.toUpperCase();
  if(!currentUser){alert('Please sign in or create a golfer account first. The round link will be remembered.');const signedIn=await signInAccount();if(!signedIn)return}
  const name=prompt('Enter your player name:');if(!name?.trim())return;
  const {data,error}=await db.rpc('join_shared_round',{p_join_code:code.trim(),p_display_name:name.trim()});
  if(error){alert('Could not join round: '+error.message);return}
  delete localStorage.atgPendingJoinCode;history.replaceState({},'',location.pathname);
  s={...roundDefault,v:'round',players:[name.trim()],scores:{},sharedRoundId:data.round_id,joinCode:data.join_code,resumeView:'round',ownerUserId:currentUser.id};
  await loadSharedRound(false);render();
}
async function loadSharedRound(showError=true){
  if(!s.sharedRoundId||!currentUser)return false;
  const [roundResult,playersResult,scoresResult]=await Promise.all([
    db.from('shared_rounds').select('id,join_code,course_id,course_name,holes,pars,status').eq('id',s.sharedRoundId).single(),
    db.from('round_players').select('user_id,display_name,joined_at').eq('round_id',s.sharedRoundId).order('joined_at'),
    db.from('round_scores').select('user_id,hole,strokes').eq('round_id',s.sharedRoundId)
  ]);
  if(roundResult.error||playersResult.error||scoresResult.error){if(showError)alert('Shared scores could not be refreshed. Check your connection.');return false}
  const r=roundResult.data;s.joinCode=r.join_code;s.courseId=r.course_id;s.course=r.course_name;s.holes=r.holes;s.pars=r.pars;s.done=r.status==='complete';
  sharedPlayers=playersResult.data||[];s.players=sharedPlayers.map(p=>p.display_name);s.scores={};
  for(const score of scoresResult.data||[]){const player=sharedPlayers.find(p=>p.user_id===score.user_id);if(player){s.scores[player.display_name]??={};s.scores[player.display_name][score.hole]=score.strokes}}
  const mine=sharedPlayers.find(p=>p.user_id===currentUser.id);
  if(mine)for(const pending of Object.values(pendingScores)){if(pending.round_id===s.sharedRoundId&&pending.user_id===currentUser.id){s.scores[mine.display_name]??={};s.scores[mine.display_name][pending.hole]=pending.strokes}}
  subscribeToRound(s.sharedRoundId);
  return true;
}
async function refreshSharedRound(){if(await loadSharedRound())render()}
function pendingScoreCount(){return Object.values(pendingScores).filter(x=>x.user_id===currentUser?.id).length}
function persistPendingScores(){localStorage.atgPendingScores=JSON.stringify(pendingScores);updateSyncIndicator()}
function pendingScoreKey(item){return`${item.round_id}:${item.user_id}:${item.hole}`}
function updateSyncIndicator(){const el=$('syncStatus');if(!el)return;const pending=pendingScoreCount();el.textContent=!navigator.onLine?`Offline · ${pending} waiting`:pending?`Saving ${pending}…`:'Live';el.className='sync-status '+(!navigator.onLine||pending?'waiting':'live')}
async function syncPendingScores(){
  if(!currentUser||!navigator.onLine)return false;
  if(scoreSyncPromise)return scoreSyncPromise;
  const syncUserId=currentUser.id;
  scoreSyncPromise=(async()=>{
    while(true){
      const entries=Object.entries(pendingScores).filter(([,item])=>item.user_id===syncUserId);
      if(!entries.length){updateSyncIndicator();return true}
      updateSyncIndicator();
      const {error}=await db.from('round_scores').upsert(entries.map(([,item])=>item));
      if(error){updateSyncIndicator();return false}
      for(const [key,item] of entries)if(pendingScores[key]?.updated_at===item.updated_at)delete pendingScores[key];
      persistPendingScores();
    }
  })();
  try{return await scoreSyncPromise}finally{scoreSyncPromise=null}
}
function scheduleRealtimeRefresh(){clearTimeout(realtimeTimer);realtimeTimer=setTimeout(async()=>{if(!s.sharedRoundId)return;await loadSharedRound(false);if(['round','recap'].includes(s.v))render()},350)}
function scheduleChatRefresh(){clearTimeout(chatTimer);chatTimer=setTimeout(async()=>{if(!s.sharedRoundId)return;await loadRoundMessages(false);if(s.v==='chatView')render()},250)}
function subscribeToRound(roundId){
  if(!roundId||subscribedRoundId===roundId)return;
  stopRoundRealtime();subscribedRoundId=roundId;
  roundChannel=db.channel(`round-${roundId}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'round_scores',filter:`round_id=eq.${roundId}`},scheduleRealtimeRefresh)
    .on('postgres_changes',{event:'*',schema:'public',table:'round_players',filter:`round_id=eq.${roundId}`},scheduleRealtimeRefresh)
    .on('postgres_changes',{event:'*',schema:'public',table:'shared_rounds',filter:`id=eq.${roundId}`},scheduleRealtimeRefresh)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'round_messages',filter:`round_id=eq.${roundId}`},scheduleChatRefresh)
    .subscribe();
}
async function stopRoundRealtime(){clearTimeout(realtimeTimer);clearTimeout(chatTimer);const channel=roundChannel;roundChannel=null;subscribedRoundId=null;if(channel)await db.removeChannel(channel)}
async function openHistory(){
  if(!currentUser){alert('Please sign in to view your previous matches.');await signInAccount();if(!currentUser)return}
  rememberRoundView();s.v='historyView';historyLoading=true;historyError='';render();
  await loadMatchHistory();historyLoading=false;render();
}
async function loadMatchHistory(){
  historyRounds=[];historyError='';
  const memberships=await db.from('round_players').select('round_id,display_name,joined_at').eq('user_id',currentUser.id).order('joined_at',{ascending:false});
  if(memberships.error){historyError='Your match history could not be loaded. Please try again.';return}
  const roundIds=(memberships.data||[]).map(x=>x.round_id);
  if(!roundIds.length)return;
  const [roundResult,scoreResult]=await Promise.all([
    db.from('shared_rounds').select('id,join_code,course_name,holes,pars,status,created_at').in('id',roundIds),
    db.from('round_scores').select('round_id,hole,strokes').eq('user_id',currentUser.id).in('round_id',roundIds)
  ]);
  if(roundResult.error||scoreResult.error){historyError='Your match history could not be loaded. Please try again.';return}
  const roundsById=new Map((roundResult.data||[]).map(x=>[x.id,x]));
  historyRounds=(memberships.data||[]).map(membership=>{
    const match=roundsById.get(membership.round_id);if(!match)return null;
    const scores=(scoreResult.data||[]).filter(x=>x.round_id===membership.round_id);
    const score=scores.reduce((sum,x)=>sum+x.strokes,0),complete=scores.length>=match.holes;
    const par=(match.pars||[]).reduce((sum,x)=>sum+Number(x||0),0);
    return {...match,displayName:membership.display_name,joinedAt:membership.joined_at,score,scoreCount:scores.length,complete,relative:complete?score-par:null};
  }).filter(Boolean).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
}
function formatMatchDate(value){return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(value))}
function historyView(){
  if(!currentUser){app.innerHTML='<button class="back" onclick="goHome()">← Back</button><h1>Previous Matches</h1><div class="notice">Sign in to see your saved matches.</div><button class="primary" onclick="signInAccount()">Sign In</button>';return}
  app.innerHTML=`<button class="back" onclick="accountAction()">← Account</button><div class="row"><div><h1>Previous Matches</h1><p class="muted">Every round played with this login is saved here.</p></div>${!historyLoading?'<button class="locate" onclick="openHistory()">Refresh</button>':''}</div>${historyLoading?'<div class="history-loading">Loading your matches…</div>':''}${historyError?`<div class="error-notice">${esc(historyError)}</div>`:''}${!historyLoading&&!historyError&&!historyRounds.length?'<div class="empty history-empty"><b>No matches yet</b><span>Your completed and in-progress rounds will appear here.</span></div>':''}${historyRounds.map(match=>`<article class="history-card"><div class="history-top"><div><span class="history-date">${esc(formatMatchDate(match.created_at))}</span><h2>${esc(match.course_name)}</h2><span class="small muted">${match.holes} holes · ${esc(match.displayName)}</span></div><div class="history-score"><b>${match.score||'–'}</b><span>${match.complete?rel(match.relative):`${match.scoreCount}/${match.holes}`}</span></div></div><div class="history-bottom"><span class="status-chip ${match.complete?'complete':'progress'}">${match.complete?'Complete':'In progress'}</span><button class="back" onclick="openHistoryRound('${esc(match.id)}')">View scorecard →</button></div></article>`).join('')}`;
}
async function openHistoryRound(roundId){
  historyLoading=true;historyError='';historyDetail=null;s.v='historyDetailView';render();
  const [roundResult,playersResult,scoresResult]=await Promise.all([
    db.from('shared_rounds').select('id,course_name,holes,pars,created_at').eq('id',roundId).single(),
    db.from('round_players').select('user_id,display_name,joined_at').eq('round_id',roundId).order('joined_at'),
    db.from('round_scores').select('user_id,hole,strokes').eq('round_id',roundId)
  ]);
  historyLoading=false;
  if(roundResult.error||playersResult.error||scoresResult.error){historyError='This scorecard could not be loaded.';render();return}
  historyDetail={round:roundResult.data,players:playersResult.data||[],scores:scoresResult.data||[]};render();
}
function historyDetailView(){
  if(historyLoading){app.innerHTML='<button class="back" onclick="openHistory()">← Matches</button><div class="history-loading">Loading scorecard…</div>';return}
  if(historyError||!historyDetail){app.innerHTML=`<button class="back" onclick="openHistory()">← Matches</button><h1>Match Scorecard</h1><div class="error-notice">${esc(historyError||'Scorecard unavailable.')}</div>`;return}
  const match=historyDetail.round,players=historyDetail.players,scores=historyDetail.scores,pars=match.pars||[];
  const playerScore=(userId,hole)=>scores.find(x=>x.user_id===userId&&x.hole===hole)?.strokes;
  const playerTotal=userId=>scores.filter(x=>x.user_id===userId).reduce((sum,x)=>sum+x.strokes,0);
  const playerComplete=userId=>scores.filter(x=>x.user_id===userId).length>=match.holes;
  const fullPar=pars.reduce((sum,x)=>sum+Number(x||0),0);
  app.innerHTML=`<button class="back" onclick="openHistory()">← Matches</button><h1>${esc(match.course_name)}</h1><p class="muted">${esc(formatMatchDate(match.created_at))} · ${match.holes} holes</p><div class="table-wrap"><table><thead><tr><th>Player</th>${pars.map((_,i)=>`<th>${i+1}</th>`).join('')}<th>Total</th><th>+/−</th></tr></thead><tbody>${players.map(player=>{const score=playerTotal(player.user_id),complete=playerComplete(player.user_id);return`<tr><td><b>${esc(player.display_name)}${player.user_id===currentUser?.id?' (You)':''}</b></td>${pars.map((_,i)=>`<td>${playerScore(player.user_id,i+1)||'–'}</td>`).join('')}<td>${score||'–'}</td><td class="green">${complete?rel(score-fullPar):'–'}</td></tr>`}).join('')}<tr><td><b>Par</b></td>${pars.map(x=>`<td>${x}</td>`).join('')}<td>${fullPar}</td><td>E</td></tr></tbody></table></div><div class="notice">Previous scorecards are read-only. Each golfer’s saved scores remain protected by their account.</div>`;
}
function scoreValue(p){return s.scores[p]?.[s.hole]||0}
function ensureCurrentHolePar(){
  const par=Number(s.pars[s.hole-1]);if(!par)return;
  const mine=s.sharedRoundId?sharedPlayers.find(player=>player.user_id===currentUser?.id):null;
  const name=mine?.display_name||(!s.sharedRoundId?s.players[0]:null);if(!name)return;
  s.scores[name]??={};if(s.scores[name][s.hole])return;
  s.scores[name][s.hole]=par;
  if(!s.sharedRoundId){save();return}
  const item={round_id:s.sharedRoundId,user_id:currentUser.id,hole:s.hole,strokes:par,updated_at:new Date().toISOString()};
  pendingScores[pendingScoreKey(item)]=item;persistPendingScores();syncPendingScores();
}
function round(){ensureCurrentHolePar();const h=s.hole,p=s.pars[h-1],pt=parTotal(h),c=courseById(s.courseId),green=c?.greens?.[h-1];app.innerHTML=`<div class="row"><div><div class="brand small-brand">Agape Tumoutou Golfers</div><span class="small muted">${esc(s.course)}</span></div><button class="back" onclick="openScorecard()">Scorecard</button></div>${s.joinCode?`<div class="round-code"><div><span>Round code</span> <b>${esc(s.joinCode)}</b><span id="syncStatus" class="sync-status">${navigator.onLine?'Live':'Offline'}</span></div><div class="round-code-actions"><button onclick="copyRoundCode()">Copy</button><button onclick="showRoundQr()">QR</button></div></div>`:''}<section class="hole"><div class="eyebrow">Hole ${h} of ${s.holes} · Par ${p}</div><h1>Enter your score</h1></section>${green?yardagePanel():`<div class="notice">No GPS markers for this hole. Add them from Map & Manage Courses.</div>`}${s.players.map(x=>{const mine=isMyPlayer(x);return`<div class="card score ${mine?'my-score':''}"><div><b>${esc(x)}${mine?' (You)':''}</b><div class="small muted">Total ${total(x,h)} · ${rel(total(x,h)-pt)}</div></div>${mine?`<div class="stepper"><button onclick="changeScore('${encodeURIComponent(x)}',-1)">−</button><span>${scoreValue(x)||'–'}</span><button onclick="changeScore('${encodeURIComponent(x)}',1)">+</button></div>`:`<span class="locked-score">${scoreValue(x)||'–'} 🔒</span>`}<span class="green">${scoreValue(x)?rel(scoreValue(x)-p):''}</span></div>`}).join('')}<div class="row"><button class="secondary half" onclick="prev()">Previous</button><button class="primary fit" onclick="next()">${h===s.holes?'Finish':'Next Hole →'}</button></div>`;updateSyncIndicator();if(green)startLocation(green)}
function yardagePanel(){return`<section class="gps-card"><div class="row"><div><b>Live GPS Yardage</b><div id="gpsStatus" class="small muted">Requesting your location…</div></div><button class="locate" onclick="refreshLocation()">Refresh</button></div><div class="yardages"><div><span id="frontYards">–</span><small>Front</small></div><div class="center-yard"><span id="centerYards">–</span><small>Center</small></div><div><span id="backYards">–</span><small>Back</small></div></div><div class="club-suggestion"><div class="club-symbol">⛳</div><div><small>Suggested club</small><b id="clubSuggestion">Waiting for GPS…</b><span id="clubSuggestionNote">Based on your personal carry distances</span></div></div></section>`}
function startLocation(green){if(!navigator.geolocation){$('gpsStatus').textContent='GPS is not supported by this browser.';return}locationWatch=navigator.geolocation.watchPosition(pos=>{$('gpsStatus').textContent=`Accuracy ±${Math.round(pos.coords.accuracy*1.094)} yd`;const here={lat:pos.coords.latitude,lng:pos.coords.longitude},yards={};['front','center','back'].forEach(k=>{const el=$(k+'Yards');yards[k]=green[k]?Math.round(distanceYards(here,green[k])):null;if(el)el.textContent=yards[k]??'–'});updateClubSuggestion(yards.center)},err=>{if($('gpsStatus'))$('gpsStatus').textContent=err.code===1?'Location permission was denied. Allow it in browser settings.':'Unable to get a GPS signal.'},{enableHighAccuracy:true,maximumAge:3000,timeout:15000})}
function stopLocation(){if(locationWatch!==null){navigator.geolocation.clearWatch(locationWatch);locationWatch=null}}
function refreshLocation(){const g=courseById(s.courseId)?.greens?.[s.hole-1];stopLocation();if(g)startLocation(g)}
function distanceYards(a,b){const R=6371000,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng),q=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))*1.0936133}
function isMyPlayer(name){return !s.sharedRoundId||sharedPlayers.some(p=>p.display_name===name&&p.user_id===currentUser?.id)}
async function changeScore(encoded,d){const p=decodeURIComponent(encoded);if(s.sharedRoundId&&!isMyPlayer(p)){alert('Only '+p+' can edit this score.');return}s.scores[p]??={};const previous=s.scores[p][s.hole]??Number(s.pars[s.hole-1])??0;const nextScore=Math.max(1,previous+d);s.scores[p][s.hole]=nextScore;if(s.sharedRoundId){const item={round_id:s.sharedRoundId,user_id:currentUser.id,hole:s.hole,strokes:nextScore,updated_at:new Date().toISOString()};pendingScores[pendingScoreKey(item)]=item;persistPendingScores()}render();if(s.sharedRoundId){const synced=await syncPendingScores();if(!synced&&navigator.onLine)alert('Your score is protected on this phone but has not synchronized yet. The app will keep retrying.')}}
function prev(){if(s.hole>1){s.hole--;render()}}
function next(){if(s.hole<s.holes){s.hole++;render()}else{s.done=true;s.v='recap';render()}}
async function openScorecard(){if(s.sharedRoundId)await loadSharedRound(false);s.v='recap';render()}
function copyRoundCode(){navigator.clipboard?.writeText(s.joinCode).then(()=>alert('Round code copied.')).catch(()=>alert('Round code: '+s.joinCode))}
function roundJoinUrl(){
  const base=new URL('./',window.location.href);
  base.search='';
  base.hash='';
  base.searchParams.set('join',s.joinCode);
  return base.href;
}
function showRoundQr(){
  if(!s.joinCode)return;
  const overlay=document.createElement('div');overlay.className='qr-overlay';overlay.onclick=event=>{if(event.target===overlay)overlay.remove()};
  overlay.innerHTML=`<section class="qr-modal"><button class="qr-close" onclick="this.closest('.qr-overlay').remove()">×</button><h2>Scan to Join</h2><p class="muted">Open the camera on another golfer's phone.</p><div id="roundQr"></div><b class="qr-code-text">${esc(s.joinCode)}</b><p class="small muted">${esc(roundJoinUrl())}</p><button class="secondary" onclick="shareRoundLink()">Share Join Link</button></section>`;
  document.body.appendChild(overlay);
  if(window.QRCode)new QRCode($('roundQr'),{text:roundJoinUrl(),width:220,height:220,colorDark:'#123f2b',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
  else $('roundQr').innerHTML='<div class="notice">QR generator unavailable. Use Share Join Link instead.</div>';
}
async function shareRoundLink(){const text=`Join my Agape Tumoutou Golfers round. Code: ${s.joinCode}`;if(navigator.share){try{await navigator.share({title:'Join Golf Round',text,url:roundJoinUrl()});return}catch(error){if(error.name==='AbortError')return}}navigator.clipboard?.writeText(roundJoinUrl()).then(()=>alert('Join link copied.')).catch(()=>alert(roundJoinUrl()))}
async function openRoundChat(){
  if(!s.sharedRoundId||!currentUser){alert('Join a round before opening its chat.');return}
  await loadRoundMessages();s.v='chatView';render();
}
async function loadRoundMessages(showError=true){
  if(!s.sharedRoundId||!currentUser)return false;
  const {data,error}=await db.from('round_messages').select('id,user_id,message,created_at').eq('round_id',s.sharedRoundId).order('created_at').limit(200);
  if(error){if(showError)alert('Round chat could not be loaded. Make sure the Supabase chat upgrade has been installed.');return false}
  chatMessages=data||[];return true;
}
function chatView(){
  const nameFor=userId=>sharedPlayers.find(player=>player.user_id===userId)?.display_name||'Golfer';
  app.innerHTML=`<div class="row"><button class="back" onclick="s.v='round';render()">← Round</button><button class="back" onclick="loadRoundMessages().then(()=>render())">Refresh</button></div><h1>Round Chat</h1><p class="muted">Only golfers in this round can see these messages.</p><section id="chatMessages" class="chat-messages">${chatMessages.length?chatMessages.map(item=>`<article class="chat-bubble ${item.user_id===currentUser.id?'mine':''}"><b>${esc(nameFor(item.user_id))}</b><p>${esc(item.message)}</p><small>${new Date(item.created_at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</small></article>`).join(''):'<div class="empty">No messages yet. Say hello to the group!</div>'}</section><form class="chat-compose" onsubmit="event.preventDefault();sendRoundMessage()"><input id="chatInput" maxlength="500" autocomplete="off" placeholder="Message everyone in this round" aria-label="Chat message"><button type="submit">Send</button></form>`;
  setTimeout(()=>{const box=$('chatMessages');if(box)box.scrollTop=box.scrollHeight},0);
}
async function sendRoundMessage(){
  const input=$('chatInput'),message=input?.value.trim();if(!message)return;
  input.disabled=true;
  const {error}=await db.from('round_messages').insert({round_id:s.sharedRoundId,user_id:currentUser.id,message});
  if(error){input.disabled=false;alert('Message could not be sent: '+error.message);return}
  input.value='';await loadRoundMessages(false);render();
}
function recap(){app.innerHTML=`<button class="back" onclick="s.v='round';render()">← Back to round</button><div class="row"><div><h1>${s.done?'Round Complete':'Live Scorecard'}</h1><p class="muted">${esc(s.course)} · ${s.holes} holes</p></div>${s.sharedRoundId?'<button class="locate" onclick="refreshSharedRound()">Refresh</button>':''}</div><div class="table-wrap"><table><thead><tr><th>Player</th>${s.pars.map((_,i)=>`<th>${i+1}</th>`).join('')}<th>Total</th><th>+/−</th></tr></thead><tbody>${s.players.map(x=>`<tr><td><b>${esc(x)}${isMyPlayer(x)?' (You)':''}</b></td>${s.pars.map((_,i)=>`<td>${s.scores[x]?.[i+1]||'–'}</td>`).join('')}<td>${total(x)||'–'}</td><td class="green">${total(x)?rel(total(x)-parTotal(s.holes)):'–'}</td></tr>`).join('')}<tr><td><b>Par</b></td>${s.pars.map(x=>`<td>${x}</td>`).join('')}<td>${parTotal(s.holes)}</td><td>E</td></tr></tbody></table></div><button class="primary" onclick="finishRound()">Done</button>`}
function finishRound(){s.resumeView=null;s.v='home';render()}
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
db.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'){
    recoveryMode=true;currentUser=session?.user||null;
    setTimeout(()=>changePassword(),250);
  }
});
window.addEventListener('online',async()=>{await syncPendingScores();await loadCourses();if(s.sharedRoundId)await loadSharedRound(false);render()});
window.addEventListener('offline',updateSyncIndicator);
if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
initializeCloud();
