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
let registeredGolfers=[],registeredGolfersLoading=false,registeredGolfersError='';
let golferProfile=null,golferProfileError='',signupEmail='',usersReturnView='accountView';
let clubDistances={},clubProfileError='';
let roundChannel=null,subscribedRoundId=null,realtimeTimer=null;
let chatMessages=[],chatTimer=null,unreadChatCount=0,chatToastTimer=null;
let qrScanner=null,qrScanLocked=false;
let avatarCacheVersion=Date.now();
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

function render(){save();stopLocation();if(map){if(draft){const center=map.getCenter();draft.mapView={lat:center.lat,lng:center.lng,zoom:map.getZoom()}}map.remove();map=null}app.className='';({home,setup,pars,round,recap,coursesView,mapCourse,accountView,historyView,historyDetailView,clubsView,chatView,usersView,signupView,profileView}[s.v]||home)();if(!['home','signupView'].includes(s.v))bottomNav()}
function appGuide(){return`<details class="app-guide"><summary><span>App Guide & About</span><b>＋</b></summary><div class="guide-body"><section class="founder-card"><img src="rick-kulon-profile.jpg" alt="Rick Kulon, creator of the Agape Tumoutou Golfers app"><div><small>CREATED FOR THE FELLOWSHIP</small><h2>Agape Tumoutou Golfers</h2><p>A shared golf companion created by Rick Kulon to make fellowship rounds easier, fairer and more connected.</p></div></section><h3>How to Get Started</h3><ol><li>Sign up with your first name, last name, email and phone number.</li><li><b>Open your email and tap the verification link.</b> You cannot sign in until your email is verified.</li><li>Return to the app and sign in with your email and password.</li><li>One golfer creates a round and shares its code or QR.</li><li>Other golfers join on their own phones and enter only their own scores.</li></ol><h3>My Clubs & Suggested Club</h3><p>Open <b>Account → My Clubs & Distances</b> and enter the distance you normally carry each club. The app compares your personal distances with the GPS distance to the center of the green and makes the Suggested Club easier to see during play.</p><div class="notice"><b>Important:</b> A club suggestion is a starting point. Wind, elevation, temperature, lie, hazards, swing conditions and rollout can change the correct choice.</div><h3>App Features</h3><ul><li>Shared course maps and front, center and back GPS yardages</li><li>Prominent personal club suggestions</li><li>Protected individual scoring and live group scorecards</li><li>Round QR joining, private round chat and unread alerts</li><li>Previous matches and offline score recovery</li><li>Super Admin player directory with protected contact details</li></ul><div class="guide-update">Last updated August 27, 2026</div><div class="guide-contact"><p>Suggestions for improving the app are welcome.</p><a href="mailto:ricbkewl@gmail.com?subject=Agape%20Golf%20App%20Suggestion">✉ ricbkewl@gmail.com</a><a href="sms:+16074383208">✆ Text 607.438.3208</a></div></div></details>`}
function activeRoundHomeCard(){if(!s.sharedRoundId||!s.joinCode||s.done)return'';return`<section class="active-round-card"><div><small>ACTIVE ROUND</small><b>${esc(s.course)}</b><span>Join code <strong>${esc(s.joinCode)}</strong></span></div><div class="active-round-actions"><button onclick="copyRoundCode()">Copy</button><button onclick="showRoundQr()">Show Join QR</button><button onclick="shareRoundLink()">Share</button></div></section>`}
function homeSignInForm(){if(currentUser)return'';if(cloudLoading)return'<div class="home-auth-loading">Checking your saved login…</div>';return`<form class="home-signin" onsubmit="signInFromHome(event)"><div class="home-signin-heading"><span>♙</span><div><b>Golfer Sign In</b><small>Sign in before creating or joining a round</small></div></div><label for="homeEmail">Email</label><input id="homeEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" required placeholder="you@example.com"><label for="homePassword">Password</label><input id="homePassword" type="password" autocomplete="current-password" required placeholder="Enter your password"><div id="homeSignInError" class="home-signin-error" role="alert"></div><button id="homeSignInButton" class="primary home-signin-button" type="submit">Sign In</button></form><div class="home-action-divider"><span>ROUND OPTIONS</span></div>`}
function home(){const canResume=(s.sharedRoundId||['setup','pars','round','recap'].includes(s.resumeView))&&!s.done;app.className='home-page';app.innerHTML=`<section class="home-hero"><div class="logo-wrap"><img src="agape-golf-logo.png" alt="Agape Tumoutou Golfers logo" class="landing-logo"></div><div class="home-brand">FAITH · FELLOWSHIP · FAIRWAYS</div><h1>Saved to <span>Serve</span></h1><p class="scripture"><strong><em>“Who hath saved us, and called us<br>with a holy calling...”</em> <span>2 Tim. 1:9</span></strong></p><div class="feature-pills"><span>⛳ Shared Courses</span><span>◎ Live GPS</span><span>＋ Protected Scoring</span><span>💬 Live Chat</span></div></section><section class="home-actions">${homeSignInForm()}${cloudLoading?'<div class="notice">Loading shared courses…</div>':''}${cloudError?`<div class="error-notice">${esc(cloudError)}</div>`:''}${canResume?'<button class="primary home-primary" onclick="resumeRound()">Resume Current Round <b>→</b></button><button class="secondary home-secondary" onclick="start()">Start a New Round</button>':`<button class="primary home-primary" onclick="start()" ${cloudLoading?'disabled':''}>Create a Round <b>→</b></button>`}${activeRoundHomeCard()}<button class="secondary home-secondary" onclick="joinRound()">Join with Round Code</button><button class="secondary home-secondary scan-round-button" onclick="showQrScanner()">▣ Scan Round QR</button>${currentUser?'<button class="secondary home-secondary" onclick="openHistory()">Previous Matches</button>':''}<button class="secondary home-secondary" onclick="openCourses()">${adminRole==='super_admin'?'Courses / Players':adminRole?'Map & Manage Courses':'Explore Shared Courses'}</button>${adminRole==='super_admin'?'<button class="admin-tool" onclick="promoteCourseAdmin()">＋ Add Course Admin</button>':''}<div class="account-bar">${currentUser?`<span class="account-status"><i></i>${adminRole?esc(adminRole.replace('_',' ')):'Golfer signed in'}</span><button class="back" onclick="accountAction()">Account</button>`:`<span><button class="back" onclick="createAccount()">Sign Up</button></span><span><button class="back" onclick="forgotPassword()">Forgot Password?</button></span>`}</div></section>${appGuide()}<footer class="home-footer">Saved to serve · Ready to play</footer>`}
function bottomNav(){app.insertAdjacentHTML('beforeend',`<nav class="bottom-nav ${s.sharedRoundId?'has-chat':''}" aria-label="Main navigation"><button onclick="goHome()"><span>⌂</span>Home</button>${s.sharedRoundId?'<button onclick="openCurrentRound()"><span>🏌</span>Round</button>':''}<button onclick="openCoursesFromNav()"><span>⛳</span>${adminRole==='super_admin'?'Courses/Players':'Courses'}</button>${s.sharedRoundId?`<button onclick="openRoundChat()"><span class="chat-nav-icon">💬<i id="chatUnreadBadge" class="chat-unread ${unreadChatCount?'':'hidden'}">${unreadChatCount>99?'99+':unreadChatCount}</i></span>Chat</button>`:''}<button onclick="accountAction()"><span>${currentUser?'●':'♙'}</span>${currentUser?'Account':'Login'}</button></nav>`)}
function rememberRoundView(){if(['setup','pars','round','recap'].includes(s.v)&&!s.done)s.resumeView=s.v}
function goHome(){rememberRoundView();s.v='home';render()}
async function resumeRound(){if(s.sharedRoundId)await loadSharedRound(false);s.v=s.resumeView||'round';render()}
async function openCurrentRound(){if(!s.sharedRoundId){await resumeRound();return}await loadSharedRound(false);s.resumeView='round';s.v='round';render()}
function openCoursesFromNav(){rememberRoundView();s.v='coursesView';render()}
async function accountAction(){if(!currentUser){await signInAccount();return}rememberRoundView();s.v='accountView';render()}
function accountView(){if(!currentUser){s.v='home';render();return}const fullName=[golferProfile?.first_name,golferProfile?.last_name].filter(Boolean).join(' ');app.innerHTML=`<button class="back" onclick="goHome()">← Back</button><h1>My Account</h1><section class="profile-card"><div class="profile-icon">${avatarMarkup(golferProfile?.avatar_path,fullName)}</div><div><b>${esc(fullName||'Golfer Profile')}</b><div class="small muted">${esc(currentUser.email||'')}</div><div class="small muted">${adminRole?esc(adminRole.replace('_',' ')):'Golfer account'}</div></div></section>${!golferProfile?'<div class="notice"><b>Complete your profile.</b> Existing accounts need a first name, last name and phone number.</div>':''}<div class="notice remember-notice">✓ You will stay signed in securely on this device until you choose Sign Out.</div><button class="primary" onclick="openProfile()">My Profile & Picture</button><button class="secondary" onclick="openClubs()">My Clubs & Distances</button><button class="secondary" onclick="openHistory()">View Previous Matches</button><button class="secondary" onclick="changePassword()">Change Password</button>${adminRole==='super_admin'?'<button class="secondary" onclick="openRegisteredGolfers(\'accountView\')">Registered Players</button><button class="secondary" onclick="promoteCourseAdmin()">Add Course Admin</button>':''}<button class="secondary danger-button" onclick="signOutAdmin()">Sign Out</button>`}
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
function updateClubSuggestion(centerYards,accuracyYards){
  const title=$('clubSuggestion'),note=$('clubSuggestionNote');if(!title||!note)return;
  if(accuracyYards>50){title.textContent='GPS signal is weak';note.textContent=`Accuracy is ±${accuracyYards} yd. Wait for a better signal or tap Refresh.`;return}
  if(centerYards>650){title.textContent='You are far from this hole';note.textContent='Club suggestions will appear when you are closer to the mapped green.';return}
  const suggestion=suggestedClubFor(centerYards);
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
async function start(){if(!currentUser){alert('Each golfer needs an account so scores can be protected. Please sign in or create an account first.');await signInAccount();if(!currentUser)return}if(s.resumeView&&!s.done&&!confirm('Start a new round? Your unfinished round will be replaced.'))return;s={...roundDefault,v:'setup',players:[''],scores:{},pars:[],resumeView:'setup',sharedRoundId:null,joinCode:null,ownerUserId:currentUser.id};render()}
function setup(){const options=courses.map(c=>`<option value="${esc(c.id)}" ${s.courseId===c.id?'selected':''}>${esc(c.name)} (${c.holes} holes)</option>`).join('');app.innerHTML=`<button class="back" onclick="goHome()">← Back</button><h1>Create a Round</h1><p class="muted">Choose a saved course to start immediately, or create a custom scorecard.</p><label>Saved course</label><select id="savedCourse" onchange="chooseCourse(this.value)"><option value="">Custom scorecard without GPS</option>${options}</select>${s.courseId?`<div class="notice">The saved GPS markers and hole pars will be used automatically.</div>`:`<label>Course name</label><input id="course" value="${esc(s.course)}" placeholder="e.g., Oak Valley Golf Club"><label>How many holes?</label><div class="row"><button class="choice ${s.holes===9?'on':''}" onclick="setHoles(9)">9 Holes</button><button class="choice ${s.holes===18?'on':''}" onclick="setHoles(18)">18 Holes</button></div>`}<label>Your player name</label><input aria-label="Your player name" value="${esc(s.players[0]||'')}" placeholder="Enter your name" oninput="updatePlayer(0,this.value)"><div class="notice">Each additional golfer will join on their own phone and enter their own name.</div><button id="${s.courseId?'createRoundButton':'setupContinueButton'}" class="primary" onclick="goPars()">${s.courseId?'Create Protected Round':'Continue'}</button>`}
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
  app.innerHTML=`<button class="back" onclick="openHistory()">← Matches</button><h1>${esc(match.course_name)}</h1><p class="muted">${esc(formatMatchDate(match.created_at))} · ${match.holes} holes</p><div class="table-wrap"><table><thead><tr><th>Hole #</th>${pars.map((_,i)=>`<th>${i+1}</th>`).join('')}<th>Total</th><th>+/−</th></tr><tr class="par-row"><th>Par</th>${pars.map(x=>`<th>${x}</th>`).join('')}<th>${fullPar}</th><th>E</th></tr></thead><tbody>${players.map(player=>{const score=playerTotal(player.user_id),complete=playerComplete(player.user_id);return`<tr><td><b>${esc(player.display_name)}${player.user_id===currentUser?.id?' (You)':''}</b></td>${pars.map((_,i)=>`<td>${playerScore(player.user_id,i+1)||'–'}</td>`).join('')}<td>${score||'–'}</td><td class="green">${complete?rel(score-fullPar):'–'}</td></tr>`}).join('')}</tbody></table></div><div class="notice">Previous scorecards are read-only. Each golfer’s saved scores remain protected by their account.</div>`;
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
function round(){ensureCurrentHolePar();const h=s.hole,p=s.pars[h-1],pt=parTotal(h),c=courseById(s.courseId),green=c?.greens?.[h-1];app.innerHTML=`<div class="row round-heading"><div><div class="brand small-brand">Agape Tumoutou Golfers</div><span class="small muted">${esc(s.course)}</span> <span id="syncStatus" class="sync-status ${navigator.onLine?'live':'waiting'}">${navigator.onLine?'Live':'Offline'}</span></div><button class="scorecard-button" onclick="openScorecard()"><span>▦</span> Live Scorecard <i>${s.players.length}</i></button></div><section class="hole hole-focus"><div class="hole-count"><span>HOLE</span><strong>${h}</strong><small>of ${s.holes}</small><i>PAR ${p}</i></div><h1>Enter your score</h1></section>${green?yardagePanel():`<div class="notice">No GPS markers for this hole. Add them from Map & Manage Courses.</div>`}${s.players.filter(x=>isMyPlayer(x)).map(x=>{const mine=isMyPlayer(x);return`<div class="card score ${mine?'my-score':''}"><div><b>${esc(x)}${mine?' (You)':''}</b><div class="current-hole-reference">Scoring Hole ${h} · Par ${p}</div><div class="small muted">Total ${total(x,h)} · ${rel(total(x,h)-pt)}</div></div>${mine?`<div class="stepper"><button onclick="changeScore('${encodeURIComponent(x)}',-1)">−</button><span>${scoreValue(x)||'–'}</span><button onclick="changeScore('${encodeURIComponent(x)}',1)">+</button></div>`:`<span class="locked-score">${scoreValue(x)||'–'} 🔒</span>`}<span class="green">${scoreValue(x)?rel(scoreValue(x)-p):''}</span></div>`}).join('')}<div class="row"><button class="secondary half" onclick="prev()">Previous</button><button class="primary fit" onclick="next()">${h===s.holes?'Finish':'Next Hole →'}</button></div>`;updateSyncIndicator();if(green)startLocation(green)}
function yardagePanel(){return`<section class="gps-card"><div class="club-suggestion featured-club"><div class="club-symbol">⛳</div><div><small>Suggested Club</small><b id="clubSuggestion">Waiting for GPS…</b><span id="clubSuggestionNote">Based on your personal carry distances</span></div></div><div class="yardages"><div><span id="frontYards">–</span><small>Front</small></div><div class="center-yard"><span id="centerYards">–</span><small>Center</small></div><div><span id="backYards">–</span><small>Back</small></div></div><div class="gps-signal-row"><div><b>GPS Signal</b><div id="gpsStatus" class="small muted">Requesting your location…</div></div><button class="locate" onclick="refreshLocation()">Refresh</button></div></section>`}
function startLocation(green){if(!navigator.geolocation){$('gpsStatus').textContent='GPS is not supported by this browser.';return}locationWatch=navigator.geolocation.watchPosition(pos=>{const accuracyYards=Math.round(pos.coords.accuracy*1.094),status=$('gpsStatus');status.textContent=`Accuracy ±${accuracyYards} yd`;status.classList.toggle('gps-warning',accuracyYards>50);const here={lat:pos.coords.latitude,lng:pos.coords.longitude},yards={};['front','center','back'].forEach(k=>{const el=$(k+'Yards');yards[k]=green[k]?Math.round(distanceYards(here,green[k])):null;if(el)el.textContent=yards[k]??'–'});updateClubSuggestion(yards.center,accuracyYards)},err=>{if($('gpsStatus'))$('gpsStatus').textContent=err.code===1?'Location permission was denied. Allow it in browser settings.':'Unable to get a GPS signal.'},{enableHighAccuracy:true,maximumAge:3000,timeout:15000})}
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
function recap(){app.innerHTML=`<button class="back" onclick="s.v='round';render()">← Back to round</button><div class="row"><div><h1>${s.done?'Round Complete':'Live Scorecard'}</h1><p class="muted">${esc(s.course)} · ${s.holes} holes</p></div>${s.sharedRoundId?'<button class="locate" onclick="refreshSharedRound()">Refresh</button>':''}</div><div class="table-wrap"><table><thead><tr><th>Hole #</th>${s.pars.map((_,i)=>`<th>${i+1}</th>`).join('')}<th>Total</th><th>+/−</th></tr><tr class="par-row"><th>Par</th>${s.pars.map(x=>`<th>${x}</th>`).join('')}<th>${parTotal(s.holes)}</th><th>E</th></tr></thead><tbody>${s.players.map(x=>`<tr><td><b>${esc(x)}${isMyPlayer(x)?' (You)':''}</b></td>${s.pars.map((_,i)=>`<td>${s.scores[x]?.[i+1]||'–'}</td>`).join('')}<td>${total(x)||'–'}</td><td class="green">${total(x)?rel(total(x)-parTotal(s.holes)):'–'}</td></tr>`).join('')}</tbody></table></div><button class="primary" onclick="finishRound()">Done</button>`}
function finishRound(){s.resumeView=null;s.v='home';render()}
function openCourses(){s.v='coursesView';render()}
function coursesView(){app.innerHTML=`<button class="back" onclick="s.v='home';render()">← Back</button><h1>${adminRole==='super_admin'?'Courses / Players':'Shared Courses'}</h1><p class="muted">Every golfer receives these course maps automatically. Only authorized administrators can change them.</p>${directoryTabs('courses')}${cloudError?`<div class="error-notice">${esc(cloudError)}</div>`:''}${courses.length?courses.map((c,i)=>`<div class="card"><div class="row"><div><b>${esc(c.name)}</b><div class="small muted">${c.holes} holes · ${mappedCount(c)} fully mapped</div></div>${adminRole?`<button class="back" onclick="editCourse(${i})">Edit</button>`:''}</div></div>`).join(''):'<div class="empty">No shared courses have been mapped yet.</div>'}${adminRole?'<button class="primary" onclick="newCourse()">Map a New Course</button>':currentUser?'<div class="notice">Your account does not have course-manager permission.</div>':'<button class="secondary" onclick="signInAdmin()">Admin sign in</button>'}`}
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
