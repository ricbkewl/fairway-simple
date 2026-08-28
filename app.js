const app = document.querySelector('#app');
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const SUPABASE_URL = 'https://rntmqjqbmjfcpwbbflyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_r6fBc5CmRwlyLhTnk7u6BA_rRA1Pmoj';
const APP_URL = 'https://ricbkewl.github.io/fairway-simple/';
const MAPTILER_API_KEY = 'PpgeIcwg8NbSQTMZm4wr';
const WEATHER_CACHE_MS = 10*60*1000;
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}
});
const CLUBS=['Driver','3 Wood','5 Wood','7 Wood','2 Hybrid','3 Hybrid','4 Hybrid','5 Hybrid','2 Iron','3 Iron','4 Iron','5 Iron','6 Iron','7 Iron','8 Iron','9 Iron','Pitching Wedge','Gap Wedge','Sand Wedge','Lob Wedge'];
const roundDefault = {v:'home',course:'',courseId:null,holes:18,players:[''],pars:[],scores:{},hole:1,done:false,resumeView:null,ownerUserId:null,createdBy:null};
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
let historyRounds=[],historyDetail=null,historyLoading=false,historyError='',historyControlsReady=true;
let registeredGolfers=[],registeredGolfersLoading=false,registeredGolfersError='';
let golferProfile=null,golferProfileError='',signupEmail='',usersReturnView='accountView',coursesReturnView='home';
let clubDistances={},clubProfileError='';
let roundChannel=null,subscribedRoundId=null,realtimeTimer=null;
let chatMessages=[],chatTimer=null,unreadChatCount=0,chatToastTimer=null;
let qrScanner=null,qrScanLocked=false;
let avatarCacheVersion=Date.now();
let currentWeather=null,weatherLoading=false,weatherCache=JSON.parse(localStorage.atgWeatherCache||'{}');
let lastKnownPosition=null,lastGpsAccuracyYards=null,inlineHoleMap=null,inlineGolferMarker=null;
let shotPlannerEnabled=sessionStorage.atgShotPlanner!=='off',inlinePlannerMarker=null,inlinePlannerLines=[],inlinePlannerLabels=[],shotPlannerGreen=null;
const shotPlannerAims={};
let coursePreviewMaps=[];
let liveMapStyle=localStorage.atgLiveMapStyle==='street'?'street':'satellite';
let pendingScores=JSON.parse(localStorage.atgPendingScores||'{}');
let scoreSyncPromise=null;
let recoveryMode=false;
const save=()=>{localStorage.atgRound=JSON.stringify(s)};
const rel=n=>n===0?'E':n>0?'+'+n:n;
const parTotal=n=>s.pars.slice(0,n).reduce((a,b)=>a+b,0);
const total=(p,n=s.holes)=>Array.from({length:n},(_,i)=>s.scores[p]?.[i+1]||0).reduce((a,b)=>a+b,0);
const courseById=id=>courses.find(c=>c.id===id);
function avatarUrl(path){if(!path)return'';return db.storage.from('golfer-avatars').getPublicUrl(path).data.publicUrl+'?v='+avatarCacheVersion}
function avatarMarkup(path,name,className='profile-photo'){const label=name||'Golfer';return path?`<img class="${className}" src="${esc(avatarUrl(path))}" alt="${esc(label)} profile picture">`:`<span class="${className} avatar-fallback">${esc(label.charAt(0).toUpperCase()||'G')}</span>`}

function render(){save();stopLocation();if(inlineHoleMap){inlineHoleMap.remove();inlineHoleMap=null;inlineGolferMarker=null;inlinePlannerMarker=null;inlinePlannerLines=[];inlinePlannerLabels=[];shotPlannerGreen=null}for(const previewMap of coursePreviewMaps){try{previewMap.remove()}catch{}}coursePreviewMaps=[];if(map){if(draft){const center=map.getCenter();draft.mapView={lat:center.lat,lng:center.lng,zoom:map.getZoom()}}map.remove();map=null}app.className='';({home,setup,pars,round,recap,coursesView,mapCourse,accountView,historyView,historyDetailView,clubsView,chatView,usersView,signupView,profileView,roundManageView}[s.v]||home)();if(!['home','signupView'].includes(s.v))bottomNav()}
function appGuide(){return`<details class="app-guide"><summary><span>App Guide & About</span><b>＋</b></summary><div class="guide-body"><section class="founder-card"><img src="rick-kulon-profile.jpg" alt="Rick Kulon, creator of the Agape Tumoutou Golfers app"><div><small>CREATED FOR THE FELLOWSHIP</small><h2>Agape Tumoutou Golfers</h2><p>A shared golf companion created by Rick Kulon for easier, fairer and more connected fellowship rounds.</p></div></section><h3>Quick Start</h3><ol><li>Sign up, then <b>verify your email</b> before signing in.</li><li>Finish your profile and save your club distances.</li><li>Create a round and share its code or QR, or join a friend's round.</li><li>Each golfer uses their own phone and enters only their own score.</li></ol><h3>Save It to Your Home Screen</h3><div class="install-guide"><section><h4>iPhone or iPad</h4><ol><li>Open in <b>Safari</b>.</li><li>Tap <b>Share → Add to Home Screen → Add</b>.</li></ol></section><section><h4>Android</h4><ol><li>Open in <b>Chrome</b>.</li><li>Tap the menu, then <b>Install app</b> or <b>Add to Home screen</b>.</li></ol></section></div><div class="notice guide-tip"><b>Tip:</b> If the link opens in Messages or Facebook, choose <b>Open in Safari</b> or <b>Open in Chrome</b> first.</div><h3>My Clubs & Suggested Club</h3><p>Open <b>Account → My Clubs & Distances</b> and save your normal carry distance. Suggested Club uses those personal distances during play.</p><div class="notice guide-tip"><b>Remember:</b> Check the wind, hazards and lie before choosing your club.</div><h3>What the App Does</h3><ul class="guide-features"><li>Shared courses with searchable street and satellite maps</li><li>Default movable shot planner with Aim 1/Aim 2 guidance</li><li>On-map yards to hit, route remaining and personalized club suggestions</li><li>Protected scoring, live scorecards, sharing and match history</li><li>Round codes, join QR, group chat and unread alerts</li><li>Remembered accounts, profiles and golfer pictures</li><li>Host controls plus secure administrator course tools</li><li>Current-round recovery, offline score sync and Home Screen icons</li></ul><div class="guide-update">Last updated August 28, 2026</div><div class="guide-contact"><p>Suggestions for improving the app are welcome.</p><a href="mailto:ricbkewl@gmail.com?subject=Agape%20Golf%20App%20Suggestion">✉ ricbkewl@gmail.com</a><a href="sms:+16074383208">✆ Text 607.438.3208</a></div></div></details>`}
function activeRoundHomeCard(){if(!s.sharedRoundId||!s.joinCode)return'';if(s.done)return`<section class="active-round-card"><div><small>COMPLETED ROUND</small><b>${esc(s.course)}</b><span>Your scorecard is saved.</span></div><div class="active-round-actions completed-actions"><button onclick="openCurrentRound()">Scorecard</button>${s.createdBy===currentUser?.id?'<button onclick="openRoundManagement()">Manage</button>':''}<button onclick="shareCurrentScorecard()">Share</button></div></section>`;return`<section class="active-round-card"><div><small>ACTIVE ROUND</small><b>${esc(s.course)}</b><span>Join code <strong>${esc(s.joinCode)}</strong></span></div><div class="active-round-actions"><button onclick="copyRoundCode()">Copy</button><button onclick="showRoundQr()">Show Join QR</button><button onclick="shareRoundLink()">Share</button></div></section>`}
function profileMissingItems(){if(!currentUser)return[];const missing=[];if(!golferProfile?.first_name||!golferProfile?.last_name)missing.push('your full name');if(!golferProfile?.phone)missing.push('your phone number');if(!golferProfile?.avatar_path)missing.push('a profile picture');return missing}
function profileCompletionReminder(){const missing=profileMissingItems();if(!missing.length)return'';return`<button class="profile-reminder" onclick="openProfile()"><span>!</span><div><b>Finish Your Golfer Profile</b><small>Add ${esc(missing.join(', '))}.</small></div><i>→</i></button>`}
function clubCompletionReminder(){if(!currentUser||clubProfileError||currentUser.user_metadata?.club_setup_complete===true)return'';const count=Object.keys(clubDistances).length;return`<button class="profile-reminder clubs-reminder" onclick="openClubs()"><span>⛳</span><div><b>Finish Setting Up My Clubs</b><small>${count?`${count} club${count===1?'':'s'} saved. Add the rest of the clubs you carry.`:'Add the carry distance for each club you use.'}</small></div><i>→</i></button>`}
function homeSignInForm(){if(currentUser)return profileCompletionReminder()+clubCompletionReminder();if(cloudLoading)return'<div class="home-auth-loading">Checking your saved login…</div>';return`<form class="home-signin" onsubmit="signInFromHome(event)"><div class="home-signin-heading"><span>♙</span><div><b>Golfer Sign In</b><small>Sign in before creating or joining a round</small></div></div><label for="homeEmail">Email</label><input id="homeEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" required placeholder="you@example.com"><label for="homePassword">Password</label><input id="homePassword" type="password" autocomplete="current-password" required placeholder="Enter your password"><div id="homeSignInError" class="home-signin-error" role="alert"></div><button id="homeSignInButton" class="primary home-signin-button" type="submit">Sign In</button></form><div class="home-action-divider"><span>ROUND OPTIONS</span></div>`}
function home(){const canResume=(s.sharedRoundId||['setup','pars','round','recap'].includes(s.resumeView))&&!s.done;app.className='home-page';app.innerHTML=`<section class="home-hero"><div class="logo-wrap"><img src="agape-golf-logo.png" alt="Agape Tumoutou Golfers logo" class="landing-logo"></div><div class="home-brand">FAITH · FELLOWSHIP · FAIRWAYS</div><h1>Saved to <span>Serve</span></h1><p class="scripture"><strong><em>“Who hath saved us, and called us<br>with a holy calling...”</em> <span>2 Tim. 1:9</span></strong></p><div class="feature-pills"><span>⛳ Shared Courses</span><span>◎ Live GPS</span><span>＋ Protected Scoring</span><span>💬 Live Chat</span></div></section><section class="home-actions">${homeSignInForm()}${cloudLoading?'<div class="notice">Loading shared courses…</div>':''}${cloudError?`<div class="error-notice">${esc(cloudError)}</div>`:''}${canResume?'<button class="primary home-primary" onclick="resumeRound()">Resume Current Round <b>→</b></button><button class="secondary home-secondary" onclick="start()">Start a New Round</button>':`<button class="primary home-primary" onclick="start()" ${cloudLoading?'disabled':''}>Create a Round <b>→</b></button>`}${activeRoundHomeCard()}<button class="secondary home-secondary" onclick="joinRound()">Join with Round Code</button><button class="secondary home-secondary scan-round-button" onclick="showQrScanner()">▣ Scan Round QR</button><div class="account-bar">${currentUser?`<span class="account-status"><i></i>${adminRole?esc(adminRole.replace('_',' ')):'Golfer signed in'}</span><button class="back" onclick="accountAction()">Account</button>`:`<span><button class="back" onclick="createAccount()">Sign Up</button></span><span><button class="back" onclick="forgotPassword()">Forgot Password?</button></span>`}</div></section>${appGuide()}<footer class="home-footer">Saved to serve · Ready to play</footer>`}
function myRoundPlayerName(){return s.players.find(name=>isMyPlayer(name))||s.players[0]||''}
function roundBottomNav(){
  const name=myRoundPlayerName(),encoded=encodeURIComponent(name),holeScore=scoreValue(name)||Number(s.pars[s.hole-1])||0,roundTotal=total(name,s.hole);
  app.insertAdjacentHTML('beforeend',`<nav class="round-action-bar" aria-label="Round controls"><div class="round-score-dock"><button onclick="changeScore('${encoded}',-1)" aria-label="Subtract one stroke">−</button><div><b>${holeScore}</b><small>Total ${roundTotal}</small></div><button onclick="changeScore('${encoded}',1)" aria-label="Add one stroke">+</button></div><button class="round-dock-button" onclick="openRoundChat()" ${s.sharedRoundId?'':'disabled'}><span class="chat-nav-icon">💬<i id="chatUnreadBadge" class="chat-unread ${unreadChatCount?'':'hidden'}">${unreadChatCount>99?'99+':unreadChatCount}</i></span><small>Chat</small></button><button class="round-dock-button" onclick="openScorecard()"><span>▦</span><small>Scorecard</small></button><button class="round-dock-button" onclick="showRoundQuickMenu()"><span>•••</span><small>Menu</small></button></nav>`)
}
function bottomNav(){if(s.v==='round'){roundBottomNav();return}app.insertAdjacentHTML('beforeend',`<nav class="bottom-nav ${s.sharedRoundId?'has-chat':''}" aria-label="Main navigation"><button onclick="goHome()"><span>⌂</span>Home</button>${s.sharedRoundId?'<button onclick="openCurrentRound()"><span>🏌</span>Round</button>':''}<button onclick="openCoursesFromNav()"><span>⛳</span>${adminRole==='super_admin'?'Courses/Players':'Courses'}</button>${s.sharedRoundId?`<button onclick="openRoundChat()"><span class="chat-nav-icon">💬<i id="chatUnreadBadge" class="chat-unread ${unreadChatCount?'':'hidden'}">${unreadChatCount>99?'99+':unreadChatCount}</i></span>Chat</button>`:''}<button onclick="accountAction()"><span>${currentUser?'●':'♙'}</span>${currentUser?'Account':'Login'}</button></nav>`)}
function closeRoundQuickMenu(){document.querySelector('.round-quick-overlay')?.remove()}
function showRoundQuickMenu(){
  closeRoundQuickMenu();const overlay=document.createElement('div');overlay.className='round-quick-overlay';overlay.onclick=event=>{if(event.target===overlay)closeRoundQuickMenu()};
  overlay.innerHTML=`<section class="round-quick-menu"><div><b>Round Menu</b><button onclick="closeRoundQuickMenu()" aria-label="Close menu">×</button></div><button onclick="closeRoundQuickMenu();goHome()"><span>⌂</span>Home</button><button onclick="closeRoundQuickMenu();openCurrentRound()"><span>🏌</span>Round</button><button onclick="closeRoundQuickMenu();openCoursesFromNav()"><span>⛳</span>${adminRole==='super_admin'?'Courses/Players':'Courses'}</button><button onclick="closeRoundQuickMenu();accountAction()"><span>●</span>Account</button></section>`;document.body.appendChild(overlay)
}
function rememberRoundView(){if(['setup','pars','round','recap'].includes(s.v)&&!s.done)s.resumeView=s.v}
function goHome(){rememberRoundView();s.v='home';render()}
async function resumeRound(){if(s.sharedRoundId)await loadSharedRound(false);s.v=s.done?'recap':(s.resumeView||'round');render()}
async function openCurrentRound(){if(!s.sharedRoundId){await resumeRound();return}await loadSharedRound(false);s.resumeView='round';s.v=s.done?'recap':'round';render()}
function openCoursesFromNav(){rememberRoundView();coursesReturnView='home';s.v='coursesView';render()}
async function accountAction(){if(!currentUser){await signInAccount();return}rememberRoundView();s.v='accountView';render()}
function accountView(){if(!currentUser){s.v='home';render();return}const fullName=[golferProfile?.first_name,golferProfile?.last_name].filter(Boolean).join(' ');app.innerHTML=`<button class="back" onclick="goHome()">← Back</button><h1>My Account</h1><section class="profile-card"><div class="profile-icon">${avatarMarkup(golferProfile?.avatar_path,fullName)}</div><div><b>${esc(fullName||'Golfer Profile')}</b><div class="small muted">${esc(currentUser.email||'')}</div><div class="small muted">${adminRole?esc(adminRole.replace('_',' ')):'Golfer account'}</div></div></section>${!golferProfile?'<div class="notice"><b>Complete your profile.</b> Existing accounts need a first name, last name and phone number.</div>':''}<div class="notice remember-notice">✓ You will stay signed in securely on this device until you choose Sign Out.</div><button class="primary" onclick="openProfile()">My Profile & Picture</button><button class="secondary" onclick="openClubs()">My Clubs & Distances</button><button class="secondary" onclick="openHistory()">Previous Matches</button><button class="secondary" onclick="changePassword()">Change Password</button>${adminRole==='super_admin'?'<button class="secondary" onclick="promoteCourseAdmin()">Add Course Admin</button>':''}<button class="secondary danger-button" onclick="signOutAdmin()">Sign Out</button>`}
async function initializeCloud(){
  cloudLoading=true;render();
  const {data:{session}}=await db.auth.getSession();
  currentUser=session?.user||null;
  if(s.ownerUserId&&s.ownerUserId!==currentUser?.id)s={...roundDefault};
  await Promise.all([loadAdminRole(),loadCourses(),loadClubDistances(),loadGolferProfile()]);
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
async function loadGolferProfile(){
  golferProfile=null;golferProfileError='';
  if(!currentUser)return;
  const {data,error}=await db.from('golfer_profiles').select('first_name,last_name,phone,avatar_path').eq('user_id',currentUser.id).maybeSingle();
  if(error){golferProfileError='Install the Golfer Profiles SQL update to save names and phone numbers.';return}
  golferProfile=data||null;
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
  clubDistances=distances;clubProfileError='';
  if(Object.keys(distances).length){const update=await db.auth.updateUser({data:{club_setup_complete:true}});if(!update.error)currentUser=update.data.user}
  alert(Object.keys(distances).length?'Your club distances are saved. Live club suggestions are now ready.':'Your bag is empty, so club suggestions remain turned off.');accountAction();
}
function driverAllowedForCurrentShot(){
  const green=courseById(s.courseId)?.greens?.[s.hole-1];
  if(!lastKnownPosition||!green?.tee||!golferIsNearHole(green))return true;
  const teeBuffer=Math.max(35,Math.min(60,(lastGpsAccuracyYards||0)+15));
  return distanceYards(lastKnownPosition,green.tee)<=teeBuffer;
}
function suggestedClubFor(yards,allowDriver=driverAllowedForCurrentShot()){
  if(!Number.isFinite(yards))return null;
  const savedBag=Object.entries(clubDistances).map(([club,carry])=>({club,carry:Number(carry)})).filter(x=>Number.isFinite(x.carry)),bag=(allowDriver?savedBag:savedBag.filter(x=>x.club.toLowerCase()!=='driver')).sort((a,b)=>a.carry-b.carry);
  if(!bag.length&&savedBag.length)return{club:'Fairway Club',note:'Driver is only suggested near the mapped tee. Add your other club distances.'};
  if(!bag.length)return null;
  const shortest=bag[0],longest=bag[bag.length-1];
  if(yards>longest.carry+35)return{club:longest.club,note:`Your longest saved carry is ${longest.carry} yd. Choose a safe lay-up target.`};
  if(yards<shortest.carry-15)return{club:shortest.club,note:`Your shortest saved carry is ${shortest.carry} yd. Consider a partial swing.`};
  const closest=bag.reduce((best,item)=>Math.abs(item.carry-yards)<Math.abs(best.carry-yards)?item:best,bag[0]);
  return{club:closest.club,note:`Saved carry ${closest.carry} yd · target is ${yards} yd`};
}
function updateClubSuggestion(centerYards,accuracyYards){
  const title=$('clubSuggestion'),note=$('clubSuggestionNote');if(!title||!note)return;
  if(accuracyYards>50){title.textContent='—';note.textContent='Waiting for a more accurate GPS signal.';return}
  if(centerYards>650){title.textContent='—';note.textContent='Move closer to the mapped hole for a club suggestion.';return}
  const suggestion=suggestedClubFor(centerYards,driverAllowedForCurrentShot());
  if(!suggestion){title.textContent='Set up My Clubs';note.textContent='Add your carry distances under Account to receive suggestions.';return}
  title.textContent=suggestion.club;note.textContent=suggestion.note;
}
async function signInAdmin(){
  const email=prompt('Administrator email:');if(!email)return;
  const password=prompt('Administrator password:');if(!password)return;
  const {data,error}=await db.auth.signInWithPassword({email:email.trim(),password});
  if(error){alert('Sign-in failed: '+error.message);return}
  currentUser=data.user;await Promise.all([loadAdminRole(),loadClubDistances(),loadGolferProfile()]);
  if(!adminRole){await db.auth.signOut();currentUser=null;alert('This account is not an authorized course administrator.');return}
  render();
}
async function signInAccount(){
  const email=prompt('Email address:');if(!email)return false;
  const password=prompt('Password:');if(!password)return false;
  const {data,error}=await db.auth.signInWithPassword({email:email.trim(),password});
  if(error){alert('Sign-in failed: '+error.message);if(confirm('Would you like a password-reset email?'))await sendPasswordReset(email.trim());return false}
  currentUser=data.user;await Promise.all([loadAdminRole(),loadClubDistances(),loadGolferProfile()]);render();return true;
}
async function signInFromHome(event){
  event.preventDefault();
  const email=$('homeEmail')?.value.trim(),password=$('homePassword')?.value;
  const button=$('homeSignInButton'),errorBox=$('homeSignInError');
  if(!email||!password)return false;
  button.disabled=true;button.textContent='Signing In…';errorBox.textContent='';
  const {data,error}=await db.auth.signInWithPassword({email,password});
  if(error){button.disabled=false;button.textContent='Sign In';errorBox.textContent='Email or password was not recognized. Try again or use Forgot Password.';return false}
  currentUser=data.user;
  if(s.ownerUserId&&s.ownerUserId!==currentUser.id)s={...roundDefault};
  await Promise.all([loadAdminRole(),loadClubDistances(),loadGolferProfile()]);render();return true;
}
function createAccount(){signupEmail='';s.v='signupView';render()}
function signupView(){
  if(currentUser){s.v='accountView';render();return}
  if(signupEmail){app.innerHTML=`<button class="back" onclick="goHome()">← Home</button><section class="verification-card"><div class="verification-icon">✉</div><h1>Verify Your Email</h1><p>We sent a verification link to <b>${esc(signupEmail)}</b>.</p><ol><li>Open your email inbox.</li><li>Tap the verification link from Supabase.</li><li>Return to the app and sign in.</li></ol><div class="notice">Check your Spam or Junk folder if the message does not arrive within a few minutes.</div><button class="primary" onclick="goHome()">Return to Sign In</button></section>`;return}
  app.innerHTML=`<button class="back" onclick="goHome()">← Home</button><h1>Create Golfer Account</h1><p class="muted">Every field is required. Your contact information is visible only to the Super Admin.</p><form class="signup-form" onsubmit="submitSignup(event)"><div class="name-fields"><label>First Name<input id="signupFirstName" autocomplete="given-name" maxlength="80" required></label><label>Last Name<input id="signupLastName" autocomplete="family-name" maxlength="80" required></label></div><label>Email<input id="signupEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" required></label><label>Phone Number<input id="signupPhone" type="tel" inputmode="tel" autocomplete="tel" minlength="7" maxlength="30" required placeholder="(555) 555-1234"></label><label>Password<input id="signupPassword" type="password" autocomplete="new-password" minlength="8" required></label><label>Confirm Password<input id="signupConfirmPassword" type="password" autocomplete="new-password" minlength="8" required></label><div id="signupError" class="error-notice hidden" role="alert"></div><button id="signupButton" class="primary" type="submit">Create Account</button></form><div class="notice"><b>Email verification is required.</b> After signing up, open the verification email before attempting to sign in.</div>`;
}
async function submitSignup(event){
  event.preventDefault();
  const firstName=$('signupFirstName').value.trim(),lastName=$('signupLastName').value.trim(),email=$('signupEmail').value.trim(),phone=$('signupPhone').value.trim(),password=$('signupPassword').value,confirmed=$('signupConfirmPassword').value;
  const errorBox=$('signupError'),button=$('signupButton');errorBox.classList.add('hidden');errorBox.textContent='';
  if(!firstName||!lastName||!email||phone.length<7){errorBox.textContent='Enter your first name, last name, email and phone number.';errorBox.classList.remove('hidden');return}
  if(password.length<8){errorBox.textContent='Use a password with at least 8 characters.';errorBox.classList.remove('hidden');return}
  if(password!==confirmed){errorBox.textContent='The passwords do not match.';errorBox.classList.remove('hidden');return}
  button.disabled=true;button.textContent='Creating Account…';
  const {data,error}=await db.auth.signUp({email,password,options:{emailRedirectTo:APP_URL,data:{first_name:firstName,last_name:lastName,phone}}});
  if(error){button.disabled=false;button.textContent='Create Account';errorBox.textContent='Account could not be created: '+error.message;errorBox.classList.remove('hidden');return}
  if(data.session){currentUser=data.user;await Promise.all([loadAdminRole(),loadClubDistances(),loadGolferProfile()]);s.v='accountView';render();return}
  signupEmail=email;render();
}
function openProfile(){if(!currentUser){s.v='home';render();return}s.v='profileView';render()}
function profileView(){
  if(!currentUser){s.v='home';render();return}
  const fullName=[golferProfile?.first_name,golferProfile?.last_name].filter(Boolean).join(' ')||'Golfer';
  app.innerHTML=`<button class="back" onclick="accountAction()">← Account</button><h1>My Profile</h1><p class="muted">Keep your contact details current. Only you and the Super Admin can access them.</p><section class="avatar-editor">${avatarMarkup(golferProfile?.avatar_path,fullName,'avatar-preview')}<div><b>Profile Picture</b><p id="profilePhotoStatus">${golferProfile?'Choose a clear square or portrait photo.':'Save your profile information first.'}</p><label class="avatar-upload-button">Choose Picture<input id="profilePhotoInput" type="file" accept="image/*" onchange="uploadProfilePhoto(this.files[0])" ${golferProfile?'':'disabled'}></label></div></section><div class="small muted avatar-privacy">Your picture is used as your app icon and appears in the private Super Admin Players directory. Uploaded pictures use a public image URL.</div>${golferProfileError?`<div class="error-notice">${esc(golferProfileError)}</div>`:''}<form class="signup-form" onsubmit="saveMyProfile(event)"><div class="name-fields"><label>First Name<input id="profileFirstName" autocomplete="given-name" maxlength="80" required value="${esc(golferProfile?.first_name||'')}"></label><label>Last Name<input id="profileLastName" autocomplete="family-name" maxlength="80" required value="${esc(golferProfile?.last_name||'')}"></label></div><label>Email<input value="${esc(currentUser.email||'')}" readonly></label><label>Phone Number<input id="profilePhone" type="tel" inputmode="tel" autocomplete="tel" minlength="7" maxlength="30" required value="${esc(golferProfile?.phone||'')}"></label><div id="profileError" class="error-notice hidden" role="alert"></div><button id="profileSaveButton" class="primary" type="submit" ${golferProfileError?'disabled':''}>Save Profile</button></form>`;
}
async function saveMyProfile(event){
  event.preventDefault();const firstName=$('profileFirstName').value.trim(),lastName=$('profileLastName').value.trim(),phone=$('profilePhone').value.trim(),button=$('profileSaveButton'),errorBox=$('profileError');
  if(!firstName||!lastName||phone.length<7){errorBox.textContent='First name, last name and phone number are required.';errorBox.classList.remove('hidden');return}
  button.disabled=true;button.textContent='Saving…';const {error}=await db.rpc('save_my_golfer_profile',{p_first_name:firstName,p_last_name:lastName,p_phone:phone});
  if(error){button.disabled=false;button.textContent='Save Profile';errorBox.textContent='Profile could not be saved: '+error.message;errorBox.classList.remove('hidden');return}
  golferProfile={...golferProfile,first_name:firstName,last_name:lastName,phone};alert('Your profile has been saved.');s.v='accountView';render();
}
async function resizeProfilePhoto(file){
  if(!file?.type.startsWith('image/'))throw new Error('Choose a picture from your photo library.');
  if(file.size>20*1024*1024)throw new Error('Choose a picture smaller than 20 MB.');
  const source=await new Promise((resolve,reject)=>{const image=new Image(),url=URL.createObjectURL(file);image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('This picture format could not be opened. Try JPEG or PNG.'))};image.src=url});
  const size=Math.min(source.naturalWidth,source.naturalHeight),left=(source.naturalWidth-size)/2,top=(source.naturalHeight-size)/2,canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
  canvas.getContext('2d').drawImage(source,left,top,size,size,0,0,512,512);
  return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The picture could not be resized.')),'image/jpeg',.84));
}
async function uploadProfilePhoto(file){
  if(!file)return;if(!golferProfile){alert('Save your first name, last name and phone number before adding a picture.');return}
  const status=$('profilePhotoStatus'),input=$('profilePhotoInput');status.textContent='Preparing picture…';input.disabled=true;
  try{
    const blob=await resizeProfilePhoto(file),path=`${currentUser.id}/avatar.jpg`;status.textContent='Uploading picture…';
    const upload=await db.storage.from('golfer-avatars').upload(path,blob,{contentType:'image/jpeg',cacheControl:'3600',upsert:true});
    if(upload.error)throw upload.error;
    const saved=await db.rpc('save_my_avatar_path',{p_avatar_path:path});if(saved.error)throw saved.error;
    golferProfile={...golferProfile,avatar_path:path};avatarCacheVersion=Date.now();alert('Your profile picture has been saved.');render();
  }catch(error){status.textContent=error.message||'The picture could not be uploaded.';input.disabled=false}
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
async function signOutAdmin(){await stopRoundRealtime();await db.auth.signOut();delete localStorage.atgPendingJoinCode;currentUser=null;adminRole=null;historyRounds=[];historyDetail=null;registeredGolfers=[];registeredGolfersError='';golferProfile=null;golferProfileError='';clubDistances={};clubProfileError='';s={...roundDefault};render()}
async function promoteCourseAdmin(){
  if(adminRole!=='super_admin'){alert('Only a super admin can add course administrators.');return}
  const email=prompt('Enter the email of an existing app user:');
  if(!email)return;
  if(!confirm(`Give ${email.trim()} permission to map and edit shared courses?`))return;
  const {data,error}=await db.rpc('set_course_admin',{target_email:email.trim()});
  if(error){alert('Administrator was not added: '+error.message);return}
  alert(`${data.email} is now a course administrator.`);
}
async function start(){if(!currentUser){alert('Each golfer needs an account so scores can be protected. Please sign in or create an account first.');await signInAccount();if(!currentUser)return}if(s.resumeView&&!s.done&&!confirm('Start a new round? Your unfinished round will be replaced.'))return;const playerName=golferProfile?.first_name?.trim()||'';s={...roundDefault,v:'setup',players:[playerName],scores:{},pars:[],resumeView:'setup',sharedRoundId:null,joinCode:null,ownerUserId:currentUser.id};render()}
function setup(){const options=courses.map(c=>`<option value="${esc(c.id)}" ${s.courseId===c.id?'selected':''}>${esc(c.name)} (${c.holes} holes)</option>`).join('');app.innerHTML=`<button class="back" onclick="goHome()">← Back</button><h1>Create a Round</h1><p class="muted">Choose a saved course to start immediately, or create a custom scorecard.</p><label>Saved course</label><select id="savedCourse" onchange="chooseCourse(this.value)"><option value="">Custom scorecard without GPS</option>${options}</select>${s.courseId?`<div class="notice">The saved GPS markers and hole pars will be used automatically.</div>`:`<label>Course name</label><input id="course" value="${esc(s.course)}" placeholder="e.g., Oak Valley Golf Club"><label>How many holes?</label><div class="row"><button class="choice ${s.holes===9?'on':''}" onclick="setHoles(9)">9 Holes</button><button class="choice ${s.holes===18?'on':''}" onclick="setHoles(18)">18 Holes</button></div>`}<label>Your name for this round</label><input aria-label="Your name for this round" value="${esc(s.players[0]||'')}" placeholder="Enter your name" oninput="updatePlayer(0,this.value)"><div class="notice">Your profile first name is entered automatically, but you can edit it. Other golfers join from their own phones.</div><button id="${s.courseId?'createRoundButton':'setupContinueButton'}" class="primary" onclick="goPars()">${s.courseId?'Create Protected Round':'Continue'}</button>`}
function chooseCourse(id){const c=courseById(id);if(c){s.courseId=c.id;s.course=c.name;s.holes=c.holes;s.pars=[...c.pars]}else{s.courseId=null;s.course='';s.pars=[]}render()}
function setHoles(n){s.holes=n;render()}
function addPlayer(){const n=$('name').value.trim();if(n&&!s.players.includes(n)){s.players.push(n);render()}}
function updatePlayer(i,name){s.players[i]=name;save()}
function removePlayer(i){s.players.splice(i,1);render()}
function goPars(){const names=s.players.map(x=>x.trim()).filter(Boolean);if(!names.length){alert('Enter at least one player name.');return}if(new Set(names.map(x=>x.toLowerCase())).size!==names.length){alert('Each player needs a different name.');return}s.players=names;if(!s.courseId)s.course=$('course').value.trim()||'Friendly Round';s.pars=Array.from({length:s.holes},(_,i)=>s.pars[i]||4);if(s.courseId){createSharedRound();return}s.v='pars';s.resumeView='pars';render()}
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
    db.from('shared_rounds').select('id,join_code,course_id,course_name,holes,pars,status,created_by').eq('id',s.sharedRoundId).single(),
    db.from('round_players').select('user_id,display_name,joined_at').eq('round_id',s.sharedRoundId).order('joined_at'),
    db.from('round_scores').select('user_id,hole,strokes').eq('round_id',s.sharedRoundId)
  ]);
  if(roundResult.error||playersResult.error||scoresResult.error){if(showError)alert('Shared scores could not be refreshed. Check your connection.');return false}
  const r=roundResult.data;s.joinCode=r.join_code;s.courseId=r.course_id;s.course=r.course_name;s.holes=r.holes;s.pars=r.pars;s.done=r.status==='complete';s.createdBy=r.created_by;
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
function updateChatBadge(){const badge=$('chatUnreadBadge');if(!badge)return;badge.textContent=unreadChatCount>99?'99+':String(unreadChatCount);badge.classList.toggle('hidden',!unreadChatCount)}
function showChatToast(item){
  document.querySelector('.chat-toast')?.remove();clearTimeout(chatToastTimer);
  const sender=sharedPlayers.find(player=>player.user_id===item.user_id)?.display_name||'A golfer';
  const toast=document.createElement('button');toast.className='chat-toast';toast.type='button';
  const title=document.createElement('b');title.textContent=`New message from ${sender}`;
  const message=document.createElement('span');message.textContent=String(item.message||'').slice(0,100);
  toast.append(title,message);toast.onclick=()=>openRoundChat();document.body.appendChild(toast);
  chatToastTimer=setTimeout(()=>toast.remove(),5000);
}
function handleIncomingChat(payload){
  const item=payload.new;if(!item||item.user_id===currentUser?.id)return;
  if(s.v!=='chatView'){unreadChatCount++;updateChatBadge();showChatToast(item)}
  scheduleChatRefresh();
}
function subscribeToRound(roundId){
  if(!roundId||subscribedRoundId===roundId)return;
  stopRoundRealtime();subscribedRoundId=roundId;
  roundChannel=db.channel(`round-${roundId}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'round_scores',filter:`round_id=eq.${roundId}`},scheduleRealtimeRefresh)
    .on('postgres_changes',{event:'*',schema:'public',table:'round_players',filter:`round_id=eq.${roundId}`},scheduleRealtimeRefresh)
    .on('postgres_changes',{event:'*',schema:'public',table:'shared_rounds',filter:`id=eq.${roundId}`},scheduleRealtimeRefresh)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'round_messages',filter:`round_id=eq.${roundId}`},handleIncomingChat)
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
  const [memberships,hiddenResult]=await Promise.all([
    db.from('round_players').select('round_id,display_name,joined_at').eq('user_id',currentUser.id).order('joined_at',{ascending:false}),
    db.from('hidden_round_history').select('round_id').eq('user_id',currentUser.id)
  ]);
  if(memberships.error){historyError='Your match history could not be loaded. Please try again.';return}
  historyControlsReady=!hiddenResult.error;const hiddenIds=new Set((hiddenResult.data||[]).map(x=>x.round_id));
  const visibleMemberships=(memberships.data||[]).filter(x=>!hiddenIds.has(x.round_id)),roundIds=visibleMemberships.map(x=>x.round_id);
  if(!roundIds.length)return;
  const [roundResult,scoreResult]=await Promise.all([
    db.from('shared_rounds').select('id,join_code,course_name,holes,pars,status,created_by,created_at').in('id',roundIds),
    db.from('round_scores').select('round_id,hole,strokes').eq('user_id',currentUser.id).in('round_id',roundIds)
  ]);
  if(roundResult.error||scoreResult.error){historyError='Your match history could not be loaded. Please try again.';return}
  const roundsById=new Map((roundResult.data||[]).map(x=>[x.id,x]));
  historyRounds=visibleMemberships.map(membership=>{
    const match=roundsById.get(membership.round_id);if(!match)return null;
    const scores=(scoreResult.data||[]).filter(x=>x.round_id===membership.round_id);
    const score=scores.reduce((sum,x)=>sum+x.strokes,0),complete=scores.length>=match.holes;
    const par=(match.pars||[]).reduce((sum,x)=>sum+Number(x||0),0);
    return {...match,displayName:membership.display_name,joinedAt:membership.joined_at,score,scoreCount:scores.length,complete,relative:complete?score-par:null};
  }).filter(Boolean).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
}
function formatMatchDate(value){return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(value))}
function formatAccountDate(value){if(!value)return'Never';return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(value))}
function directoryTabs(active){if(adminRole!=='super_admin')return'';return`<div class="directory-tabs"><button class="${active==='courses'?'on':''}" onclick="openCourses()">Courses</button><button class="${active==='players'?'on':''}" onclick="openRegisteredGolfers('coursesView')">Players</button></div>`}
async function openRegisteredGolfers(returnView='accountView'){
  if(adminRole!=='super_admin'){alert('Only the Super Admin can view registered golfers.');return}
  usersReturnView=returnView;
  registeredGolfersLoading=true;registeredGolfersError='';registeredGolfers=[];s.v='usersView';render();
  const {data,error}=await db.rpc('list_registered_golfers');
  registeredGolfersLoading=false;
  if(error){registeredGolfersError=error.message.includes('function')?'Install the Registered Golfers SQL update in Supabase first.':'Registered golfers could not be loaded.';render();return}
  registeredGolfers=data||[];render();
}
function refreshRegisteredGolfers(){openRegisteredGolfers(usersReturnView)}
function usersView(){
  if(adminRole!=='super_admin'){s.v='accountView';render();return}
  const backAction=usersReturnView==='coursesView'?'openCourses()':'accountAction()';
  app.innerHTML=`<button class="back" onclick="${backAction}">← ${usersReturnView==='coursesView'?'Courses':'Account'}</button><div class="row users-heading"><div><h1>Courses / Players</h1><p class="muted">Private player directory · Super Admin only</p></div>${!registeredGolfersLoading?'<button class="locate" onclick="refreshRegisteredGolfers()">Refresh</button>':''}</div>${directoryTabs('players')}${registeredGolfersLoading?'<div class="history-loading">Loading registered players…</div>':''}${registeredGolfersError?`<div class="error-notice">${esc(registeredGolfersError)}</div>`:''}${!registeredGolfersLoading&&!registeredGolfersError?`<div class="users-count">${registeredGolfers.length} registered ${registeredGolfers.length===1?'player':'players'}</div>`:''}${registeredGolfers.map(user=>{const name=[user.first_name,user.last_name].filter(Boolean).join(' ')||'—';return`<article class="user-card"><div class="user-avatar">${avatarMarkup(user.avatar_path,name,'user-avatar-image')}</div><div class="user-details"><b>${esc(name)}</b><span>${esc(user.email||'—')}</span><a href="tel:${esc(user.phone||'')}">${esc(user.phone||'—')}</a></div></article>`}).join('')}<div class="notice">Only first name, last name, email and phone number are listed. Course admins and regular golfers cannot access this directory.</div>`;
}
function historyView(){
  if(!currentUser){app.innerHTML='<button class="back" onclick="goHome()">← Back</button><h1>Previous Matches</h1><div class="notice">Sign in to see your saved matches.</div><button class="primary" onclick="signInAccount()">Sign In</button>';return}
  app.innerHTML=`<button class="back" onclick="accountAction()">← Account</button><div class="row"><div><h1>Previous Matches</h1><p class="muted">Every round played with this login is saved here.</p></div>${!historyLoading?'<button class="locate" onclick="openHistory()">Refresh</button>':''}</div>${!historyControlsReady?'<div class="notice">Install the History Controls SQL update to remove or permanently delete matches.</div>':''}${historyLoading?'<div class="history-loading">Loading your matches…</div>':''}${historyError?`<div class="error-notice">${esc(historyError)}</div>`:''}${!historyLoading&&!historyError&&!historyRounds.length?'<div class="empty history-empty"><b>No matches yet</b><span>Your completed and in-progress rounds will appear here.</span></div>':''}${historyRounds.map(match=>`<article class="history-card"><div class="history-top"><div><span class="history-date">${esc(formatMatchDate(match.created_at))}</span><h2>${esc(match.course_name)}</h2><span class="small muted">${match.holes} holes · ${esc(match.displayName)}</span></div><div class="history-score"><b>${match.score||'–'}</b><span>${match.complete?rel(match.relative):`${match.scoreCount}/${match.holes}`}</span></div></div><div class="history-bottom"><span class="status-chip ${match.complete?'complete':'progress'}">${match.complete?'Complete':'In progress'}</span><span class="history-card-actions"><button class="back remove-history-link" onclick="hideMatchFromHistory('${esc(match.id)}')">Remove</button><button class="back" onclick="openHistoryRound('${esc(match.id)}')">View →</button></span></div></article>`).join('')}`;
}
function historyCourseName(roundId){return historyDetail?.round?.id===roundId?historyDetail.round.course_name:historyRounds.find(match=>match.id===roundId)?.course_name||'this round'}
async function hideMatchFromHistory(roundId){
  if(!historyControlsReady){alert('Install the History Controls SQL update in Supabase first.');return}
  const course=historyCourseName(roundId);if(!confirm(`Remove ${course} from your match history? Other golfers will keep their records.`))return;
  const {error}=await db.rpc('hide_round_from_my_history',{p_round_id:roundId});if(error){alert('The match could not be removed: '+error.message);return}
  await openHistory();
}
async function deleteMatchForEveryone(roundId){
  if(!historyControlsReady){alert('Install the History Controls SQL update in Supabase first.');return}
  const course=historyCourseName(roundId);if(!confirm(`Permanently delete ${course} for every golfer? All players, scores and chat messages from this round will be erased.`))return;
  if(!confirm('This cannot be undone. Delete the shared round permanently?'))return;
  const {error}=await db.rpc('delete_owned_round',{p_round_id:roundId});if(error){alert('The round could not be deleted: '+error.message);return}
  if(s.sharedRoundId===roundId)s={...roundDefault};historyDetail=null;await openHistory();
}
async function openHistoryRound(roundId){
  historyLoading=true;historyError='';historyDetail=null;s.v='historyDetailView';render();
  const [roundResult,playersResult,scoresResult]=await Promise.all([
    db.from('shared_rounds').select('id,course_name,holes,pars,created_by,created_at').eq('id',roundId).single(),
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
  app.innerHTML=`<button class="back" onclick="openHistory()">← Matches</button><h1>${esc(match.course_name)}</h1><p class="muted">${esc(formatMatchDate(match.created_at))} · ${match.holes} holes</p><div class="table-wrap"><table><thead><tr><th>Hole #</th>${pars.map((_,i)=>`<th>${i+1}</th>`).join('')}<th>Total</th><th>+/−</th></tr><tr class="par-row"><th>Par</th>${pars.map(x=>`<th>${x}</th>`).join('')}<th>${fullPar}</th><th>E</th></tr></thead><tbody>${players.map(player=>{const score=playerTotal(player.user_id),complete=playerComplete(player.user_id);return`<tr><td><b>${esc(player.display_name)}${player.user_id===currentUser?.id?' (You)':''}</b></td>${pars.map((_,i)=>`<td>${playerScore(player.user_id,i+1)||'–'}</td>`).join('')}<td>${score||'–'}</td><td class="green">${complete?rel(score-fullPar):'–'}</td></tr>`}).join('')}</tbody></table></div><button class="primary" onclick="shareHistoryScorecard()">Share Scorecard</button><button class="secondary" onclick="hideMatchFromHistory('${esc(match.id)}')">Remove from My History</button>${match.created_by===currentUser?.id?`<button class="secondary danger-button" onclick="deleteMatchForEveryone('${esc(match.id)}')">Permanently Delete for Everyone</button>`:''}<div class="notice">Removing hides this match only from your account. Only the round creator can permanently delete the shared round for every golfer.</div>`;
}
function currentScorecardSnapshot(){return{course:s.course,date:new Date().toLocaleDateString(),pars:[...s.pars],players:s.players.map(name=>({name,scores:{...(s.scores[name]||{})}}))}}
function historyScorecardSnapshot(){
  if(!historyDetail)return null;const match=historyDetail.round;
  return{course:match.course_name,date:formatMatchDate(match.created_at),pars:[...(match.pars||[])],players:historyDetail.players.map(player=>({name:player.display_name,scores:Object.fromEntries(historyDetail.scores.filter(x=>x.user_id===player.user_id).map(x=>[x.hole,x.strokes]))}))};
}
function scorecardShareText(data){
  const par=data.pars.reduce((sum,x)=>sum+Number(x||0),0),lines=[`${data.course} · ${data.date}`];
  for(const player of data.players){const entries=Object.values(player.scores).filter(Number.isFinite),score=entries.reduce((sum,x)=>sum+Number(x),0),complete=entries.length>=data.pars.length;lines.push(`${player.name}: ${score||'No score'}${complete?` (${rel(score-par)})`:` · ${entries.length}/${data.pars.length} holes`}`)}
  lines.push('Agape Tumoutou Golfers · Saved to Serve');return lines.join('\n');
}
function loadScorecardLogo(){
  return new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src='agape-golf-logo.png'});
}
async function drawScorecardImage(data){
  const width=1600,rowH=76,left=50,nameW=330,holeW=112,totalW=150,groups=data.pars.length>9?[[0,9],[9,18]]:[[0,data.pars.length]],sectionH=150+data.players.length*rowH,height=230+groups.length*sectionH+80;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#f5f8f6';ctx.fillRect(0,0,width,height);ctx.fillStyle='#123f2b';ctx.fillRect(0,0,width,175);ctx.fillStyle='#e0bd66';ctx.font='800 30px system-ui';ctx.fillText('FAITH · FELLOWSHIP · FAIRWAYS',50,55);ctx.fillStyle='#fff';ctx.font='800 50px system-ui';ctx.fillText(data.course.slice(0,48),50,116);ctx.fillStyle='#c8ddcf';ctx.font='24px system-ui';ctx.fillText(`${data.date} · ${data.pars.length} holes`,50,151);
  const logo=await loadScorecardLogo();if(logo){const logoSize=138,logoX=width-logoSize-48,logoY=18;ctx.save();ctx.globalAlpha=.98;ctx.drawImage(logo,logoX,logoY,logoSize,logoSize);ctx.restore()}
  let y=205;const cell=(x,top,w,h,fill,text,bold=false,align='center')=>{ctx.fillStyle=fill;ctx.fillRect(x,top,w,h);ctx.strokeStyle='#d6e1db';ctx.strokeRect(x,top,w,h);ctx.fillStyle='#173126';ctx.font=`${bold?'800':'600'} 25px system-ui`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(String(text),align==='left'?x+14:x+w/2,top+h/2);ctx.textAlign='left'};
  for(const [start,end] of groups){const holes=Array.from({length:end-start},(_,i)=>start+i);cell(left,y,nameW,65,'#e5f1ea',start?'BACK NINE':'FRONT NINE',true,'left');holes.forEach((hole,i)=>cell(left+nameW+i*holeW,y,holeW,65,'#e5f1ea',hole+1,true));cell(left+nameW+holes.length*holeW,y,totalW,65,'#e0bd66','TOTAL',true);y+=65;cell(left,y,nameW,62,'#eff6f2','PAR',true,'left');holes.forEach((hole,i)=>cell(left+nameW+i*holeW,y,holeW,62,'#eff6f2',data.pars[hole],true));cell(left+nameW+holes.length*holeW,y,totalW,62,'#f5e7bc',holes.reduce((sum,h)=>sum+Number(data.pars[h]||0),0),true);y+=62;
    for(const player of data.players){cell(left,y,nameW,rowH,'#fff',player.name.slice(0,22),true,'left');holes.forEach((hole,i)=>cell(left+nameW+i*holeW,y,holeW,rowH,'#fff',player.scores[hole+1]||'–'));const subtotal=holes.reduce((sum,h)=>sum+Number(player.scores[h+1]||0),0);cell(left+nameW+holes.length*holeW,y,totalW,rowH,'#f8fbf9',subtotal||'–',true);y+=rowH}y+=22;
  }
  ctx.fillStyle='#4f675b';ctx.font='22px system-ui';ctx.fillText('Shared from Agape Tumoutou Golfers · Saved to Serve',50,height-35);return canvas;
}
async function shareScorecardData(data){
  if(!data)return;const canvas=await drawScorecardImage(data),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob){alert('The scorecard image could not be created.');return}
  const file=new File([blob],`agape-scorecard-${new Date().toISOString().slice(0,10)}.png`,{type:'image/png'}),text=scorecardShareText(data);
  if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:`${data.course} Scorecard`,text,files:[file]});return}catch(error){if(error.name==='AbortError')return}}
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  try{await navigator.clipboard.writeText(text);alert('Scorecard image downloaded and score summary copied.')}catch{alert('Scorecard image downloaded.')}
}
function shareCurrentScorecard(){return shareScorecardData(currentScorecardSnapshot())}
function shareHistoryScorecard(){return shareScorecardData(historyScorecardSnapshot())}
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
function holeRoute(green){return[green?.tee,green?.aim1,green?.aim2,green?.center].filter(Boolean)}
function mappedHoleDistance(green){const route=holeRoute(green);if(route.length<2)return null;return Math.round(route.slice(1).reduce((sum,point,index)=>sum+distanceYards(route[index],point),0))}
function routeProjection(point,start,end){const latScale=Math.cos((start.lat+end.lat)*Math.PI/360),ax=start.lng*latScale,ay=start.lat,bx=end.lng*latScale,by=end.lat,px=point.lng*latScale,py=point.lat,dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;return length?((px-ax)*dx+(py-ay)*dy)/length:1}
function activeRouteSegment(here,green){const route=holeRoute(green);if(route.length<2)return null;if(!here)return{origin:route[0],target:route[1],index:1,isGreen:route[1]===green.center};for(let i=1;i<route.length;i++){const target=route[i],isLast=i===route.length-1,close=distanceYards(here,target)<45,passed=routeProjection(here,route[i-1],target)>.88;if(isLast||(!close&&!passed))return{origin:route[i-1],target,index:i,isGreen:target===green.center}}return{origin:route.at(-2),target:route.at(-1),index:route.length-1,isGreen:true}}
function shotPlannerKey(){return`${s.courseId||s.course}:${s.hole}`}
function golferIsNearHole(green){return Boolean(lastKnownPosition&&green?.center&&distanceYards(lastKnownPosition,green.center)<=3000)}
function shotPlannerOrigin(green){return golferIsNearHole(green)?lastKnownPosition:green.tee}
function pointBetween(start,end,ratio=.5){return{lat:start.lat+(end.lat-start.lat)*ratio,lng:start.lng+(end.lng-start.lng)*ratio}}
function routeDistance(points){return points.slice(1).reduce((sum,point,index)=>sum+distanceYards(points[index],point),0)}
function remainingRoutePoints(origin,aim,green){const route=holeRoute(green),segment=activeRouteSegment(origin,green);let tail=segment?route.slice(segment.index+1):[];if(!tail.length||tail.at(-1)!==green.center)tail=[...tail,green.center];return[aim,...tail]}
function routeRemainingFrom(origin,green){const route=holeRoute(green),segment=activeRouteSegment(origin,green);if(!segment)return 0;return routeDistance([origin,...route.slice(segment.index)])}
function defaultShotPlannerAim(green){
  const near=golferIsNearHole(green),here=near?lastKnownPosition:null,segment=activeRouteSegment(here,green);if(!segment)return green.center;
  if(!segment.isGreen)return segment.target;
  if(green.aim1||green.aim2)return green.center;
  const fullDistance=distanceYards(green.tee,green.center);if(fullDistance<=260)return green.center;
  const midpoint=pointBetween(green.tee,green.center,.5);if(here&&(distanceYards(here,midpoint)<40||routeProjection(here,green.tee,midpoint)>.92))return green.center;
  return midpoint;
}
function shotPlannerAim(green){const key=shotPlannerKey(),custom=shotPlannerAims[key];if(custom&&golferIsNearHole(green)&&distanceYards(lastKnownPosition,custom)<35)delete shotPlannerAims[key];return shotPlannerAims[key]||defaultShotPlannerAim(green)}
function toggleShotPlanner(){shotPlannerEnabled=!shotPlannerEnabled;sessionStorage.atgShotPlanner=shotPlannerEnabled?'on':'off';render()}
function resetShotPlannerAim(){if(!shotPlannerGreen)return;delete shotPlannerAims[shotPlannerKey()];const aim=shotPlannerAim(shotPlannerGreen);if(inlinePlannerMarker)inlinePlannerMarker.setLatLng(aim);updateShotPlanner(shotPlannerGreen)}
function updateShotPlanner(green){
  if(!shotPlannerEnabled||!green?.tee||!green?.center)return;
  const origin=shotPlannerOrigin(green),aim=shotPlannerAim(green),remainingPoints=remainingRoutePoints(origin,aim,green),toTarget=Math.round(distanceYards(origin,aim)),remaining=Math.round(routeDistance(remainingPoints)),routeTotal=toTarget+remaining;
  if(inlinePlannerMarker)inlinePlannerMarker.setLatLng(aim);if(inlinePlannerLines[0])inlinePlannerLines[0].setLatLngs([origin,aim]);if(inlinePlannerLines[1])inlinePlannerLines[1].setLatLngs(remainingPoints);
  if(inlinePlannerLabels[0])inlinePlannerLabels[0].setLatLng(pointBetween(origin,aim,.5));if(inlinePlannerLabels[1]&&remainingPoints[1])inlinePlannerLabels[1].setLatLng(pointBetween(remainingPoints[0],remainingPoints[1],.5));
  const hit=$('plannerLineTargetYards'),left=$('plannerLineRemainingYards'),goLabel=$('plannerLineRemainingLabel'),yardage=$('centerYards'),label=$('yardageTargetLabel');if(hit)hit.textContent=toTarget;if(left)left.textContent=remaining;if(goLabel)goLabel.classList.toggle('hidden',remaining<5);if(yardage)yardage.textContent=routeTotal;if(label)label.textContent='Route Remaining';
  if(golferIsNearHole(green))updateClubSuggestion(toTarget,lastGpsAccuracyYards??999)
}
function liveHoleMapPanel(green,h,p){
  if(!green?.tee||!green?.center)return`<section class="live-hole-map missing-hole-map"><b>Hole map unavailable</b><span>An administrator needs to map the tee and center green for Hole ${h}.</span></section>`;
  const yards=mappedHoleDistance(green);
  return`<section class="live-hole-map ${shotPlannerEnabled?'planner-on':''}"><div class="live-map-viewport"><div id="liveHoleMap" aria-label="Forward-facing course view of Hole ${h}"></div></div><div class="hole-map-summary round-map-summary"><div><small>HOLE</small><b>${h}</b></div><div><small>ROUTE REMAINING</small><b><span id="centerYards">${yards}</span> <i>YDS</i></b><span id="yardageTargetLabel" class="visually-hidden">Route Remaining</span></div><div><small>PAR</small><b>${p}</b></div><div class="hole-weather-summary"><small>WEATHER</small><span id="currentWeatherIcon">◌</span></div></div><div id="gpsStatus" class="visually-hidden">Locating…</div><div class="live-map-style-toggle" aria-label="Map style"><button class="${liveMapStyle==='street'?'on':''}" onclick="setLiveMapStyle('street')">Map</button><button class="${liveMapStyle==='satellite'?'on':''}" onclick="setLiveMapStyle('satellite')">Satellite</button></div><div class="shot-planner-controls"><button class="${shotPlannerEnabled?'on':''}" onclick="toggleShotPlanner()">◎ ${shotPlannerEnabled?'Hide':'Show'} Planner</button>${shotPlannerEnabled?'<button onclick="resetShotPlannerAim()">Reset Aim</button>':''}</div><div class="map-club-suggestion"><small>SUGGESTED CLUB</small><b id="clubSuggestion">—</b><span id="clubSuggestionNote" class="visually-hidden">Waiting for GPS</span></div><div class="hole-edge-navigation" aria-label="Change hole"><button class="hole-edge-arrow previous" onclick="prev()" aria-label="Previous hole" ${h===1?'disabled':''}>‹</button><button class="hole-edge-arrow next" onclick="next()" aria-label="Next hole">›</button></div><div class="forward-label">SHOT PLANNER · FORWARD</div><div class="map-wind-card"><small>WIND</small><span id="mapWindArrow" class="map-wind-arrow">↑</span><b id="mapWindSpeed">—</b><em id="mapWindLabel">Loading</em></div><div class="map-zoom-controls" aria-label="Map zoom controls"><button onclick="zoomLiveHoleMap(1)" aria-label="Zoom map in">+</button><button onclick="zoomLiveHoleMap(-1)" aria-label="Zoom map out">−</button></div><div class="hole-map-legend inline-legend"><span><i class="tee-dot"></i>Tee</span><span><i class="aim-dot"></i>Aim</span><span><i class="golfer-dot"></i>You</span><span><i class="green-dot"></i>Green</span></div><a class="hole-map-attribution" href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">© MapTiler</a></section>`;
}
function round(){
  if(s.done){s.v='recap';recap();return}
  ensureCurrentHolePar();const h=s.hole,p=s.pars[h-1],c=courseById(s.courseId),green=c?.greens?.[h-1];app.classList.add('round-fullscreen');
  app.innerHTML=green?liveHoleMapPanel(green,h,p):`<section class="live-hole-map missing-hole-map"><b>Hole map unavailable</b><span>An administrator needs to map Hole ${h}.</span></section>`;
  updateSyncIndicator();if(green){initInlineHoleMap(green);const segment=activeRouteSegment(null,green);if(segment)loadWeather(segment.origin,segment.target,segment.origin);startLocation(green)}
}
function yardagePanel(){return`<section class="gps-card"><div class="gps-signal-row top-gps-signal gps-compact-row"><div class="gps-accuracy"><b>GPS</b><div id="gpsStatus" class="small muted">Locating…</div></div><div class="hole-yardage-compact"><small id="yardageTargetLabel">Yards to Hole</small><b id="centerYards">–</b><em>yd</em></div><div class="top-weather-compact"><span id="currentWeatherIcon">◌</span><div><b id="currentTemperature">—°</b><small id="currentWeatherLabel">Loading</small></div></div></div><div class="club-suggestion featured-club"><div class="club-recommendation-copy"><small>Suggested Club</small><b id="clubSuggestion">—</b><span id="clubSuggestionNote">Waiting for an accurate GPS signal</span></div></div><button class="club-refresh-button" onclick="refreshLocation()">↻ Refresh GPS</button></section>`}
function orientInlineHoleMap(green,origin=null,target=null){
  if(!inlineHoleMap||!green?.tee||!green?.center)return;
  const segment=activeRouteSegment(null,green),start=origin||segment?.origin||green.tee,end=target||segment?.target||green.center,container=$('liveHoleMap'),bearing=bearingDegrees(start,end);if(container){container.dataset.forwardBearing=String(bearing);container.style.setProperty('--map-bearing',`${bearing}deg`);container.style.transform=`rotate(${-bearing}deg)`}
}
function zoomLiveHoleMap(change){if(!inlineHoleMap)return;inlineHoleMap.setZoom(inlineHoleMap.getZoom()+change,{animate:true})}
function setLiveMapStyle(style){liveMapStyle=style==='street'?'street':'satellite';localStorage.atgLiveMapStyle=liveMapStyle;render()}
function enableForwardMapDragging(){
  const viewport=document.querySelector('.live-map-viewport'),container=$('liveHoleMap');if(!viewport||!container)return;
  const pointers=new Map();let dragPointer=null,plannerPointer=null;
  const resetRemaining=()=>{plannerPointer=null;if(pointers.size===1){const [id]=pointers.keys();dragPointer=id}else dragPointer=null};
  viewport.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;const plannerHandle=shotPlannerEnabled&&event.target.closest?.('.shot-planner-marker');pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(plannerHandle){plannerPointer=event.pointerId;dragPointer=null}else if(pointers.size===1)dragPointer=event.pointerId;else dragPointer=null;try{viewport.setPointerCapture(event.pointerId)}catch{}});
  viewport.addEventListener('pointermove',event=>{const prior=pointers.get(event.pointerId);if(!prior)return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size!==1||!inlineHoleMap)return;const dx=event.clientX-prior.x,dy=event.clientY-prior.y;if(!dx&&!dy)return;const angle=Number(container.dataset.forwardBearing||0)*Math.PI/180,localX=Math.cos(angle)*dx-Math.sin(angle)*dy,localY=Math.sin(angle)*dx+Math.cos(angle)*dy;if(plannerPointer===event.pointerId&&inlinePlannerMarker&&shotPlannerGreen){event.preventDefault();const point=inlineHoleMap.latLngToContainerPoint(inlinePlannerMarker.getLatLng()),latLng=inlineHoleMap.containerPointToLatLng([point.x+localX,point.y+localY]);shotPlannerAims[shotPlannerKey()]={lat:latLng.lat,lng:latLng.lng};inlinePlannerMarker.setLatLng(latLng);updateShotPlanner(shotPlannerGreen);return}if(dragPointer===event.pointerId)inlineHoleMap.panBy([-localX,-localY],{animate:false})});
  const end=event=>{pointers.delete(event.pointerId);resetRemaining()};viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
}
function initInlineHoleMap(green){
  const container=$('liveHoleMap');if(!container||!green?.tee||!green?.center||!window.L)return;
  inlineHoleMap=L.map(container,{zoomControl:false,zoomSnap:.25,dragging:false,scrollWheelZoom:false,doubleClickZoom:'center',boxZoom:false,keyboard:false,touchZoom:'center',attributionControl:false});
  const useStreetAttribution=(fallback=false)=>{const label=document.querySelector('.forward-label'),credit=document.querySelector('.hole-map-attribution');if(label)label.textContent=fallback?'SATELLITE UNAVAILABLE · MAP VIEW · FORWARD':'MAP VIEW · FAIRWAY ROUTE · FORWARD';if(credit){credit.textContent='© OpenStreetMap';credit.href='https://www.openstreetmap.org/copyright/'}};
  if(liveMapStyle==='satellite'&&MAPTILER_API_KEY)addSatelliteLayer(inlineHoleMap,()=>useStreetAttribution(true));else{addStreetLayer(inlineHoleMap);useStreetAttribution(false)}
  const route=holeRoute(green),points=[...route,green.front,green.back].filter(Boolean);inlineHoleMap.fitBounds(points.map(point=>[point.lat,point.lng]),{padding:[72,48],maxZoom:22});inlineHoleMap.setZoom(inlineHoleMap.getZoom()-1,{animate:false});
  L.circleMarker(green.tee,{radius:9,color:'#fff',weight:3,fillColor:'#d8a93e',fillOpacity:1}).addTo(inlineHoleMap);
  for(const aim of[green.aim1,green.aim2].filter(Boolean))L.circleMarker(aim,{radius:8,color:'#fff',weight:3,fillColor:'#e0bd66',fillOpacity:1}).addTo(inlineHoleMap);
  L.circleMarker(green.center,{radius:10,color:'#fff',weight:3,fillColor:'#176b45',fillOpacity:1}).addTo(inlineHoleMap);
  if(shotPlannerEnabled){
    shotPlannerGreen=green;const origin=shotPlannerOrigin(green),aim=shotPlannerAim(green),remainingPoints=remainingRoutePoints(origin,aim,green),icon=L.divIcon({className:'shot-planner-marker',html:'<span>◎</span>',iconSize:[42,42],iconAnchor:[21,21]}),hitLabel=L.divIcon({className:'planner-line-label-marker hit-label',html:'<span><b id="plannerLineTargetYards">—</b> yd<small>to hit</small></span>',iconSize:[1,1],iconAnchor:[0,0]}),goLabel=L.divIcon({className:'planner-line-label-marker go-label',html:'<span id="plannerLineRemainingLabel"><b id="plannerLineRemainingYards">—</b> yd<small>to go</small></span>',iconSize:[1,1],iconAnchor:[0,0]});
    inlinePlannerLines=[L.polyline([origin,aim],{color:'#f5cf68',weight:5,opacity:1}).addTo(inlineHoleMap),L.polyline(remainingPoints,{color:'#f5dfa8',weight:3,opacity:.95,dashArray:'8 9'}).addTo(inlineHoleMap)];
    inlinePlannerMarker=L.marker(aim,{icon,interactive:true,keyboard:false,zIndexOffset:1200}).addTo(inlineHoleMap);inlinePlannerLabels=[L.marker(pointBetween(origin,aim,.5),{icon:hitLabel,interactive:false,keyboard:false,zIndexOffset:1100}).addTo(inlineHoleMap),L.marker(pointBetween(remainingPoints[0],remainingPoints[1]||remainingPoints[0],.5),{icon:goLabel,interactive:false,keyboard:false,zIndexOffset:1100}).addTo(inlineHoleMap)];updateShotPlanner(green);
  }
  enableForwardMapDragging();setTimeout(()=>orientInlineHoleMap(green),120);
}
function updateInlineGolferPosition(here,green){
  if(!inlineHoleMap||!here||!green?.center||distanceYards(here,green.center)>3000)return;
  if(inlineGolferMarker){inlineGolferMarker.setLatLng(here);return}
  inlineGolferMarker=L.circleMarker(here,{radius:9,color:'#fff',weight:3,fillColor:'#2476d1',fillOpacity:1}).addTo(inlineHoleMap);
}
function startLocation(green){
  if(!navigator.geolocation){$('gpsStatus').textContent='GPS is not supported by this browser.';return}
  locationWatch=navigator.geolocation.watchPosition(pos=>{
    const accuracyYards=Math.round(pos.coords.accuracy*1.094),status=$('gpsStatus');lastGpsAccuracyYards=accuracyYards;status.textContent=`Accuracy ±${accuracyYards} yd`;status.classList.toggle('gps-warning',accuracyYards>50);
    const here={lat:pos.coords.latitude,lng:pos.coords.longitude};lastKnownPosition=here;const near=golferIsNearHole(green),segment=activeRouteSegment(near?here:null,green);if(!segment)return;
    if(shotPlannerEnabled)updateShotPlanner(green);else{const origin=near?here:green.tee,targetYards=Math.round(distanceYards(origin,segment.target)),routeYards=Math.round(routeRemainingFrom(origin,green)),yardage=$('centerYards'),label=$('yardageTargetLabel');if(yardage)yardage.textContent=routeYards;if(label)label.textContent='Route Remaining';if(near)updateClubSuggestion(targetYards,accuracyYards)}
    updateInlineGolferPosition(here,green);orientInlineHoleMap(green,segment.origin,segment.target);loadWeather(near?here:green.tee,segment.target,green.tee);
  },err=>{if($('gpsStatus'))$('gpsStatus').textContent=err.code===1?'Location permission was denied. Allow it in browser settings.':'Unable to get a GPS signal.'},{enableHighAccuracy:true,maximumAge:3000,timeout:15000});
}
function stopLocation(){if(locationWatch!==null){navigator.geolocation.clearWatch(locationWatch);locationWatch=null}}
function refreshLocation(){const g=courseById(s.courseId)?.greens?.[s.hole-1];stopLocation();if(g)startLocation(g)}
function distanceYards(a,b){const R=6371000,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng),q=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))*1.0936133}
function bearingDegrees(a,b){const rad=x=>x*Math.PI/180,deg=x=>x*180/Math.PI,dLng=rad(b.lng-a.lng),lat1=rad(a.lat),lat2=rad(b.lat);return(deg(Math.atan2(Math.sin(dLng)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLng)))+360)%360}
function compassDirection(degrees){return['N','NE','E','SE','S','SW','W','NW'][Math.round(Number(degrees||0)/45)%8]}
function weatherDescription(code){if(code===0)return'Clear';if(code<=3)return'Partly cloudy';if([45,48].includes(code))return'Foggy';if(code>=51&&code<=67)return'Rain';if(code>=71&&code<=77)return'Snow';if(code>=80&&code<=82)return'Showers';if(code>=95)return'Thunderstorms';return'Changing conditions'}
function weatherConditionIcon(code){if(code===0)return'☀️';if(code<=3)return'⛅';if([45,48].includes(code))return'🌫️';if(code>=51&&code<=67)return'🌧️';if(code>=71&&code<=77)return'🌨️';if(code>=80&&code<=82)return'🌦️';if(code>=95)return'⛈️';return'🌤️'}
function windEffectText(weather,here,target){
  if(!target||!Number.isFinite(weather?.wind_speed_10m))return'Wind effect unavailable for this green';
  const shot=bearingDegrees(here,target),windTo=(Number(weather.wind_direction_10m)+180)%360,delta=((windTo-shot+540)%360)-180,speed=Number(weather.wind_speed_10m),along=Math.cos(delta*Math.PI/180)*speed,cross=Math.sin(delta*Math.PI/180)*speed;
  const parts=[];if(Math.abs(along)>=2)parts.push(`${Math.round(Math.abs(along))} mph ${along>0?'tailwind':'headwind'}`);else parts.push('mostly neutral wind');
  if(Math.abs(cross)>=2)parts.push(`${Math.round(Math.abs(cross))} mph ${cross>0?'left-to-right':'right-to-left'}`);
  return parts.join(' · ');
}
function relativeWindData(weather,origin,target){
  if(!origin||!target||!Number.isFinite(weather?.wind_speed_10m))return null;
  const holeBearing=bearingDegrees(origin,target),windTo=(Number(weather.wind_direction_10m)+180)%360,rotation=(windTo-holeBearing+360)%360,delta=((rotation+540)%360)-180,along=Math.cos(delta*Math.PI/180),cross=Math.sin(delta*Math.PI/180);
  const label=Math.abs(along)>=.55?(along>0?'Tailwind':'Headwind'):(cross>0?'Left to right':'Right to left');
  return{rotation,label,speed:Math.round(weather.wind_speed_10m)};
}
function updateMapWind(weather,origin,target){
  const arrow=$('mapWindArrow'),speed=$('mapWindSpeed'),label=$('mapWindLabel');if(!arrow||!speed||!label)return;
  const relative=relativeWindData(weather,origin,target);if(!relative){speed.textContent='—';label.textContent='Unavailable';return}
  arrow.style.transform=`rotate(${relative.rotation}deg)`;speed.textContent=`${relative.speed} mph`;label.textContent=relative.label;
}
function showWeather(weather,here,target,tee){
  const summary=$('weatherSummary'),effect=$('windEffect'),temperature=$('currentTemperature'),icon=$('currentWeatherIcon'),condition=$('currentWeatherLabel');
  if(!weather){if(summary)summary.textContent='Weather temporarily unavailable';if(effect)effect.textContent='GPS yardages still work normally';if(temperature)temperature.textContent='—°';if(icon)icon.textContent='◌';if(condition)condition.textContent='Weather unavailable';updateMapWind(null,tee||here,target);return}
  if(temperature)temperature.textContent=`${Math.round(weather.temperature_2m)}°`;if(icon)icon.textContent=weatherConditionIcon(weather.weather_code);if(condition)condition.textContent=weatherDescription(weather.weather_code);
  if(summary)summary.textContent=`${Math.round(weather.temperature_2m)}°F · ${weatherDescription(weather.weather_code)} · Wind ${Math.round(weather.wind_speed_10m)} mph ${compassDirection(weather.wind_direction_10m)}`;
  if(effect)effect.textContent=windEffectText(weather,tee||here,target);updateMapWind(weather,tee||here,target);
}
async function loadWeather(here,target,tee,force=false){
  const weatherPoint=target||here,key=`${weatherPoint.lat.toFixed(2)},${weatherPoint.lng.toFixed(2)}`,cached=weatherCache[key];
  if(!force&&cached&&Date.now()-cached.savedAt<WEATHER_CACHE_MS){currentWeather=cached.data;showWeather(currentWeather,here,target,tee);return}
  if(weatherLoading){if(currentWeather)showWeather(currentWeather,here,target,tee);return}
  weatherLoading=true;
  try{
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(weatherPoint.lat)}&longitude=${encodeURIComponent(weatherPoint.lng)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
    const response=await fetch(url);if(!response.ok)throw new Error('Weather unavailable');
    const payload=await response.json();currentWeather=payload.current||null;if(!currentWeather)throw new Error('Weather unavailable');
    weatherCache[key]={savedAt:Date.now(),data:currentWeather};localStorage.atgWeatherCache=JSON.stringify(weatherCache);showWeather(currentWeather,here,target,tee);
  }catch{showWeather(null,here,target,tee)}finally{weatherLoading=false}
}
function isMyPlayer(name){return !s.sharedRoundId||sharedPlayers.some(p=>p.display_name===name&&p.user_id===currentUser?.id)}
async function changeScore(encoded,d){const p=decodeURIComponent(encoded);if(s.sharedRoundId&&!isMyPlayer(p)){alert('Only '+p+' can edit this score.');return}s.scores[p]??={};const previous=s.scores[p][s.hole]??Number(s.pars[s.hole-1])??0;const nextScore=Math.max(1,previous+d);s.scores[p][s.hole]=nextScore;if(s.sharedRoundId){const item={round_id:s.sharedRoundId,user_id:currentUser.id,hole:s.hole,strokes:nextScore,updated_at:new Date().toISOString()};pendingScores[pendingScoreKey(item)]=item;persistPendingScores()}render();if(s.sharedRoundId){const synced=await syncPendingScores();if(!synced&&navigator.onLine)alert('Your score is protected on this phone but has not synchronized yet. The app will keep retrying.')}}
function prev(){if(s.hole>1){s.hole--;render()}}
function next(){if(s.hole<s.holes){s.hole++;render()}else{if(!s.sharedRoundId)s.done=true;s.v='recap';render()}}
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
function scannedRoundCode(value){
  const raw=String(value||'').trim();if(/^[A-Z0-9]{6}$/i.test(raw))return raw.toUpperCase();
  try{const url=new URL(raw);if(url.origin!==location.origin)return null;const code=url.searchParams.get('join');return/^[A-Z0-9]{6}$/i.test(code||'')?code.toUpperCase():null}catch{return null}
}
async function closeQrScanner(){
  const scanner=qrScanner;qrScanner=null;
  if(scanner){try{await scanner.stop()}catch{}try{scanner.clear()}catch{}}
  document.querySelector('.qr-scanner-overlay')?.remove();
}
async function showQrScanner(){
  if(!window.Html5Qrcode){alert('The QR scanner could not load. Use your phone camera or enter the round code instead.');return}
  await closeQrScanner();qrScanLocked=false;
  const overlay=document.createElement('div');overlay.className='qr-overlay qr-scanner-overlay';overlay.onclick=event=>{if(event.target===overlay)closeQrScanner()};
  overlay.innerHTML=`<section class="qr-modal scanner-modal"><button class="qr-close" onclick="closeQrScanner()">×</button><h2>Scan Round QR</h2><p class="muted">Point the camera at another golfer's join QR.</p><div id="roundQrReader"></div><div id="qrScannerStatus" class="small muted">Requesting camera access…</div><button class="secondary" onclick="closeQrScanner()">Cancel</button></section>`;
  document.body.appendChild(overlay);qrScanner=new Html5Qrcode('roundQrReader');
  try{
    await qrScanner.start({facingMode:'environment'},{fps:10,qrbox:{width:230,height:230}},async decoded=>{
      if(qrScanLocked)return;const code=scannedRoundCode(decoded);
      if(!code){$('qrScannerStatus').textContent='This is not an Agape Golf round QR.';return}
      qrScanLocked=true;await closeQrScanner();await joinRoundWithCode(code);
    },()=>{});
    if($('qrScannerStatus'))$('qrScannerStatus').textContent='Scanning…';
  }catch(error){if($('qrScannerStatus'))$('qrScannerStatus').textContent='Camera unavailable. Allow camera access, or enter the round code manually.'}
}
async function openRoundChat(){
  if(!s.sharedRoundId||!currentUser){alert('Join a round before opening its chat.');return}
  unreadChatCount=0;document.querySelector('.chat-toast')?.remove();await loadRoundMessages();s.v='chatView';render();
}
async function loadRoundMessages(showError=true){
  if(!s.sharedRoundId||!currentUser)return false;
  const {data,error}=await db.from('round_messages').select('id,user_id,message,created_at').eq('round_id',s.sharedRoundId).order('created_at').limit(200);
  if(error){if(showError)alert('Round chat could not be loaded. Make sure the Supabase chat upgrade has been installed.');return false}
  chatMessages=data||[];return true;
}
function chatView(){
  const nameFor=userId=>sharedPlayers.find(player=>player.user_id===userId)?.display_name||'Golfer';
  app.classList.add('chat-page');
  app.innerHTML=`<div class="row"><button class="back" onclick="s.v='round';render()">← Round</button><button class="back" onclick="loadRoundMessages().then(()=>render())">Refresh</button></div><h1>Round Chat</h1><p class="muted">Only golfers in this round can see these messages.</p><div class="chat-message-stage"><div class="chat-watermark" aria-hidden="true"><img src="agape-golf-logo.png" alt=""></div><section id="chatMessages" class="chat-messages">${chatMessages.length?chatMessages.map(item=>`<article class="chat-bubble ${item.user_id===currentUser.id?'mine':''}"><b>${esc(nameFor(item.user_id))}</b><p>${esc(item.message)}</p><small>${new Date(item.created_at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</small></article>`).join(''):'<div class="empty">No messages yet. Say hello to the group!</div>'}</section></div><form class="chat-compose" onsubmit="event.preventDefault();sendRoundMessage()"><input id="chatInput" maxlength="500" autocomplete="off" placeholder="Message everyone in this round" aria-label="Chat message"><button type="submit">Send</button></form>`;
  setTimeout(()=>{const box=$('chatMessages');if(box)box.scrollTop=box.scrollHeight},0);
}
async function sendRoundMessage(){
  const input=$('chatInput'),message=input?.value.trim();if(!message)return;
  input.disabled=true;
  const {error}=await db.from('round_messages').insert({round_id:s.sharedRoundId,user_id:currentUser.id,message});
  if(error){input.disabled=false;alert('Message could not be sent: '+error.message);return}
  input.value='';await loadRoundMessages(false);render();
}
function recap(){const host=s.createdBy===currentUser?.id;app.innerHTML=`<button class="back" onclick="s.v='round';render()">← Back to round</button><div class="row"><div><h1>${s.done?'Round Complete':'Live Scorecard'}</h1><p class="muted">${esc(s.course)} · ${s.holes} holes</p></div>${s.sharedRoundId?'<button class="locate" onclick="refreshSharedRound()">Refresh</button>':''}</div><div class="table-wrap"><table><thead><tr><th>Hole #</th>${s.pars.map((_,i)=>`<th>${i+1}</th>`).join('')}<th>Total</th><th>+/−</th></tr><tr class="par-row"><th>Par</th>${s.pars.map(x=>`<th>${x}</th>`).join('')}<th>${parTotal(s.holes)}</th><th>E</th></tr></thead><tbody>${s.players.map(x=>`<tr><td><b>${esc(x)}${isMyPlayer(x)?' (You)':''}</b></td>${s.pars.map((_,i)=>`<td>${s.scores[x]?.[i+1]||'–'}</td>`).join('')}<td>${total(x)||'–'}</td><td class="green">${total(x)?rel(total(x)-parTotal(s.holes)):'–'}</td></tr>`).join('')}</tbody></table></div><div class="scorecard-actions"><button class="primary" onclick="shareCurrentScorecard()">Share Scorecard</button>${host?'<button class="secondary" onclick="openRoundManagement()">Manage Round</button>':''}<button class="secondary" onclick="finishRound()">${s.done?'Return Home':'Leave Scorecard'}</button></div>`}
function finishRound(){s.resumeView=null;s.v='home';render()}
async function openRoundManagement(){if(!s.sharedRoundId)return;await loadSharedRound(false);s.v='roundManageView';render()}
function roundManageView(){
  const host=s.createdBy===currentUser?.id;
  app.innerHTML=`<button class="back" onclick="s.v=${s.done?'\'recap\'':'\'round\''};render()">← ${s.done?'Scorecard':'Round'}</button><h1>Round Management</h1><p class="muted">${esc(s.course)} · Code ${esc(s.joinCode||'')}</p><div class="round-status-card"><span class="status-chip ${s.done?'complete':'progress'}">${s.done?'Round complete':'Round active'}</span><b>${s.players.length} ${s.players.length===1?'golfer':'golfers'}</b></div><h2 class="section-heading">Players</h2>${sharedPlayers.map(player=>{const count=Object.keys(s.scores[player.display_name]||{}).length,isHost=player.user_id===s.createdBy;return`<article class="manage-player"><div>${avatarMarkup(null,player.display_name,'manage-player-avatar')}<span><b>${esc(player.display_name)}${player.user_id===currentUser?.id?' (You)':''}</b><small>${isHost?'Round host':`${count} ${count===1?'score':'scores'} recorded`}</small></span></div>${host&&!isHost&&!count?`<button onclick="removeRoundPlayer('${esc(player.user_id)}','${encodeURIComponent(player.display_name)}')">Remove</button>`:host&&!isHost?'<i title="Scores protect this player from removal">🔒</i>':''}</article>`}).join('')}${host?`<div class="management-actions">${s.done?'<button class="primary" onclick="setRoundStatus(\'active\')">Reopen Round</button>':'<button class="primary danger-solid" onclick="setRoundStatus(\'complete\')">End Round</button>'}<div class="notice">A player can only be removed before recording a score. This protects the scorecard from being altered after play begins.</div></div>`:'<div class="notice">Only the golfer who created the round can end it or manage its players.</div>'}`;
}
async function setRoundStatus(status){
  const action=status==='complete'?'end':'reopen';if(!confirm(`${action==='end'?'End':'Reopen'} this round for everyone?`))return;
  const {error}=await db.rpc('manage_round_status',{p_round_id:s.sharedRoundId,p_status:status});if(error){alert('Round could not be updated: '+error.message);return}
  s.done=status==='complete';await loadSharedRound(false);s.v='recap';render();
}
async function removeRoundPlayer(userId,encodedName){
  const name=decodeURIComponent(encodedName);if(!confirm(`Remove ${name} from this round?`))return;
  const {error}=await db.rpc('remove_round_player',{p_round_id:s.sharedRoundId,p_user_id:userId});if(error){alert('Player could not be removed: '+error.message);return}
  await loadSharedRound(false);render();
}
function openCourses(returnView){if(returnView)coursesReturnView=returnView;s.v='coursesView';render()}
function coursePreviewPoint(course){for(const green of course.greens||[]){const point=green?.center||green?.tee||green?.front||green?.back;if(point)return point}return null}
function filterSharedCourses(value){const query=String(value||'').trim().toLowerCase();let visible=0;for(const card of document.querySelectorAll('[data-course-name]')){const show=!query||card.dataset.courseName.includes(query);card.classList.toggle('hidden',!show);if(show)visible++}const empty=$('courseLibraryEmpty');if(empty)empty.classList.toggle('hidden',visible>0)}
function courseLibraryCard(course,index){const point=coursePreviewPoint(course);return`<article class="course-library-card" data-course-name="${esc(course.name.toLowerCase())}"><div class="course-preview">${point?`<div id="coursePreview${index}" class="course-preview-map" data-lat="${point.lat}" data-lng="${point.lng}" aria-label="Satellite preview of ${esc(course.name)}"></div>`:''}<div class="course-preview-placeholder"><span>⛳</span><small>${point?'Loading satellite preview':'Map this course for a preview'}</small></div>${point?'<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">© MapTiler</a>':''}</div><div class="course-card-info"><div><small>${course.holes} HOLES · ${mappedCount(course)} MAPPED</small><h2>${esc(course.name)}</h2><span>Shared course map</span></div>${adminRole?`<button onclick="editCourse(${index})">Edit</button>`:'<i>›</i>'}</div></article>`}
function initCoursePreviews(){
  const previews=[...document.querySelectorAll('.course-preview-map')];if(!previews.length||!window.L)return;
  const initialize=node=>{if(node.dataset.ready)return;node.dataset.ready='1';const previewMap=L.map(node,{zoomControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,touchZoom:false,attributionControl:false}).setView([Number(node.dataset.lat),Number(node.dataset.lng)],15);if(MAPTILER_API_KEY)addSatelliteLayer(previewMap);else addStreetLayer(previewMap);coursePreviewMaps.push(previewMap)};
  if(!('IntersectionObserver'in window)){previews.forEach(initialize);return}
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){initialize(entry.target);observer.unobserve(entry.target)}},{rootMargin:'180px'});previews.forEach(node=>observer.observe(node));
}
function coursesView(){const backView=coursesReturnView==='accountView'?'accountView':'home';app.innerHTML=`<button class="back" onclick="s.v='${backView}';render()">← ${backView==='accountView'?'Account':'Home'}</button><h1>${adminRole==='super_admin'?'Courses / Players':'Shared Courses'}</h1><p class="muted">Every golfer receives these course maps automatically. Only authorized administrators can change them.</p>${directoryTabs('courses')}${cloudError?`<div class="error-notice">${esc(cloudError)}</div>`:''}${courses.length?`<label class="course-library-search"><span>⌕</span><input type="search" placeholder="Search courses" aria-label="Search shared courses" oninput="filterSharedCourses(this.value)"></label><div id="courseLibraryEmpty" class="empty hidden">No courses match that search.</div><section class="course-library-grid">${courses.map(courseLibraryCard).join('')}</section>`:'<div class="empty">No shared courses have been mapped yet.</div>'}${adminRole?'<button class="primary" onclick="newCourse()">Map a New Course</button>':currentUser?'<div class="notice">Your account does not have course-manager permission.</div>':'<button class="secondary" onclick="signInAdmin()">Admin sign in</button>'}`;setTimeout(initCoursePreviews,0)}
function mappedCount(c){return(c.greens||[]).filter(g=>g.front&&g.center&&g.back).length}
function newCourse(){if(!adminRole){alert('Administrator sign-in required.');return}const name=prompt('Course name:');if(!name?.trim())return;const holes=confirm('Does this course have 18 holes?\nChoose Cancel for 9 holes.')?18:9;draft={id:crypto.randomUUID(),isNew:true,name:name.trim(),holes,pars:Array(holes).fill(4),greens:Array.from({length:holes},()=>({tee:null,aim1:null,aim2:null,front:null,center:null,back:null})),mapHole:1,target:'center'};s.v='mapCourse';render()}
function editCourse(i){if(!adminRole){alert('Administrator sign-in required.');return}draft=JSON.parse(JSON.stringify(courses[i]));draft.isNew=false;draft.mapHole=1;draft.target='center';s.v='mapCourse';render()}
function markerName(key){return({tee:'Tee',aim1:'Aim 1',aim2:'Aim 2',front:'Front',center:'Center',back:'Back'})[key]||key}
function markerButtons(keys,green){return keys.map(key=>`<button class="marker-tab ${draft.target===key?'on':''} ${green[key]?'set':''}" onclick="draft.target='${key}';render()">${markerName(key)} ${green[key]?'✓':''}</button>`).join('')}
function mapCourse(){if(!adminRole){s.v='coursesView';render();return}const h=draft.mapHole,g=draft.greens[h-1],satelliteReady=Boolean(MAPTILER_API_KEY);g.aim1??=null;g.aim2??=null;draft.mapStyle=draft.mapStyle||'street';app.innerHTML=`<button class="back" onclick="cancelMapping()">← Courses</button><h1>${esc(draft.name)}</h1><div class="row map-toolbar"><button class="back" onclick="mapPrev()">←</button><b>Hole ${h} of ${draft.holes}</b><button class="back" onclick="mapNext()">→</button></div><div class="row"><span>Par</span><div class="stepper"><button onclick="draft.pars[${h-1}]=Math.max(3,draft.pars[${h-1}]-1);render()">−</button><span>${draft.pars[h-1]}</span><button onclick="draft.pars[${h-1}]=Math.min(6,draft.pars[${h-1}]+1);render()">+</button></div></div><p class="muted small">Map Tee and the green as usual. Add Aim 1 or Aim 2 only where the normal playing route bends.</p><div class="marker-groups"><section><small>FAIRWAY ROUTE · AIM POINTS OPTIONAL</small><div class="marker-tabs three-tabs">${markerButtons(['tee','aim1','aim2'],g)}</div></section><section><small>GREEN</small><div class="marker-tabs three-tabs">${markerButtons(['front','center','back'],g)}</div></section></div><form class="course-search" onsubmit="event.preventDefault();searchCourseAddress()"><label for="courseSearch">Find course by name or address</label><div class="search-row"><input id="courseSearch" autocomplete="street-address" placeholder="Sierra Lakes Golf Club or street address"><button id="courseSearchButton" type="submit">Search</button></div></form><div id="courseSearchResults" class="search-results"></div><div class="search-divider"><span>or</span></div><button class="secondary locate-map" onclick="centerOnMe()">Use My Location to Find Course</button><div class="map-layer-toggle"><button class="${draft.mapStyle==='street'?'on':''}" onclick="setMapStyle('street')">Street</button><button class="${draft.mapStyle==='satellite'?'on':''}" onclick="setMapStyle('satellite')" ${satelliteReady?'':'disabled'}>Satellite</button></div>${satelliteReady?'':'<div class="satellite-key-note">Satellite view is ready for your MapTiler API key.</div>'}<div id="courseMap" aria-label="Course mapping map"></div><div id="mapMessage" class="notice">Tap the map to set ${markerName(draft.target)} for Hole ${h}.</div><div class="marker-clear-actions"><button class="secondary" onclick="clearMarker()">Clear ${markerName(draft.target)}</button><button class="secondary clear-all-markers" onclick="clearAllMarkers()">Clear All Markers · Hole ${h}</button></div><button id="saveCourseButton" class="primary" onclick="saveMappedCourse()">Save Shared Course</button>`;setTimeout(initMap,0)}
function setMapStyle(style){if(style==='satellite'&&!MAPTILER_API_KEY){alert('Add the MapTiler API key to activate satellite mapping.');return}draft.mapStyle=style;render()}
function addStreetLayer(targetMap){return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap'}).addTo(targetMap)}
function addSatelliteLayer(targetMap,onFallback){
  const layer=L.tileLayer(`https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}@2x.jpg?key=${encodeURIComponent(MAPTILER_API_KEY)}`,{tileSize:256,maxZoom:22,crossOrigin:true,attribution:'<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a>'});let failures=0,fellBack=false;
  layer.on('tileerror',()=>{if(fellBack||++failures<3)return;fellBack=true;targetMap.removeLayer(layer);addStreetLayer(targetMap);if(onFallback)onFallback()});return layer.addTo(targetMap);
}
function initMap(){
  const g=draft.greens[draft.mapHole-1],existing=g[draft.target],any=g.center||g.aim1||g.aim2||g.tee||g.front||g.back,view=draft.mapView?[draft.mapView.lat,draft.mapView.lng]:(existing||any||[34.1,-117.3]),zoom=draft.mapView?.zoom??(existing||any?18:10);map=L.map('courseMap').setView(view,zoom);
  if(draft.mapStyle==='satellite'&&MAPTILER_API_KEY)addSatelliteLayer(map,()=>{const message=$('mapMessage');if(message)message.textContent='Satellite imagery is unavailable. Street mapping has been restored.'});
  else addStreetLayer(map);
  const colors={tee:'#d8a93e',aim1:'#c68b2c',aim2:'#9b6c22',front:'#f4a340',center:'#176b45',back:'#174f9c'},route=holeRoute(g);if(route.length>1)L.polyline(route.map(point=>[point.lat,point.lng]),{color:'#d29f31',weight:4,opacity:.9,dashArray:'8 6'}).addTo(map);Object.entries(g).forEach(([k,p])=>{if(p)L.circleMarker(p,{radius:8,color:colors[k]||'#174f9c',fillOpacity:.9}).addTo(map).bindTooltip(markerName(k))});map.on('click',e=>{draft.greens[draft.mapHole-1][draft.target]={lat:e.latlng.lat,lng:e.latlng.lng};render()});
}
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
function clearAllMarkers(){
  const hole=draft.mapHole,markers=draft.greens[hole-1];
  if(!markers.tee&&!markers.aim1&&!markers.aim2&&!markers.front&&!markers.center&&!markers.back){alert(`Hole ${hole} has no markers to clear.`);return}
  if(!confirm(`Clear every route and green marker for Hole ${hole}?`))return;
  draft.greens[hole-1]={tee:null,aim1:null,aim2:null,front:null,center:null,back:null};render();
}
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
