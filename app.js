const app = document.querySelector('#app');
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const SUPABASE_URL = 'https://rntmqjqbmjfcpwbbflyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_r6fBc5CmRwlyLhTnk7u6BA_rRA1Pmoj';
const APP_URL = 'https://ricbkewl.github.io/fairway-simple/';
const GOOGLE_MAPS_API_KEY = 'AIzaSyB1RJ8SmBPQvn-P-HXpNJ26D_Ue8Oge3Wc';
const GOOGLE_MAP_ID = 'c27152898adbf111a2dbd048';
const MAPTILER_API_KEY = 'PpgeIcwg8NbSQTMZm4wr';
const EAGLE_GLEN_COURSE_ID = 'be42b7f5-e195-4004-9e6d-4d7e44fbe6a2';
const EAGLE_GLEN_DRAFT_POINTS = [
  [[33.806254280625,-117.53652065365],[33.804213980421,-117.5380065538],null,[33.803712680371,-117.53905325391]],
  [[33.804562280456,-117.53938805394],[33.804654980466,-117.54171095417],null,[33.805172480517,-117.54229325423]],
  [[33.804746780475,-117.54350645435],[33.806732180673,-117.54480965448],[33.807855380786,-117.54589235459],[33.808276580828,-117.54673385467]],
  [[33.809213480921,-117.54782465478],null,null,[33.809851580985,-117.54622895462]],
  [[33.809742680974,-117.54556115456],[33.811287981129,-117.54337505434],[33.811169181117,-117.54154985415],[33.811327581133,-117.54078215408]],
  [[33.811225881123,-117.53962025396],[33.810217881022,-117.54177665418],null,[33.810248481025,-117.5430411543]],
  [[33.809936180994,-117.54388265439],[33.808733780873,-117.54169475417],null,[33.808042580804,-117.5410287541]],
  [[33.807687080769,-117.54074525407],null,null,[33.806568380657,-117.54176135418]],
  [[33.805830380583,-117.54372425437],[33.805851080585,-117.54090455409],null,[33.806261480626,-117.53986685399]],
  [[33.806535080654,-117.53932325393],null,null,[33.804866480487,-117.53894705389]],
  [[33.804514580451,-117.53916035392],[33.802676780268,-117.54056975406],null,[33.80230148023,-117.54176855418]],
  [[33.801759680176,-117.54132845413],[33.802693880269,-117.53858165386],[33.803071880307,-117.53640185364],[33.802573280257,-117.53535605354]],
  [[33.802330280233,-117.53429765343],[33.80189648019,-117.53686805369],null,[33.801918080192,-117.53762135376]],
  [[33.80240228024,-117.53743775374],[33.801673280167,-117.540014454],null,[33.801233180123,-117.54157325416]],
  [[33.80019728002,-117.54281705428],[33.801070280107,-117.539987454],null,[33.801351980135,-117.53830985383]],
  [[33.800858780086,-117.53769335377],[33.801066680107,-117.5350329535],null,[33.801438380144,-117.53407805341]],
  [[33.800350280035,-117.53458205346],null,null,[33.801228680123,-117.53333555333]],
  [[33.802221380222,-117.53314295331],[33.803477780348,-117.53558285356],[33.804983480498,-117.53584115358],[33.805438880544,-117.53625245363]]
];
const EAGLE_GLEN_PARS=[4,4,5,3,5,4,4,3,4,3,4,5,4,4,4,4,3,5];
const EAGLE_GLEN_TEE_YARDS={black:[416,311,549,187,551,360,369,172,396,202,398,645,341,441,476,380,164,540],blue:[385,305,525,174,536,329,352,153,357,152,342,581,315,406,395,364,143,465],white:[361,270,493,155,457,302,336,145,267,98,310,511,282,361,375,280,138,411],red:[327,225,447,130,421,262,285,79,252,83,281,452,262,326,326,236,115,388]};
const REVIEW_TEE_OFFSETS={
  'a230fad3-22db-48e1-be1a-e11c0e92cf11':{name:'Laguna Woods Golf Club',blue:0,white:20,red:42},
  'df4efa6f-64da-4a01-bba8-05be8160ea23':{name:'River View Golf Course',blue:0,white:23,red:47},
  '0a4f8d85-153e-421e-8b4a-1dedee34e724':{name:'Sierra Lakes Golf Club',black:0,blue:21,white:40,red:82}
};
const ROYALE_JAKARTA_LOOPS={
  north:{label:'North',pars:[4,5,4,3,4,4,4,3,5],meters:{black:[362,550,344,150,373,431,400,171,510],blue:[345,500,321,124,350,399,388,153,487],white:[319,471,289,111,318,365,340,133,455],red:[301,448,273,96,281,317,290,118,296]}},
  south:{label:'South',pars:[4,3,5,4,4,3,4,4,5],meters:{black:[365,155,490,432,365,189,400,420,563],blue:[347,137,474,411,351,176,382,401,515],white:[316,117,449,369,318,143,347,354,482],red:[272,96,387,309,280,111,294,300,383]}},
  west:{label:'West',pars:[4,5,4,3,4,4,3,4,5],meters:{black:[389,554,343,150,447,322,194,425,494],blue:[372,516,327,138,429,307,175,408,466],white:[350,479,300,122,395,281,152,360,428],red:[308,406,260,99,338,250,117,315,379]}}
};
const PUBLISHED_GPS_COURSE_POINTS={"jurupa":[{"tee":{"lat":33.97457507097535,"lng":-117.44320392604908},"aim1":null,"aim2":null,"front":{"lat":33.974025662803,"lng":-117.4440702795},"center":{"lat":33.973950035489,"lng":-117.4441963434},"back":{"lat":33.973874408108,"lng":-117.4443089962},"_review":"published-gps"},{"tee":{"lat":33.97435708759138,"lng":-117.44204789398631},"aim1":null,"aim2":null,"front":{"lat":33.97483976433436,"lng":-117.44138136502254},"center":{"lat":33.974926512398,"lng":-117.4412673711},"back":{"lat":33.97500436314928,"lng":-117.44118422268198},"_review":"published-gps"},{"tee":{"lat":33.97450722926737,"lng":-117.44096428153512},"aim1":null,"aim2":null,"front":{"lat":33.97371981663471,"lng":-117.4420586228172},"center":{"lat":33.97364863773162,"lng":-117.44215384123324},"back":{"lat":33.97358969265865,"lng":-117.44224503630788},"_review":"published-gps"},{"tee":{"lat":33.973407296322115,"lng":-117.43946760892406},"aim1":null,"aim2":null,"front":{"lat":33.97297354736613,"lng":-117.4387769400594},"center":{"lat":33.972913489644,"lng":-117.4386870861},"back":{"lat":33.97284342224791,"lng":-117.43856906882704},"_review":"published-gps"},{"tee":{"lat":33.97114065555372,"lng":-117.43669688693458},"aim1":null,"aim2":null,"front":{"lat":33.97069466073252,"lng":-117.43582382797749},"center":{"lat":33.970617918246,"lng":-117.4356669187},"back":{"lat":33.97054562453521,"lng":-117.4355113505828},"_review":"published-gps"},{"tee":{"lat":33.97107614771964,"lng":-117.43796557182286},"aim1":null,"aim2":null,"front":{"lat":33.971549945500804,"lng":-117.4389365315025},"center":{"lat":33.97160333100145,"lng":-117.43904918424757},"back":{"lat":33.97169119456434,"lng":-117.43918865915576},"_review":"published-gps"},{"tee":{"lat":33.97293795760986,"lng":-117.4416938423186},"aim1":null,"aim2":null,"front":{"lat":33.9731092331815,"lng":-117.44398042552169},"center":{"lat":33.973124803664,"lng":-117.444153428},"back":{"lat":33.973135925439514,"lng":-117.44432508936394},"_review":"published-gps"},{"tee":{"lat":33.97363576913013,"lng":-117.44490097559056},"aim1":null,"aim2":null,"front":{"lat":33.974795278113,"lng":-117.4447005987},"center":{"lat":33.97494653117,"lng":-117.4446764588},"back":{"lat":33.975079989526,"lng":-117.4446684122},"_review":"published-gps"},{"tee":{"lat":33.97565941879217,"lng":-117.44245156642856},"aim1":null,"aim2":null,"front":{"lat":33.97590853879889,"lng":-117.441713958916},"center":{"lat":33.97595747300002,"lng":-117.44156643743322},"back":{"lat":33.97600307075367,"lng":-117.4414323269496},"_review":"published-gps"},{"tee":{"lat":33.978272918233785,"lng":-117.4401207267783},"aim1":null,"aim2":null,"front":{"lat":33.979120342080215,"lng":-117.44014486668566},"center":{"lat":33.97919930109,"lng":-117.4401462078},"back":{"lat":33.97930383825734,"lng":-117.44014620776478},"_review":"published-gps"},{"tee":{"lat":33.97825401235614,"lng":-117.43820160622768},"aim1":null,"aim2":null,"front":{"lat":33.97727534941651,"lng":-117.43697717785123},"center":{"lat":33.977164137006,"lng":-117.436839044},"back":{"lat":33.977072942721,"lng":-117.4367263913},"_review":"published-gps"},{"tee":{"lat":33.97751556772702,"lng":-117.433853745379},"aim1":null,"aim2":null,"front":{"lat":33.977778027697,"lng":-117.4331054091},"center":{"lat":33.977811391195,"lng":-117.4330008029},"back":{"lat":33.977840306216,"lng":-117.4329042434},"_review":"published-gps"},{"tee":{"lat":33.97654245695222,"lng":-117.4346114694716},"aim1":null,"aim2":null,"front":{"lat":33.976505756555994,"lng":-117.43570446963604},"center":{"lat":33.976503532289,"lng":-117.4358814954},"back":{"lat":33.97650130802263,"lng":-117.43600353594142},"_review":"published-gps"},{"tee":{"lat":33.976845585315104,"lng":-117.4365407433014},"aim1":null,"aim2":null,"front":{"lat":33.97693726323764,"lng":-117.43774697183156},"center":{"lat":33.97695060877,"lng":-117.4378609657},"back":{"lat":33.9769661785562,"lng":-117.43798434732706},"_review":"published-gps"},{"tee":{"lat":33.97460843572956,"lng":-117.43684172624508},"aim1":null,"aim2":null,"front":{"lat":33.973494045848,"lng":-117.4348595738},"center":{"lat":33.973416193714,"lng":-117.434746921},"back":{"lat":33.973358360653,"lng":-117.4346423149},"_review":"published-gps"},{"tee":{"lat":33.97342731545096,"lng":-117.437050938508},"aim1":null,"aim2":null,"front":{"lat":33.97354409361145,"lng":-117.43799507611152},"center":{"lat":33.97356856139583,"lng":-117.43814796204674},"back":{"lat":33.97359859003078,"lng":-117.43831560014056},"_review":"published-gps"},{"tee":{"lat":33.975671652381564,"lng":-117.43944883339184},"aim1":null,"aim2":null,"front":{"lat":33.976779340944,"lng":-117.4393978714},"center":{"lat":33.976639212465,"lng":-117.4394166469},"back":{"lat":33.976489074552845,"lng":-117.43942201134593},"_review":"published-gps"},{"tee":{"lat":33.97693496937901,"lng":-117.43972897341548},"aim1":null,"aim2":null,"front":{"lat":33.9759897250717,"lng":-117.44012609120618},"center":{"lat":33.975840698155,"lng":-117.4401918053},"back":{"lat":33.975715026000294,"lng":-117.44025081393522},"_review":"published-gps"}],"shorecliffs":[{"tee":{"lat":33.455892692677125,"lng":-117.64319881789667},"aim1":null,"aim2":null,"front":{"lat":33.45646109075729,"lng":-117.64262348407748},"center":{"lat":33.45653717525793,"lng":-117.64258727425494},"back":{"lat":33.45663451856423,"lng":-117.64254704115493},"_review":"published-gps"},{"tee":{"lat":33.45962749218123,"lng":-117.6424384116839},"aim1":null,"aim2":null,"front":{"lat":33.46151832693018,"lng":-117.6418241857722},"center":{"lat":33.46160335758221,"lng":-117.64177322380742},"back":{"lat":33.46169062579754,"lng":-117.6417195796697},"_review":"published-gps"},{"tee":{"lat":33.46280608485677,"lng":-117.6405300199518},"aim1":null,"aim2":null,"front":{"lat":33.46432876959016,"lng":-117.63949871061692},"center":{"lat":33.46439365930822,"lng":-117.63939678664563},"back":{"lat":33.46446749927206,"lng":-117.63930559155548},"_review":"published-gps"},{"tee":{"lat":33.46450218165877,"lng":-117.63927876941312},"aim1":null,"aim2":null,"front":{"lat":33.46379510575843,"lng":-117.63789072622932},"center":{"lat":33.46372126522145,"lng":-117.6377941667203},"back":{"lat":33.46366085019023,"lng":-117.63769358388792},"_review":"published-gps"},{"tee":{"lat":33.461654823462894,"lng":-117.63917684550688},"aim1":null,"aim2":null,"front":{"lat":33.46094101134477,"lng":-117.63913124798287},"center":{"lat":33.460833603369665,"lng":-117.63913124797642},"back":{"lat":33.460732908272576,"lng":-117.63913393017891},"_review":"published-gps"},{"tee":{"lat":33.46039278174543,"lng":-117.63939946881152},"aim1":null,"aim2":null,"front":{"lat":33.46021376724811,"lng":-117.63774454584106},"center":{"lat":33.4601936280936,"lng":-117.63762921085672},"back":{"lat":33.46017125125096,"lng":-117.6375165581536},"_review":"published-gps"},{"tee":{"lat":33.4596621765035,"lng":-117.6389300822798},"aim1":null,"aim2":null,"front":{"lat":33.45931645151025,"lng":-117.64074593777389},"center":{"lat":33.45930861953571,"lng":-117.64085322614348},"back":{"lat":33.45929519329342,"lng":-117.64096990223562},"_review":"published-gps"},{"tee":{"lat":33.45802864174758,"lng":-117.64197304835729},"aim1":null,"aim2":null,"front":{"lat":33.45731032425445,"lng":-117.64192208642892},"center":{"lat":33.45721186282642,"lng":-117.64191135761256},"back":{"lat":33.45710668799488,"lng":-117.64190465201874},"_review":"published-gps"},{"tee":{"lat":33.4546260914263,"lng":-117.64301240435928},"aim1":null,"aim2":null,"front":{"lat":33.45414495712766,"lng":-117.6436775922602},"center":{"lat":33.45409796247126,"lng":-117.64377415171012},"back":{"lat":33.45404425426193,"lng":-117.64387071131496},"_review":"published-gps"},{"tee":{"lat":33.45186680592335,"lng":-117.64652073381954},"aim1":null,"aim2":null,"front":{"lat":33.450456918126115,"lng":-117.64732405537156},"center":{"lat":33.450388661072324,"lng":-117.64732271424737},"back":{"lat":33.45031928499505,"lng":-117.64732539645551},"_review":"published-gps"},{"tee":{"lat":33.45003059039949,"lng":-117.6471604406632},"aim1":null,"aim2":null,"front":{"lat":33.44833421049085,"lng":-117.64635711906138},"center":{"lat":33.44824021485601,"lng":-117.64632090917488},"back":{"lat":33.448146219118364,"lng":-117.64628469938845},"_review":"published-gps"},{"tee":{"lat":33.44701490529289,"lng":-117.64426901931466},"aim1":null,"aim2":null,"front":{"lat":33.44638042312745,"lng":-117.64342948785556},"center":{"lat":33.446334543284046,"lng":-117.64334097494655},"back":{"lat":33.446287544396036,"lng":-117.64324843882484},"_review":"published-gps"},{"tee":{"lat":33.44809474521969,"lng":-117.641136199201},"aim1":null,"aim2":null,"front":{"lat":33.44856584215722,"lng":-117.64043882488669},"center":{"lat":33.44861060182838,"lng":-117.6403650641092},"back":{"lat":33.448663194412255,"lng":-117.64028862116784},"_review":"published-gps"},{"tee":{"lat":33.448032081300816,"lng":-117.63843521472774},"aim1":null,"aim2":null,"front":{"lat":33.4471950660485,"lng":-117.63689562672216},"center":{"lat":33.447132401479344,"lng":-117.63678967947509},"back":{"lat":33.44707309389975,"lng":-117.636689096646},"_review":"published-gps"},{"tee":{"lat":33.44463025778957,"lng":-117.63753399247994},"aim1":null,"aim2":null,"front":{"lat":33.44424418715218,"lng":-117.63794571152118},"center":{"lat":33.444171449013645,"lng":-117.63802886004322},"back":{"lat":33.44411437750748,"lng":-117.63812005517428},"_review":"published-gps"},{"tee":{"lat":33.44406066311502,"lng":-117.64254301782522},"aim1":null,"aim2":null,"front":{"lat":33.44532853770677,"lng":-117.64239147300192},"center":{"lat":33.44540015584253,"lng":-117.64239951960526},"back":{"lat":33.44549303552366,"lng":-117.64240488404464},"_review":"published-gps"},{"tee":{"lat":33.446786626529246,"lng":-117.64537677164188},"aim1":null,"aim2":null,"front":{"lat":33.447803805215095,"lng":-117.64604330060996},"center":{"lat":33.44786758829951,"lng":-117.64608889817224},"back":{"lat":33.44793808533853,"lng":-117.64613315458492},"_review":"published-gps"},{"tee":{"lat":33.45040208869416,"lng":-117.6464791595901},"aim1":null,"aim2":null,"front":{"lat":33.451075705037894,"lng":-117.64630213374812},"center":{"lat":33.45120214738927,"lng":-117.64626190064244},"back":{"lat":33.45134089807662,"lng":-117.64624446622244},"_review":"published-gps"}],"newport":[{"tee":{"lat":33.658861796261704,"lng":-117.88148224353428},"aim1":null,"aim2":null,"front":{"lat":33.658267937827,"lng":-117.8825953602},"center":{"lat":33.658209891294405,"lng":-117.882694602009},"back":{"lat":33.6581473796,"lng":-117.8827884793},"_review":"published-gps"},{"tee":{"lat":33.657829239020856,"lng":-117.88269057862372},"aim1":null,"aim2":null,"front":{"lat":33.65848896080574,"lng":-117.88329944006762},"center":{"lat":33.65853919322185,"lng":-117.88336783639998},"back":{"lat":33.658591658159,"lng":-117.8834509849},"_review":"published-gps"},{"tee":{"lat":33.65810496092351,"lng":-117.8840062021948},"aim1":null,"aim2":null,"front":{"lat":33.65758588859142,"lng":-117.88357034320369},"center":{"lat":33.657502166954096,"lng":-117.88351401684056},"back":{"lat":33.65744523619465,"lng":-117.88345232603236},"_review":"published-gps"},{"tee":{"lat":33.65653992042341,"lng":-117.88158148521087},"aim1":null,"aim2":null,"front":{"lat":33.656245216317,"lng":-117.8807821869},"center":{"lat":33.656213959760855,"lng":-117.88067221631805},"back":{"lat":33.65616484229456,"lng":-117.88057029238112},"_review":"published-gps"},{"tee":{"lat":33.656054327891134,"lng":-117.88049787275956},"aim1":null,"aim2":null,"front":{"lat":33.655287421001,"lng":-117.8800740838},"center":{"lat":33.65522267454591,"lng":-117.8800338506},"back":{"lat":33.65517467283265,"lng":-117.87999361750902},"_review":"published-gps"},{"tee":{"lat":33.65500275949933,"lng":-117.8801371156728},"aim1":null,"aim2":null,"front":{"lat":33.65578083204089,"lng":-117.8805863856721},"center":{"lat":33.655841112833244,"lng":-117.88063332434056},"back":{"lat":33.655905858823,"lng":-117.8806748986},"_review":"published-gps"},{"tee":{"lat":33.65635461417058,"lng":-117.88266107432804},"aim1":null,"aim2":null,"front":{"lat":33.65677434342269,"lng":-117.88342818608564},"center":{"lat":33.656824576840364,"lng":-117.88347646592254},"back":{"lat":33.656859182066,"lng":-117.883528769},"_review":"published-gps"},{"tee":{"lat":33.65689601987194,"lng":-117.8837567567444},"aim1":null,"aim2":null,"front":{"lat":33.65785826242072,"lng":-117.88403302429012},"center":{"lat":33.657934169728,"lng":-117.88405314084056},"back":{"lat":33.658008960685,"lng":-117.8840732574},"_review":"published-gps"},{"tee":{"lat":33.65878142468324,"lng":-117.8833383320951},"aim1":null,"aim2":null,"front":{"lat":33.659067189954065,"lng":-117.88198918094592},"center":{"lat":33.65910737561921,"lng":-117.88189262143608},"back":{"lat":33.659143096194924,"lng":-117.88181215518932},"_review":"published-gps"},{"tee":{"lat":33.66186786263019,"lng":-117.88100078694384},"aim1":null,"aim2":null,"front":{"lat":33.66296622830092,"lng":-117.87957787506394},"center":{"lat":33.66304101488495,"lng":-117.87952423088112},"back":{"lat":33.66311580140344,"lng":-117.8794799744848},"_review":"published-gps"},{"tee":{"lat":33.662489601831545,"lng":-117.87971265605346},"aim1":null,"aim2":null,"front":{"lat":33.66166582432877,"lng":-117.88036376235326},"center":{"lat":33.661606105734236,"lng":-117.88040935984507},"back":{"lat":33.66154248027013,"lng":-117.88045965129366},"_review":"published-gps"},{"tee":{"lat":33.662216126434274,"lng":-117.88071915501372},"aim1":null,"aim2":null,"front":{"lat":33.66156201440836,"lng":-117.8810034691496},"center":{"lat":33.661508435046066,"lng":-117.88105174893155},"back":{"lat":33.66145373941323,"lng":-117.88110136985492},"_review":"published-gps"},{"tee":{"lat":33.66080408657621,"lng":-117.87989169353838},"aim1":null,"aim2":null,"front":{"lat":33.66200236852985,"lng":-117.8789971768594},"center":{"lat":33.662076597835714,"lng":-117.87895292040902},"back":{"lat":33.66213743233221,"lng":-117.8789187221793},"_review":"published-gps"},{"tee":{"lat":33.66243490682143,"lng":-117.87908568972134},"aim1":null,"aim2":null,"front":{"lat":33.66344173591924,"lng":-117.87845402952703},"center":{"lat":33.663500895134185,"lng":-117.87841111415408},"back":{"lat":33.66356451915005,"lng":-117.87836551660902},"_review":"published-gps"},{"tee":{"lat":33.66154527086181,"lng":-117.87843257185725},"aim1":null,"aim2":null,"front":{"lat":33.66087775879379,"lng":-117.8788349032262},"center":{"lat":33.66082194651339,"lng":-117.87890195841804},"back":{"lat":33.66077171543024,"lng":-117.87896901361886},"_review":"published-gps"},{"tee":{"lat":33.661726100998585,"lng":-117.8775152563067},"aim1":null,"aim2":null,"front":{"lat":33.662290913669764,"lng":-117.8769117593},"center":{"lat":33.6623389114141,"lng":-117.87685543294508},"back":{"lat":33.6623880253567,"lng":-117.8768044710082},"_review":"published-gps"},{"tee":{"lat":33.661090961371734,"lng":-117.87732750169648},"aim1":null,"aim2":null,"front":{"lat":33.660696926873705,"lng":-117.87776738399016},"center":{"lat":33.660638881979565,"lng":-117.87783712139098},"back":{"lat":33.66057860454758,"lng":-117.87791490552787},"_review":"published-gps"},{"tee":{"lat":33.66030735558157,"lng":-117.87966102354451},"aim1":null,"aim2":null,"front":{"lat":33.66027944926134,"lng":-117.88007542481353},"center":{"lat":33.66029396054894,"lng":-117.88015857333156},"back":{"lat":33.660299541813245,"lng":-117.88023635743156},"_review":"published-gps"}],"willowick":[{"tee":{"lat":33.751580615781,"lng":-117.9092860221},"aim1":null,"aim2":null,"front":{"lat":33.752711286355,"lng":-117.9088327288},"center":{"lat":33.75276926906,"lng":-117.908835411},"back":{"lat":33.752847322639,"lng":-117.9088434576},"_review":"published-gps"},{"tee":null,"aim1":null,"aim2":null,"front":{"lat":33.753527500817,"lng":-117.9107102751},"center":{"lat":33.753552031732,"lng":-117.9108551144},"back":{"lat":33.753560952063,"lng":-117.9109838604},"_review":"published-gps"},{"tee":{"lat":33.755081854955,"lng":-117.9130706191},"aim1":null,"aim2":null,"front":{"lat":33.755563542914,"lng":-117.9143393039},"center":{"lat":33.755590303277,"lng":-117.9144331812},"back":{"lat":33.755594763337,"lng":-117.9145351052},"_review":"published-gps"},{"tee":null,"aim1":null,"aim2":null,"front":{"lat":33.754024808004,"lng":-117.9141059517},"center":{"lat":33.753942295352,"lng":-117.9141300916},"back":{"lat":33.753862012696,"lng":-117.914173007},"_review":"published-gps"},{"tee":{"lat":33.754722817263,"lng":-117.9149508476},"aim1":null,"aim2":null,"front":{"lat":33.755842296284,"lng":-117.9150366783},"center":{"lat":33.755947107316,"lng":-117.9150795936},"back":{"lat":33.756058608274,"lng":-117.9151305556},"_review":"published-gps"},{"tee":{"lat":33.755237957831,"lng":-117.9119682312},"aim1":null,"aim2":null,"front":{"lat":33.754555563166,"lng":-117.9108738899},"center":{"lat":33.754502041786,"lng":-117.9107424616},"back":{"lat":33.75448197126,"lng":-117.9106003046},"_review":"published-gps"},{"tee":null,"aim1":null,"aim2":null,"front":{"lat":33.753806260806,"lng":-117.9094013571},"center":{"lat":33.753737128413,"lng":-117.9092726111},"back":{"lat":33.753676916284,"lng":-117.9091411828},"_review":"published-gps"},{"tee":null,"aim1":null,"aim2":null,"front":{"lat":33.752811641011,"lng":-117.9077544808},"center":{"lat":33.752755888439,"lng":-117.9076525568},"back":{"lat":33.752693445515,"lng":-117.9075694084},"_review":"published-gps"},{"tee":{"lat":33.751234944286,"lng":-117.9086342453},"aim1":null,"aim2":null,"front":{"lat":33.750249215339,"lng":-117.909245789},"center":{"lat":33.750115405106,"lng":-117.9092592},"back":{"lat":33.749994975718,"lng":-117.9092887043},"_review":"published-gps"},{"tee":{"lat":33.751770176977,"lng":-117.9141005873},"aim1":null,"aim2":null,"front":{"lat":33.751937436507,"lng":-117.9154711961},"center":{"lat":33.751936321444504,"lng":-117.9155784845},"back":{"lat":33.751935206382,"lng":-117.9156777262},"_review":"published-gps"},{"tee":{"lat":33.752193900487,"lng":-117.9118958115},"aim1":null,"aim2":null,"front":{"lat":33.752095775229,"lng":-117.9105949401},"center":{"lat":33.752077934261,"lng":-117.9104098677},"back":{"lat":33.752044482436,"lng":-117.9102274775},"_review":"published-gps"},{"tee":null,"aim1":null,"aim2":null,"front":{"lat":33.752457054034,"lng":-117.9106888175},"center":{"lat":33.75243698303,"lng":-117.9108175635},"back":{"lat":33.752396841006,"lng":-117.9109328985},"_review":"published-gps"},{"tee":{"lat":33.754279035677,"lng":-117.9128211736},"aim1":null,"aim2":null,"front":{"lat":33.754898991225,"lng":-117.9139396548},"center":{"lat":33.754961432543,"lng":-117.9140415787},"back":{"lat":33.754999343321,"lng":-117.9141300916},"_review":"published-gps"},{"tee":{"lat":33.7535297309,"lng":-117.9125744104},"aim1":null,"aim2":null,"front":{"lat":33.752903075151,"lng":-117.9114505648},"center":{"lat":33.752831711928,"lng":-117.9113540053},"back":{"lat":33.752751428232,"lng":-117.911260128},"_review":"published-gps"},{"tee":{"lat":33.753014580068,"lng":-117.9136687517},"aim1":null,"aim2":null,"front":{"lat":33.752889694552,"lng":-117.9149937629},"center":{"lat":33.75282056142,"lng":-117.9150903224},"back":{"lat":33.752751428232,"lng":-117.9151707887},"_review":"published-gps"},{"tee":null,"aim1":null,"aim2":null,"front":{"lat":33.75036964437,"lng":-117.9139021039},"center":{"lat":33.750327271212,"lng":-117.9137921333},"back":{"lat":33.750278207529,"lng":-117.9136794805},"_review":"published-gps"},{"tee":null,"aim1":null,"aim2":null,"front":{"lat":33.75144234735,"lng":-117.9154202342},"center":{"lat":33.751527092544,"lng":-117.9155194759},"back":{"lat":33.751573925378,"lng":-117.9156079888},"_review":"published-gps"},{"tee":{"lat":33.750971786988,"lng":-117.9121693968},"aim1":null,"aim2":null,"front":{"lat":33.750655105102,"lng":-117.9108524322},"center":{"lat":33.750635033675,"lng":-117.9107397794},"back":{"lat":33.750612732084,"lng":-117.9106378555},"_review":"published-gps"}]};
const LISTED_COURSE_CATALOG=[
  {id:'catalog-el-prado-butterfield',name:'Butterfield Stage Course at El Prado',match:['butterfieldstagecourse'],city:'Chino',state:'CA',postal_code:'91708',address:'6555 Pine Avenue',holes:18,par_total:72,course_type:'Public',catalog_point:{lat:34.0122,lng:-117.6889},source:'https://www.elpradogolfcourses.com/'},
  {id:'catalog-el-prado-chino-creek',name:'Chino Creek Course at El Prado',match:['chinocreekcourse'],city:'Chino',state:'CA',postal_code:'91708',address:'6555 Pine Avenue',holes:18,par_total:72,course_type:'Public',catalog_point:{lat:34.0122,lng:-117.6889},source:'https://www.elpradogolfcourses.com/'},
  {id:'catalog-shorecliffs',name:'Shorecliffs Golf Club',city:'San Clemente',state:'CA',postal_code:'92672',address:'501 Avenida Vaquero',holes:18,par_total:71,course_type:'Public',catalog_point:{lat:33.427,lng:-117.612},gps_key:'shorecliffs',source:'https://www.shorecliffsgolfclub.com/'},
  {id:'catalog-newport-beach',name:'Newport Beach Golf Course',city:'Newport Beach',state:'CA',postal_code:'92660',address:'3100 Irvine Avenue',holes:18,par_total:59,course_type:'Public · Executive',catalog_point:{lat:33.6189,lng:-117.9298},gps_key:'newport',source:'https://www.newportbeachgolfcoursellc.com/'},
  {id:'catalog-willowick',name:'Willowick Golf Course',city:'Santa Ana',state:'CA',postal_code:'92703',address:'3017 West 5th Street',holes:18,par_total:71,course_type:'Public',catalog_point:{lat:33.7455,lng:-117.8677},gps_key:'willowick',source:'https://www.willowickgolf.com/'},
  {id:'catalog-river-view',name:'River View Golf Course',city:'Santa Ana',state:'CA',postal_code:'92706',address:'1800 West Santa Clara Avenue',holes:18,par_total:70,course_type:'Public',catalog_point:{lat:33.7455,lng:-117.8677},source:'https://playriverview.com/'},
  {id:'catalog-green-river',name:'Green River Golf Club',city:'Corona',state:'CA',postal_code:'92880',holes:18,par_total:73,course_type:'Public',catalog_point:{lat:33.8753,lng:-117.5664},catalog_note:'Primary 18-hole selection; the facility advertises 27 holes. Confirm the day’s routing before play.',source:'https://playgreenriver.com/'},
  {id:'catalog-rancho-california',name:'The Golf Club at Rancho California',match:['thegolfclubofranchocalifornia'],city:'Murrieta',state:'CA',postal_code:'92563',address:'39500 Robert Trent Jones Parkway',holes:18,par_total:72,course_type:'Public',catalog_point:{lat:33.5539,lng:-117.2139},source:'https://thegolfclubatranchocalifornia.com/'},
  {id:'catalog-cresta-verde',name:'Cresta Verde Golf Course',city:'Corona',state:'CA',postal_code:'92879',address:'1295 Cresta Road',holes:18,par_total:70,course_type:'Public',catalog_point:{lat:33.8753,lng:-117.5664},source:'https://golfcrestaverde.com/'},
  {id:'catalog-birch-hills',name:'Birch Hills Golf Course',city:'Brea',state:'CA',postal_code:'92821',address:'2250 East Birch Street',holes:18,par_total:59,course_type:'Public · Executive',catalog_point:{lat:33.9167,lng:-117.9001},source:'https://birchhillsgolf.com/'},
  {id:'catalog-westridge',name:'Westridge Golf Club',city:'La Habra',state:'CA',postal_code:'90631',address:'1400 South La Habra Hills Drive',holes:18,par_total:72,course_type:'Public',catalog_point:{lat:33.9319,lng:-117.9462},source:'https://www.westridgegolfclub.com/'},
  {id:'catalog-canyon-crest',name:'Canyon Crest Country Club',city:'Riverside',state:'CA',postal_code:'92506',address:'975 Country Club Drive',holes:18,par_total:72,course_type:'Public access',catalog_point:{lat:33.9806,lng:-117.3755},source:'https://www.canyoncrestcountryclub.com/'},
  {id:'catalog-general-old',name:'General Old Golf Course',city:'Riverside',state:'CA',postal_code:'92518',address:'16700 Village West Drive',holes:18,par_total:72,course_type:'Public',catalog_point:{lat:33.9806,lng:-117.3755},source:'https://www.generaloldgolfcourse.com/'},
  {id:'catalog-jurupa-hills',name:'Jurupa Hills Country Club',city:'Riverside',state:'CA',postal_code:'92509',address:'6161 Moraga Avenue',holes:18,par_total:70,course_type:'Public',catalog_point:{lat:33.9806,lng:-117.3755},gps_key:'jurupa',source:'https://www.jurupahills.net/'},
  {id:'catalog-indian-hills',name:'Indian Hills Golf Club',city:'Riverside',state:'CA',postal_code:'92509',address:'5700 Club House Drive',holes:18,par_total:70,course_type:'Public',catalog_point:{lat:33.9806,lng:-117.3755},source:'https://www.indianhillsgolf.com/'},
  {id:'catalog-arrowhead',name:'Arrowhead Country Club',city:'San Bernardino',state:'CA',postal_code:'92404',address:'3433 Parkside Drive',holes:18,par_total:72,course_type:'Semi-private',catalog_point:{lat:34.1083,lng:-117.2898},source:'https://golfarrowheadcc.com/'},
  {id:'catalog-shandin-hills',name:'Shandin Hills Golf Club',city:'San Bernardino',state:'CA',postal_code:'92405',address:'3380 Little Mountain Drive',holes:18,par_total:72,course_type:'Public',catalog_point:{lat:34.1083,lng:-117.2898},source:'https://www.golfshandinhillsgc.com/'},
  {id:'catalog-eagle-glen',name:'Eagle Glen Golf Club',match:['eagleglengolfcourse'],city:'Corona',state:'CA',postal_code:'92883',address:'1800 Eagle Glen Parkway',holes:18,par_total:72,course_type:'Public',catalog_point:{lat:33.8753,lng:-117.5664},source:'https://eagleglengc.com/'},
  {id:'catalog-dos-lagos',name:'Dos Lagos Golf Course',city:'Corona',state:'CA',postal_code:'92883',holes:18,par_total:70,course_type:'Public',catalog_point:{lat:33.8753,lng:-117.5664},catalog_note:'Confirm the current street address and published tee sheet during the pre-round review.',source:'https://www.doslagosgolf.com/'},
  {id:'catalog-glen-ivy',name:'Glen Ivy Golf Club',match:['glenivygolfcourse'],city:'Corona',state:'CA',postal_code:'92883',address:'24400 Trilogy Parkway',holes:18,par_total:72,course_type:'Public',catalog_point:{lat:33.8753,lng:-117.5664},source:'https://www.glenivygolf.com/'},
  {id:'catalog-hidden-valley',name:'Hidden Valley Golf Club',city:'Norco',state:'CA',postal_code:'92860',address:'10 Clubhouse Drive',holes:18,par_total:72,course_type:'Public',catalog_point:{lat:33.9311,lng:-117.5487},source:'https://www.hiddenvalleygolf.com/'},
  {id:'catalog-marshall-canyon',name:'Marshall Canyon Golf Course',city:'La Verne',state:'CA',postal_code:'91750',address:'6100 North Stephens Ranch Road',holes:18,par_total:71,course_type:'Public',catalog_point:{lat:34.1008,lng:-117.7678},source:'https://www.marshallcanyon.com/'},
  {id:'catalog-royale-north-jakarta',name:'Royale North Jakarta',match:['royalejakartanorthcourse'],city:'East Jakarta',state:'DKI Jakarta',postal_code:'13610',country:'Indonesia',address:'Jl. Radar Selatan, RT.4/RW.4, Halim Perdanakusuma, Kec. Makasar',holes:9,pars:[...ROYALE_JAKARTA_LOOPS.north.pars],par_total:36,tee_meters:ROYALE_JAKARTA_LOOPS.north.meters,course_type:'Private · North 9',catalog_point:{lat:-6.271178,lng:106.900463},courseImage:'assets/royale-north-jakarta.svg',catalog_note:'Approved North nine scorecard. GPS tees, aims and greens require satellite review before GPS play.',source:'https://www.royalejakarta.com/golf-course/'},
  {id:'catalog-royale-south-jakarta',name:'Royale South Jakarta',match:['royalejakartasouthcourse'],city:'East Jakarta',state:'DKI Jakarta',postal_code:'13610',country:'Indonesia',address:'Jl. Radar Selatan, RT.4/RW.4, Halim Perdanakusuma, Kec. Makasar',holes:9,pars:[...ROYALE_JAKARTA_LOOPS.south.pars],par_total:36,tee_meters:ROYALE_JAKARTA_LOOPS.south.meters,course_type:'Private · South 9',catalog_point:{lat:-6.270989,lng:106.902177},courseImage:'assets/royale-south-jakarta.svg',catalog_note:'Approved South nine scorecard. GPS tees, aims and greens require satellite review before GPS play.',source:'https://www.royalejakarta.com/golf-course/'},
  {id:'catalog-royale-west-jakarta',name:'Royale West Jakarta',match:['royalejakartawestcourse'],city:'East Jakarta',state:'DKI Jakarta',postal_code:'13610',country:'Indonesia',address:'Jl. Radar Selatan, RT.4/RW.4, Halim Perdanakusuma, Kec. Makasar',holes:9,pars:[...ROYALE_JAKARTA_LOOPS.west.pars],par_total:36,tee_meters:ROYALE_JAKARTA_LOOPS.west.meters,course_type:'Private · West 9',catalog_point:{lat:-6.271936,lng:106.899858},courseImage:'assets/royale-west-jakarta.svg',catalog_note:'Approved West nine scorecard. GPS tees, aims and greens require satellite review before GPS play.',source:'https://www.royalejakarta.com/golf-course/'}
];
function courseMatchKey(value){return String(value||'').toLowerCase().replace(/\b(golf|course|club|country|at|the)\b/g,'').replace(/[^a-z0-9]/g,'')}
function mergeListedCourseCatalog(cloudCourses){
  const merged=(cloudCourses||[]).filter(course=>!course.catalogOnly).map(course=>({...course}));
  for(const catalog of LISTED_COURSE_CATALOG){
    const keys=new Set([courseMatchKey(catalog.name),...(catalog.match||[]).map(courseMatchKey)]),existing=merged.find(course=>keys.has(courseMatchKey(course.name)));
    if(existing)Object.assign(existing,{city:catalog.city,state:catalog.state,postal_code:catalog.postal_code,address:catalog.address,par_total:catalog.par_total,course_type:catalog.course_type,catalog_point:catalog.catalog_point,catalog_note:catalog.catalog_note,courseImage:catalog.courseImage,tee_meters:catalog.tee_meters,source:catalog.source,catalogApproved:true});
    else merged.push({...catalog,pars:catalog.pars?[...catalog.pars]:[],greens:catalog.gps_key?[...PUBLISHED_GPS_COURSE_POINTS[catalog.gps_key]]:[],catalogOnly:true,catalogApproved:true});
  }
  return merged.sort((a,b)=>a.name.localeCompare(b.name));
}
const WEATHER_CACHE_MS = 10*60*1000;
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}
});
const CLUBS=['Driver','3 Wood','5 Wood','7 Wood','2 Hybrid','3 Hybrid','4 Hybrid','5 Hybrid','2 Iron','3 Iron','4 Iron','5 Iron','6 Iron','7 Iron','8 Iron','9 Iron','Pitching Wedge','Gap Wedge','Sand Wedge','Lob Wedge'];
const roundDefault = {v:'home',course:'',courseId:null,catalogCourseId:null,holes:18,players:[''],pars:[],scores:{},putts:{},hole:1,teeSet:'black',done:false,resumeView:null,ownerUserId:null,createdBy:null};
let s = JSON.parse(localStorage.atgRound || 'null') || roundDefault;
if(!s.putts)s.putts={};
if(!s.teeSet)s.teeSet='black';
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
let chatMessages=[],chatTimer=null,unreadChatCount=0,chatToastTimer=null,chatMediaReady=true;
let qrScanner=null,qrScanLocked=false;
let avatarCacheVersion=Date.now();
let currentWeather=null,weatherLoading=false,weatherCache=JSON.parse(localStorage.atgWeatherCache||'{}');
let lastKnownPosition=null,lastGpsAccuracyYards=null,inlineHoleMap=null,inlineGolferMarker=null,inlineHoleGreen=null,inlineViewResetting=false,inlineUserMovedMap=false;
let inlinePlannerMarker=null,inlinePlannerLines=[],inlinePlannerLabels=[],shotPlannerGreen=null;
let googleMapsPromise=null,inlineGoogleOverlays=[];
const shotPlannerAims={};
let coursePreviewMaps=[];
let liveMapStyle=localStorage.atgLiveMapStyle==='street'?'street':'satellite';
let pendingScores=JSON.parse(localStorage.atgPendingScores||'{}');
let pendingHoleStats=JSON.parse(localStorage.atgPendingHoleStats||'{}');
let scoreSyncPromise=null;
let statsSyncPromise=null;
let recoveryMode=false;
let courseLibraryQuery='',courseLibraryLocation=null;
let courseLibraryFilters={nearby:false,favorites:false,recent:false,holes:null,mapped:false,par3:false,difficulty:null};
const save=()=>{localStorage.atgRound=JSON.stringify(s)};
const rel=n=>n===0?'E':n>0?'+'+n:n;
const parTotal=n=>s.pars.slice(0,n).reduce((a,b)=>a+b,0);
const total=(p,n=s.holes)=>Array.from({length:n},(_,i)=>s.scores[p]?.[i+1]||0).reduce((a,b)=>a+b,0);
const courseById=id=>courses.find(c=>c.id===id);
const selectedRoundCourse=()=>courseById(s.courseId||s.catalogCourseId)||courses.find(c=>courseMatchKey(c.name)===courseMatchKey(s.course));
function avatarUrl(path){if(!path)return'';return db.storage.from('golfer-avatars').getPublicUrl(path).data.publicUrl+'?v='+avatarCacheVersion}
function avatarMarkup(path,name,className='profile-photo'){const label=name||'Golfer';return path?`<img class="${className}" src="${esc(avatarUrl(path))}" alt="${esc(label)} profile picture">`:`<span class="${className} avatar-fallback">${esc(label.charAt(0).toUpperCase()||'G')}</span>`}

function render(){save();document.querySelector('meta[name="theme-color"]')?.setAttribute('content',s.v==='round'?'#f7faf8':'#064c32');stopLocation();if(inlineHoleMap){if(inlineHoleMap.provider==='google')clearInlineGoogleOverlays();inlineHoleMap.remove();inlineHoleMap=null;inlineGolferMarker=null;inlineHoleGreen=null;inlineViewResetting=false;inlineUserMovedMap=false;inlinePlannerMarker=null;inlinePlannerLines=[];inlinePlannerLabels=[];shotPlannerGreen=null}for(const previewMap of coursePreviewMaps){try{previewMap.remove()}catch{}}coursePreviewMaps=[];if(map){if(draft&&!draft.skipMapViewSave){const center=map.getCenter();if(center)draft.mapView={lat:center.lat,lng:center.lng,zoom:map.getZoom()}}map.remove();map=null}if(draft?.skipMapViewSave){delete draft.mapView;delete draft.skipMapViewSave}app.className='';({home,setup,pars,round,recap,coursesView,mapCourse,accountView,historyView,historyDetailView,clubsView,chatView,usersView,signupView,profileView,roundManageView}[s.v]||home)();if(!['home','signupView'].includes(s.v))bottomNav()}
function appGuide(){return`<details class="app-guide" ontoggle="positionExpandedGuide(this)"><summary><span>App Guide & About</span><b>＋</b></summary><div class="guide-body"><section class="founder-card"><img src="rick-kulon-profile.jpg" alt="Rick Kulon, creator of the Agape Tumoutou Golfers app"><div><small class="guide-opening-line">CREATED FOR THE FELLOWSHIP</small><h2>Agape Tumoutou Golfers</h2><p>A mobile golf companion created by Rick Kulon to bring fellowship, course guidance, scoring and group communication together in one simple app.</p></div></section><h3>Before Your First Round</h3><ol><li>Tap <b>Sign Up</b> and enter your first name, last name, email and phone number.</li><li>Open the verification email from Supabase and confirm your account.</li><li>Return to the app and sign in. Your login is remembered on that device.</li><li>Open <b>Account → My Profile & Picture</b> to finish your profile.</li><li>Open <b>My Clubs & Distances</b> and save the distance you normally carry each club.</li></ol><h3>Create or Join a Round</h3><ol><li>One golfer creates a protected 9- or 18-hole round.</li><li>Share the six-character round code, join link or QR code.</li><li>Every participant signs in before joining; the score sheet uses the golfer's profile first name, which remains editable.</li><li>Use <b>Resume Current Round</b> if you leave the round screen accidentally.</li></ol><h3>Google Maps Course View</h3><ul class="guide-features"><li>High-quality full-screen Google Map and Satellite views</li><li>Each hole automatically frames the complete route and aligns from the golfer or tee toward the next aim point or green</li><li>Pinch to zoom, drag to pan, twist to rotate and use a two-finger vertical gesture to tilt supported maps</li><li>Tap the crosshair below the weather panel to restore the aligned full-hole view</li><li>Hole number, mapped distance, par and live route remaining remain visible across the top</li><li>Temperature, weather icon and wind direction are shown relative to the playing direction</li><li>Previous and next-hole arrows sit along the map edges, and the ATG crest opens the round QR code</li></ul><h3>Shot Planner & Suggested Club</h3><ul class="guide-features"><li>Move the gold aim marker to plan where the ball should land</li><li>The thin solid and dotted gold route lines update as the planner moves</li><li>See <b>yards to hit</b>, route-aware <b>yards to go</b> and the suggested club together beside the route</li><li>Mapped Aim 1 and Aim 2 points guide dogleg holes</li><li>The planner begins from your current GPS position as you advance up the hole</li><li>Suggested Club uses your saved carry distances and stops recommending Driver after you move beyond the tee area</li></ul><div class="notice guide-tip"><b>Remember:</b> Club suggestions are guidance only. Consider wind, lie, elevation, hazards and your normal shot shape.</div><h3>Protected Scoring</h3><ul class="guide-features"><li>Your score begins at the hole's par</li><li>Use <b>−</b> or <b>+</b>, or tap the raised score button for exact strokes and optional putts</li><li>Tap <b>0 · 10–20</b> in the score-entry sheet to enter scores of 10 or more</li><li>Each signed-in golfer can edit their own score, including when the round host is another golfer</li><li>The Live Scorecard updates for the group</li><li>Scores wait safely on the phone while offline and synchronize after reconnecting</li><li>Share or download a branded scorecard image with the ATG crest</li></ul><h3>Private Round Chat & Photos</h3><ul class="guide-features"><li>Send messages to everyone participating in the current round</li><li>Unread badges and alerts identify new messages</li><li>Tap 📷 to take a photo or choose one from your photo library</li><li>Type before choosing a photo if you want to include a caption</li><li>Tap a shared photo to view it full-screen or save/download it</li><li>When the host permanently deletes the round, its chat photos are removed from app storage</li></ul><h3>Courses, Account & History</h3><ul class="guide-features"><li>See up to seven recommended courses based on location, favorites, recent play and mapping completeness</li><li>Search the complete shared course library or filter by distance, favorites, recent play, holes, mapping and difficulty</li><li>Tap the star on a course to save it as a favorite on that device</li><li>Tap a course name or map to start a new round at that location</li><li>Upload a golfer picture and edit your profile information</li><li>Review My Clubs & Distances or change your password</li><li>Open Previous Matches to view and share completed scorecards</li><li>Remove a match from only your history, or let the host permanently delete it for everyone</li><li>Authorized administrators can map tees, dogleg aim points and front, center and back of greens with Google Maps</li><li>The Super Admin can manage course administrators and view the private registered-player directory</li></ul><h3>Save It to Your Home Screen</h3><div class="install-guide"><section><h4>iPhone or iPad</h4><ol><li>Open the app in <b>Safari</b>.</li><li>Tap <b>Share → Add to Home Screen → Add</b>.</li></ol></section><section><h4>Android</h4><ol><li>Open the app in <b>Chrome</b>.</li><li>Tap the menu, then <b>Install app</b> or <b>Add to Home screen</b>.</li></ol></section></div><div class="notice guide-tip"><b>Tip:</b> If the link opens inside Messages, Facebook or another app, choose <b>Open in Safari</b> or <b>Open in Chrome</b> first.</div><h3>Location & Privacy</h3><p>Allow precise location access for live GPS yardages, playing-direction alignment and club suggestions. Round scores, messages and photos are limited to participating golfers. Profile contact information is available only to you and the Super Admin.</p><div class="guide-update">Current feature guide · Version 90 · Updated August 30, 2026</div><div class="guide-contact"><p>Suggestions for improving the app are welcome.</p><a href="mailto:ricbkewl@gmail.com?subject=Agape%20Golf%20App%20Suggestion">✉ ricbkewl@gmail.com</a><a href="sms:+16074383208">✆ Text 607.438.3208</a></div><button class="guide-close-button" onclick="closeAppGuide(this)">Close & Return Home</button></div></details>`}
function positionExpandedGuide(details){
  if(!details.open)return;
  const headings=[...details.querySelectorAll('.guide-body > h3')],beforeHeading=headings.find(heading=>heading.textContent==='Before Your First Round'),installHeading=headings.find(heading=>heading.textContent==='Save It to Your Home Screen');
  const beforeList=beforeHeading?.nextElementSibling,installGuide=installHeading?.nextElementSibling,installTip=installGuide?.nextElementSibling;
  if(beforeList&&installHeading&&installGuide&&installTip)beforeList.after(installHeading,installGuide,installTip);
  const courseHeading=headings.find(heading=>heading.textContent==='Courses, Account & History'),courseList=courseHeading?.nextElementSibling;
  if(courseList&&!courseList.querySelector('[data-provisional-guide]'))courseList.insertAdjacentHTML('beforeend','<li data-provisional-guide>Courses approved for selection may still contain provisional GPS coordinates. Review and correct tees, aim points and greens before play when necessary.</li><li data-provisional-guide>Royale North Jakarta, Royale South Jakarta and Royale West Jakarta are listed as three separately approved nine-hole courses with their own scorecards and course-overview images.</li>');
  const createJoin=details.querySelector('.guide-body > h3:nth-of-type(2)')?.nextElementSibling;if(createJoin&&!createJoin.querySelector('[data-menu-guide]'))createJoin.insertAdjacentHTML('beforeend','<li data-menu-guide>During an active round, the main navigation follows Home, Round, Courses/Players, Chat and My Account. The gold Resume control includes a separate one-third End Round action with confirmation.</li>');
  const update=details.querySelector('.guide-update');if(update)update.textContent='Current feature guide · Version 96 · Updated August 31, 2026';
  requestAnimationFrame(()=>requestAnimationFrame(()=>details.querySelector('.guide-opening-line')?.scrollIntoView({behavior:'smooth',block:'start'})));
}
function closeAppGuide(button){
  const details=button.closest('.app-guide');if(details)details.open=false;
  window.scrollTo({top:0,behavior:'smooth'});
}
function activeRoundHomeCard(){if(!s.sharedRoundId||!s.joinCode)return'';if(s.done)return`<section class="active-round-card"><div><small>COMPLETED ROUND</small><b>${esc(s.course)}</b><span>Your scorecard is saved.</span></div><div class="active-round-actions completed-actions"><button onclick="openCurrentRound()">Scorecard</button>${s.createdBy===currentUser?.id?'<button onclick="openRoundManagement()">Manage</button>':''}<button onclick="shareCurrentScorecard()">Share</button></div></section>`;return`<section class="active-round-card"><div><small>ACTIVE ROUND</small><b>${esc(s.course)}</b><span>Join code <strong>${esc(s.joinCode)}</strong></span></div><div class="active-round-actions"><button onclick="copyRoundCode()">Copy</button><button onclick="showRoundQr()">Show Join QR</button><button onclick="shareRoundLink()">Share</button></div></section>`}
function profileMissingItems(){if(!currentUser)return[];const missing=[];if(!golferProfile?.first_name||!golferProfile?.last_name)missing.push('your full name');if(!golferProfile?.phone)missing.push('your phone number');if(!golferProfile?.avatar_path)missing.push('a profile picture');return missing}
function profileCompletionReminder(){const missing=profileMissingItems();if(!missing.length)return'';return`<button class="profile-reminder" onclick="openProfile()"><span>!</span><div><b>Finish Your Golfer Profile</b><small>Add ${esc(missing.join(', '))}.</small></div><i>→</i></button>`}
function clubCompletionReminder(){if(!currentUser||clubProfileError||currentUser.user_metadata?.club_setup_complete===true)return'';const count=Object.keys(clubDistances).length;return`<button class="profile-reminder clubs-reminder" onclick="openClubs()"><span>⛳</span><div><b>Finish Setting Up My Clubs</b><small>${count?`${count} club${count===1?'':'s'} saved. Add the rest of the clubs you carry.`:'Add the carry distance for each club you use.'}</small></div><i>→</i></button>`}
function homeSignInForm(){if(currentUser)return profileCompletionReminder()+clubCompletionReminder();if(cloudLoading)return'<div class="home-auth-loading">Checking your saved login…</div>';return`<form class="home-signin" onsubmit="signInFromHome(event)"><div class="home-signin-heading"><span>♙</span><div><b>Golfer Sign In</b><small>Sign in before creating or joining a round</small></div></div><label for="homeEmail">Email</label><input id="homeEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" required placeholder="you@example.com"><label for="homePassword">Password</label><input id="homePassword" type="password" autocomplete="current-password" required placeholder="Enter your password"><div id="homeSignInError" class="home-signin-error" role="alert"></div><button id="homeSignInButton" class="primary home-signin-button" type="submit">Sign In</button></form><div class="home-action-divider"><span>ROUND OPTIONS</span></div>`}
function home(){const canResume=(s.sharedRoundId||['setup','pars','round','recap'].includes(s.resumeView))&&!s.done;app.className='home-page';app.innerHTML=`<section class="home-hero"><div class="logo-wrap"><img src="agape-golf-logo.png" alt="Agape Tumoutou Golfers logo" class="landing-logo"></div><div class="home-brand">FAITH · FELLOWSHIP · FAIRWAYS</div><h1>Saved to <span>Serve</span></h1><p class="scripture"><strong><em>“Who hath saved us, and called us<br>with a holy calling...”</em> <span>2 Tim. 1:9</span></strong></p><div class="feature-pills"><span>⛳ Shared Courses</span><span>◎ Live GPS</span><span>＋ Protected Scoring</span><span>💬 Live Chat</span></div></section><section class="home-actions">${homeSignInForm()}${cloudLoading?'<div class="notice">Loading shared courses…</div>':''}${cloudError?`<div class="error-notice">${esc(cloudError)}</div>`:''}<button class="secondary home-secondary home-courses-link" onclick="openCoursesFromNav()">⛳ Courses</button>${canResume?'<div class="home-resume-split"><button class="primary home-primary" onclick="resumeRound()">Resume Round <b>→</b></button><button class="home-end-round" onclick="endCurrentRoundFromHome()">End<br>Round</button></div><button class="secondary home-secondary" onclick="start()">Start a New Round</button>':`<button class="primary home-primary" onclick="start()" ${cloudLoading?'disabled':''}>Create a Round <b>→</b></button>`}${activeRoundHomeCard()}<button class="secondary home-secondary" onclick="joinRound()">Join with Round Code</button><button class="secondary home-secondary scan-round-button" onclick="showQrScanner()">▣ Scan Round QR</button><div class="account-bar">${currentUser?`<span class="account-status"><i></i>${adminRole?esc(adminRole.replace('_',' ')):'Golfer signed in'}</span><button class="back" onclick="accountAction()">My Account</button>`:`<span><button class="back" onclick="createAccount()">Sign Up</button></span><span><button class="back" onclick="forgotPassword()">Forgot Password?</button></span>`}</div></section>${appGuide()}<footer class="home-footer">Saved to serve · Ready to play</footer>`}
function myRoundPlayerName(){if(s.sharedRoundId)return sharedPlayers.find(player=>player.user_id===currentUser?.id)?.display_name||'';return s.players[0]||''}
async function ensureMyRoundPlayerName(){
  let name=myRoundPlayerName();if(name)return name;
  if(s.sharedRoundId&&currentUser&&await loadSharedRound(false))name=myRoundPlayerName();
  if(!name)alert('Your golfer account could not be matched to this round. Check your connection, then rejoin with round code '+(s.joinCode||'shown by the host')+'.');
  return name;
}
function roundBottomNav(){
  const name=myRoundPlayerName(),encoded=encodeURIComponent(name),holeScore=scoreValue(name)||Number(s.pars[s.hole-1])||0,roundTotal=total(name,s.hole);
  app.insertAdjacentHTML('beforeend',`<nav class="round-action-bar" aria-label="Round controls"><div class="round-score-dock"><button onclick="changeScore('${encoded}',-1)" aria-label="Subtract one stroke">−</button><button class="round-score-display" onclick="openScoreEntry()" aria-label="Tap to enter score for Hole ${s.hole}"><b id="roundHoleScore">${holeScore}</b><small id="roundScoreTotal">Tap · Total ${roundTotal}</small></button><button onclick="changeScore('${encoded}',1)" aria-label="Add one stroke">+</button></div><button class="round-dock-button" onclick="openRoundChat()" ${s.sharedRoundId?'':'disabled'}><span class="chat-nav-icon">💬<i id="chatUnreadBadge" class="chat-unread ${unreadChatCount?'':'hidden'}">${unreadChatCount>99?'99+':unreadChatCount}</i></span><small>Chat</small></button><button class="round-dock-button" onclick="openScorecard()"><span>▦</span><small>Scorecard</small></button><button class="round-dock-button" onclick="showRoundQuickMenu()"><span>•••</span><small>Menu</small></button></nav>`)
}
function bottomNav(){if(s.v==='round'){roundBottomNav();return}app.insertAdjacentHTML('beforeend',`<nav class="bottom-nav ${s.sharedRoundId?'has-chat':''}" aria-label="Main navigation"><button onclick="goHome()"><span>⌂</span>Home</button>${s.sharedRoundId?'<button onclick="openCurrentRound()"><span>🏌</span>Round</button>':''}<button onclick="openCoursesFromNav()"><span>⛳</span>${adminRole==='super_admin'?'Courses/Players':'Courses'}</button>${s.sharedRoundId?`<button onclick="openRoundChat()"><span class="chat-nav-icon">💬<i id="chatUnreadBadge" class="chat-unread ${unreadChatCount?'':'hidden'}">${unreadChatCount>99?'99+':unreadChatCount}</i></span>Chat</button>`:''}<button onclick="accountAction()"><span>${currentUser?'●':'♙'}</span>${currentUser?'My Account':'Login'}</button></nav>`)}
function closeRoundQuickMenu(){document.querySelector('.round-quick-overlay')?.remove()}
function showRoundQuickMenu(){
  closeRoundQuickMenu();const overlay=document.createElement('div');overlay.className='round-quick-overlay';overlay.onclick=event=>{if(event.target===overlay)closeRoundQuickMenu()};
  overlay.innerHTML=`<section class="round-quick-menu"><div><b>Round Menu</b><button onclick="closeRoundQuickMenu()" aria-label="Close menu">×</button></div><button onclick="closeRoundQuickMenu();openCoursesFromNav()"><span>⛳</span>${adminRole==='super_admin'?'Courses/Players':'Courses'}</button><button onclick="closeRoundQuickMenu();showTeePicker()"><span>◉</span>Playing Tee · ${esc(teeSetLabel())}</button><button onclick="closeRoundQuickMenu();goHome()"><span>⌂</span>Home</button><button onclick="closeRoundQuickMenu();openCurrentRound()"><span>🏌</span>Round</button><button onclick="closeRoundQuickMenu();accountAction()"><span>●</span>My Account</button></section>`;document.body.appendChild(overlay)
}
function teeSetLabel(value=s.teeSet){return({black:'Black Tee',blue:'Blue Tee',white:'White Tee',red:'Red Tee'})[value]||'Black Tee'}
function selectedTee(green){return green?.tees?.[s.teeSet]||green?.tees?.black||green?.tee||null}
function availableTeeSets(){const course=selectedRoundCourse(),sets=new Set();for(const green of course?.greens||[])for(const color of ['black','blue','white','red'])if(green?.tees?.[color])sets.add(color);return sets.size?[...sets]:['black']}
function showTeePicker(){
  document.querySelector('.tee-picker-overlay')?.remove();const sets=availableTeeSets(),overlay=document.createElement('div');overlay.className='tee-picker-overlay';overlay.onclick=event=>{if(event.target===overlay)overlay.remove()};
  overlay.innerHTML=`<section class="tee-picker"><div><span><small>PLAYING TEE</small><b>Choose your tee</b></span><button onclick="this.closest('.tee-picker-overlay').remove()" aria-label="Close tee selection">×</button></div><p>This changes the map and yardage for you only. Other golfers can choose their own tee.</p>${sets.map(color=>`<button class="tee-choice ${s.teeSet===color?'on':''}" onclick="setRoundTee('${color}')"><i class="tee-choice-dot ${color}"></i><span><b>${teeSetLabel(color)}</b><small>${color==='black'?'Back / championship':color==='blue'?'Back / experienced':color==='white'?'Middle / standard':'Forward'}</small></span><em>${s.teeSet===color?'Selected':'Choose'}</em></button>`).join('')}${sets.length===1&&!selectedRoundCourse()?.greens?.some(g=>g?.tees)?'<div class="notice">This course currently has one reviewed reference tee. More tee choices will appear after its mapping is approved.</div>':''}</section>`;document.body.appendChild(overlay)
}
function setRoundTee(color){if(!availableTeeSets().includes(color))return;s.teeSet=color;for(const key of Object.keys(shotPlannerAims))delete shotPlannerAims[key];document.querySelector('.tee-picker-overlay')?.remove();save();showRoundHole()}
function rememberRoundView(){if(['setup','pars','round','recap'].includes(s.v)&&!s.done)s.resumeView=s.v}
function goHome(){rememberRoundView();s.v='home';render()}
async function resumeRound(){if(s.sharedRoundId)await loadSharedRound(false);s.v=s.done?'recap':(s.resumeView||'round');render()}
async function endCurrentRoundFromHome(){
  if(s.sharedRoundId){
    await loadSharedRound(false);
    if(s.createdBy===currentUser?.id){await setRoundStatus('complete');return}
    if(!confirm('Leave this active round on this device? Your saved scores will remain in Previous Matches, and the host’s round will stay active.'))return
  }else if(!confirm('End this unfinished round? Any unsaved local setup or scoring will be discarded.'))return;
  const playerName=golferProfile?.first_name?.trim()||'';s={...roundDefault,v:'home',players:[playerName],ownerUserId:currentUser?.id||null};save();render()
}
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
  await Promise.all([syncPendingScores(),syncPendingHoleStats()]);
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
  if(error){courses=mergeListedCourseCatalog(courses);cloudError=courses.length?'You are offline. Using the courses saved on this device.':'Shared courses could not be loaded. Connect to the internet and try again.';return}
  cloudError='';courses=mergeListedCourseCatalog(data||[]);localStorage.atgCourses=JSON.stringify(courses);
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
  const green=selectedRoundCourse()?.greens?.[s.hole-1];
  if(!lastKnownPosition||!selectedTee(green)||!golferIsNearHole(green))return true;
  const teeBuffer=Math.max(35,Math.min(60,(lastGpsAccuracyYards||0)+15));
  return distanceYards(lastKnownPosition,selectedTee(green))<=teeBuffer;
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
async function start(){if(!currentUser){alert('Each golfer needs an account so scores can be protected. Please sign in or create an account first.');await signInAccount();if(!currentUser)return}if(s.resumeView&&!s.done&&!confirm('Start a new round? Your unfinished round will be replaced.'))return;const playerName=golferProfile?.first_name?.trim()||'';s={...roundDefault,v:'setup',players:[playerName],scores:{},putts:{},pars:[],resumeView:'setup',sharedRoundId:null,joinCode:null,ownerUserId:currentUser.id};render()}
function setup(){const selectedCourseId=s.courseId||s.catalogCourseId,hasSavedCourse=!!selectedCourseId,selectedCourse=courseById(selectedCourseId),gpsAvailable=mappedCount(selectedCourse)>0;const options=courses.map(c=>`<option value="${esc(c.id)}" ${selectedCourseId===c.id?'selected':''}>${esc(c.name)} (${c.holes} holes)</option>`).join('');app.innerHTML=`<button class="back" onclick="goHome()">← Back</button><h1>Create a Round</h1><p class="muted">Choose a saved course to start immediately, or create a custom scorecard.</p><label>Saved course</label><select id="savedCourse" onchange="chooseCourse(this.value)"><option value="">Custom scorecard without GPS</option>${options}</select>${hasSavedCourse?`<div class="notice">${gpsAvailable?'The available GPS tee and green markers will be used automatically.':'The approved course name and hole pars will be used. GPS guidance will appear as its holes are mapped.'}</div>`:`<label>Course name</label><input id="course" value="${esc(s.course)}" placeholder="e.g., Oak Valley Golf Club"><label>How many holes?</label><div class="row"><button class="choice ${s.holes===9?'on':''}" onclick="setHoles(9)">9 Holes</button><button class="choice ${s.holes===18?'on':''}" onclick="setHoles(18)">18 Holes</button></div>`}<label>Your name for this round</label><input aria-label="Your name for this round" value="${esc(s.players[0]||'')}" placeholder="Enter your name" oninput="updatePlayer(0,this.value)"><div class="notice">Your profile first name is entered automatically, but you can edit it. Other golfers join from their own phones.</div><button id="${hasSavedCourse?'createRoundButton':'setupContinueButton'}" class="primary" onclick="goPars()">${hasSavedCourse?'Create Protected Round':'Continue'}</button>`}
function chooseCourse(id){const c=courseById(id);if(c){s.courseId=c.catalogOnly?null:c.id;s.catalogCourseId=c.catalogOnly?c.id:null;s.course=c.name;s.holes=c.holes;s.pars=c.pars?.length===c.holes?[...c.pars]:Array(c.holes).fill(4);s.teeSet='black'}else{s.courseId=null;s.catalogCourseId=null;s.course='';s.pars=[];s.teeSet='black'}render()}
function setHoles(n){s.holes=n;render()}
function addPlayer(){const n=$('name').value.trim();if(n&&!s.players.includes(n)){s.players.push(n);render()}}
function updatePlayer(i,name){s.players[i]=name;save()}
function removePlayer(i){s.players.splice(i,1);render()}
function goPars(){const names=s.players.map(x=>x.trim()).filter(Boolean);if(!names.length){alert('Enter at least one player name.');return}if(new Set(names.map(x=>x.toLowerCase())).size!==names.length){alert('Each player needs a different name.');return}s.players=names;const hasSavedCourse=!!(s.courseId||s.catalogCourseId);if(!hasSavedCourse)s.course=$('course').value.trim()||'Friendly Round';s.pars=Array.from({length:s.holes},(_,i)=>s.pars[i]||4);if(hasSavedCourse){createSharedRound();return}s.v='pars';s.resumeView='pars';render()}
function pars(){app.innerHTML=`<button class="back" onclick="s.v='setup';render()">← Back</button><h1>Set hole pars</h1><p class="muted">Adjust any hole that is not par 4.</p>${s.pars.map((x,i)=>`<div class="card row"><b>Hole ${i+1}</b><div class="stepper"><button onclick="changePar(${i},-1)">−</button><span>${x}</span><button onclick="changePar(${i},1)">+</button></div></div>`).join('')}<button id="createRoundButton" class="primary" onclick="createSharedRound()">Create Protected Round</button>`}
function changePar(i,d){s.pars[i]=Math.max(3,Math.min(6,s.pars[i]+d));render()}
async function createSharedRound(){
  if(!currentUser){alert('Please sign in first.');return}
  const button=$('createRoundButton');if(button){button.disabled=true;button.textContent='Creating round…'}
  const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const databaseCourseId=uuidPattern.test(String(s.courseId||''))?s.courseId:null;
  if(s.courseId&&!databaseCourseId){s.catalogCourseId=s.catalogCourseId||s.courseId;s.courseId=null}
  const {data,error}=await db.rpc('create_shared_round',{p_course_id:databaseCourseId,p_course_name:s.course,p_holes:s.holes,p_pars:s.pars,p_display_name:s.players[0]});
  if(error){alert('Round could not be created: '+error.message);if(button){button.disabled=false;button.textContent='Create Protected Round'}return}
  s.sharedRoundId=data.round_id;s.joinCode=data.join_code;s.hole=1;s.done=false;s.resumeView='round';
  await loadSharedRound(false);s.v='round';render();
}
function signedInGolferFirstName(){return golferProfile?.first_name?.trim()||currentUser?.user_metadata?.first_name?.trim()||''}
function isGenericGolferName(name){return !name?.trim()||/^golfer$/i.test(name.trim())}
async function requireGolferSignInToJoin(){
  if(currentUser)return true;
  alert('Please sign in before joining the round. Your round code or link will be remembered.');
  return await signInAccount();
}
function scorecardNameForJoin(){
  const firstName=signedInGolferFirstName();
  const name=prompt('Name on the scorecard (you can edit it):',firstName);
  return name?.trim()||'';
}
async function joinRound(){
  if(!await requireGolferSignInToJoin())return;
  const code=prompt('Enter the 6-character round code:');if(!code)return;
  await joinRoundWithCode(code.trim());
}
async function joinRoundWithCode(code){
  if(!code)return;
  localStorage.atgPendingJoinCode=code.toUpperCase();
  if(!await requireGolferSignInToJoin())return;
  const name=scorecardNameForJoin();if(!name)return;
  const {data,error}=await db.rpc('join_shared_round',{p_join_code:code.trim(),p_display_name:name});
  if(error){alert('Could not join round: '+error.message);return}
  delete localStorage.atgPendingJoinCode;history.replaceState({},'',location.pathname);
  s={...roundDefault,v:'round',players:[name],scores:{},putts:{},sharedRoundId:data.round_id,joinCode:data.join_code,resumeView:'round',ownerUserId:currentUser.id};
  await loadSharedRound(false);render();
}
async function loadSharedRound(showError=true){
  if(!s.sharedRoundId||!currentUser)return false;
  const [roundResult,playersResult,scoresResult,statsResult]=await Promise.all([
    db.from('shared_rounds').select('id,join_code,course_id,course_name,holes,pars,status,created_by').eq('id',s.sharedRoundId).single(),
    db.from('round_players').select('user_id,display_name,joined_at').eq('round_id',s.sharedRoundId).order('joined_at'),
    db.from('round_scores').select('user_id,hole,strokes').eq('round_id',s.sharedRoundId),
    db.from('round_hole_stats').select('user_id,hole,putts').eq('round_id',s.sharedRoundId)
  ]);
  if(roundResult.error||playersResult.error||scoresResult.error){if(showError)alert('Shared scores could not be refreshed. Check your connection.');return false}
  const r=roundResult.data;s.joinCode=r.join_code;s.courseId=r.course_id;s.course=r.course_name;s.holes=r.holes;s.pars=r.pars;s.catalogCourseId=r.course_id?null:(courses.find(c=>courseMatchKey(c.name)===courseMatchKey(r.course_name))?.id||s.catalogCourseId||null);s.done=r.status==='complete';s.createdBy=r.created_by;
  const existingMine=(playersResult.data||[]).find(player=>player.user_id===currentUser.id),profileFirstName=signedInGolferFirstName();
  if(existingMine&&isGenericGolferName(existingMine.display_name)&&profileFirstName){
    const renamed=await db.rpc('join_shared_round',{p_join_code:r.join_code,p_display_name:profileFirstName});
    if(!renamed.error)existingMine.display_name=profileFirstName;
  }
  sharedPlayers=playersResult.data||[];s.players=sharedPlayers.map(p=>p.display_name);s.scores={};s.putts={};
  for(const score of scoresResult.data||[]){const player=sharedPlayers.find(p=>p.user_id===score.user_id);if(player){s.scores[player.display_name]??={};s.scores[player.display_name][score.hole]=score.strokes}}
  if(!statsResult.error)for(const stat of statsResult.data||[]){const player=sharedPlayers.find(p=>p.user_id===stat.user_id);if(player&&Number.isInteger(stat.putts)){s.putts[player.display_name]??={};s.putts[player.display_name][stat.hole]=stat.putts}}
  const mine=sharedPlayers.find(p=>p.user_id===currentUser.id);
  if(mine)for(const pending of Object.values(pendingScores)){if(pending.round_id===s.sharedRoundId&&pending.user_id===currentUser.id){s.scores[mine.display_name]??={};s.scores[mine.display_name][pending.hole]=pending.strokes}}
  if(mine)for(const pending of Object.values(pendingHoleStats)){if(pending.round_id===s.sharedRoundId&&pending.user_id===currentUser.id){s.putts[mine.display_name]??={};s.putts[mine.display_name][pending.hole]=pending.putts}}
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
function pendingHoleStatKey(item){return`${item.round_id}:${item.user_id}:${item.hole}`}
function persistPendingHoleStats(){localStorage.atgPendingHoleStats=JSON.stringify(pendingHoleStats)}
async function syncPendingHoleStats(){
  if(!currentUser||!navigator.onLine)return false;
  if(statsSyncPromise)return statsSyncPromise;
  const syncUserId=currentUser.id;
  statsSyncPromise=(async()=>{
    while(true){
      const entries=Object.entries(pendingHoleStats).filter(([,item])=>item.user_id===syncUserId);
      if(!entries.length)return true;
      const {error}=await db.from('round_hole_stats').upsert(entries.map(([,item])=>item));
      if(error)return false;
      for(const [key,item] of entries)if(pendingHoleStats[key]?.updated_at===item.updated_at)delete pendingHoleStats[key];
      persistPendingHoleStats();
    }
  })();
  try{return await statsSyncPromise}finally{statsSyncPromise=null}
}
function scheduleRealtimeRefresh(){clearTimeout(realtimeTimer);realtimeTimer=setTimeout(async()=>{if(!s.sharedRoundId)return;await loadSharedRound(false);if(['round','recap'].includes(s.v))render()},350)}
function scheduleChatRefresh(){clearTimeout(chatTimer);chatTimer=setTimeout(async()=>{if(!s.sharedRoundId)return;await loadRoundMessages(false);if(s.v==='chatView')render()},250)}
function updateChatBadge(){const badge=$('chatUnreadBadge');if(!badge)return;badge.textContent=unreadChatCount>99?'99+':String(unreadChatCount);badge.classList.toggle('hidden',!unreadChatCount)}
function showChatToast(item){
  document.querySelector('.chat-toast')?.remove();clearTimeout(chatToastTimer);
  const sender=sharedPlayers.find(player=>player.user_id===item.user_id)?.display_name||'A golfer';
  const toast=document.createElement('button');toast.className='chat-toast';toast.type='button';
  const title=document.createElement('b');title.textContent=`New message from ${sender}`;
  const message=document.createElement('span');message.textContent=String(item.message||'Shared a photo').slice(0,100);
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
  const course=historyCourseName(roundId);if(!confirm(`Permanently delete ${course} for every golfer? All players, scores, chat messages and shared photos from this round will be erased.`))return;
  if(!confirm('This cannot be undone. Delete the shared round permanently?'))return;
  const mediaDeleted=await deleteRoundChatMedia(roundId);if(!mediaDeleted)return;
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
function scoreName(score,par){const delta=score-par;return delta<=-2?'Eagle':delta===-1?'Birdie':delta===0?'Par':delta===1?'Bogey':delta===2?'Double':`${delta>0?'+':''}${delta}`}
function scoreChoiceClass(score,par){return score<par?'under':score>par?'over':'par'}
function scoreEntryMarkup(){
  const name=myRoundPlayerName(),par=Number(s.pars[s.hole-1])||4,score=scoreValue(name)||par,putts=s.putts?.[name]?.[s.hole];
  const scoreButtons=Array.from({length:9},(_,index)=>index+1).map(value=>`<button class="score-choice ${scoreChoiceClass(value,par)} ${value===score?'selected':''}" onclick="setExactHoleScore(${value})"><b>${value}</b><small>${scoreName(value,par)}</small></button>`).join('');
  const puttButtons=[0,1,2,3,4].map(value=>`<button class="putt-choice ${value===putts?'selected':''}" onclick="setHolePutts(${value})">${value===4?'4+':value}</button>`).join('');
  return`<section class="score-entry-sheet" role="dialog" aria-modal="true" aria-label="Score Hole ${s.hole}"><header><div><small>HOLE ${s.hole}</small><h2>Enter Your Score</h2><span>PAR ${par}</span></div><button onclick="closeScoreEntry()" aria-label="Close score entry">×</button></header><h3>Strokes</h3><div class="score-choice-grid">${scoreButtons}<button class="score-choice more-score" onclick="chooseExtendedScore()"><b>0</b><small>10–20</small></button></div><h3>Putts <small>Optional</small></h3><div class="putt-choice-grid">${puttButtons}</div><footer><button onclick="scoreEntryPrevious()" ${s.hole===1?'disabled':''}>‹</button><button class="save-score-button" onclick="closeScoreEntry()">Save Hole ${s.hole}</button><button onclick="scoreEntryNext()">›</button></footer></section>`
}
async function openScoreEntry(){if(!await ensureMyRoundPlayerName())return;document.querySelector('.score-entry-overlay')?.remove();const overlay=document.createElement('div');overlay.className='score-entry-overlay';overlay.onclick=event=>{if(event.target===overlay)closeScoreEntry()};overlay.innerHTML=scoreEntryMarkup();document.body.appendChild(overlay)}
function closeScoreEntry(){document.querySelector('.score-entry-overlay')?.remove()}
function refreshScoreEntry(){const overlay=document.querySelector('.score-entry-overlay');if(overlay)overlay.innerHTML=scoreEntryMarkup();const name=myRoundPlayerName(),score=$('roundHoleScore'),roundTotal=$('roundScoreTotal');if(score)score.textContent=scoreValue(name)||Number(s.pars[s.hole-1])||0;if(roundTotal)roundTotal.textContent=`Tap · Total ${total(name,s.hole)}`}
function queueSharedScore(strokes){if(!s.sharedRoundId||!currentUser)return;const item={round_id:s.sharedRoundId,user_id:currentUser.id,hole:s.hole,strokes,updated_at:new Date().toISOString()};pendingScores[pendingScoreKey(item)]=item;persistPendingScores();syncPendingScores()}
function setExactHoleScore(strokes){const name=myRoundPlayerName(),value=Math.max(1,Math.min(20,Number(strokes)||1));if(!name)return;s.scores[name]??={};s.scores[name][s.hole]=value;save();queueSharedScore(value);refreshScoreEntry()}
function chooseExtendedScore(){const value=Number(prompt('Enter your total strokes from 10 to 20:'));if(Number.isInteger(value)&&value>=10&&value<=20)setExactHoleScore(value)}
function setHolePutts(putts){const name=myRoundPlayerName(),value=Math.max(0,Math.min(4,Number(putts)||0));if(!name)return;s.putts??={};s.putts[name]??={};s.putts[name][s.hole]=value;save();if(s.sharedRoundId&&currentUser){const item={round_id:s.sharedRoundId,user_id:currentUser.id,hole:s.hole,putts:value,updated_at:new Date().toISOString()};pendingHoleStats[pendingHoleStatKey(item)]=item;persistPendingHoleStats();syncPendingHoleStats()}refreshScoreEntry()}
function scoreEntryPrevious(){if(s.hole<=1)return;closeScoreEntry();s.hole--;showRoundHole();setTimeout(openScoreEntry,0)}
function scoreEntryNext(){closeScoreEntry();if(s.hole<s.holes){s.hole++;showRoundHole();setTimeout(openScoreEntry,0)}else{if(!s.sharedRoundId)s.done=true;s.v='recap';render()}}
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
function holeRoute(green){return[selectedTee(green),green?.aim1,green?.aim2,green?.center].filter(Boolean)}
function mappedHoleDistance(green){const route=holeRoute(green);if(route.length<2)return null;return Math.round(route.slice(1).reduce((sum,point,index)=>sum+distanceYards(route[index],point),0))}
function routeProjection(point,start,end){const latScale=Math.cos((start.lat+end.lat)*Math.PI/360),ax=start.lng*latScale,ay=start.lat,bx=end.lng*latScale,by=end.lat,px=point.lng*latScale,py=point.lat,dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;return length?((px-ax)*dx+(py-ay)*dy)/length:1}
function activeRouteSegment(here,green){const route=holeRoute(green);if(route.length<2)return null;if(!here)return{origin:route[0],target:route[1],index:1,isGreen:route[1]===green.center};for(let i=1;i<route.length;i++){const target=route[i],isLast=i===route.length-1,close=distanceYards(here,target)<45,passed=routeProjection(here,route[i-1],target)>.88;if(isLast||(!close&&!passed))return{origin:route[i-1],target,index:i,isGreen:target===green.center}}return{origin:route.at(-2),target:route.at(-1),index:route.length-1,isGreen:true}}
function shotPlannerKey(){return`${s.courseId||s.course}:${s.hole}:${s.teeSet||'black'}`}
function golferIsNearHole(green){return Boolean(lastKnownPosition&&green?.center&&distanceYards(lastKnownPosition,green.center)<=3000)}
function shotPlannerOrigin(green){return golferIsNearHole(green)?lastKnownPosition:selectedTee(green)}
function pointBetween(start,end,ratio=.5){return{lat:start.lat+(end.lat-start.lat)*ratio,lng:start.lng+(end.lng-start.lng)*ratio}}
function routeDistance(points){return points.slice(1).reduce((sum,point,index)=>sum+distanceYards(points[index],point),0)}
function remainingRoutePoints(origin,aim,green){const route=holeRoute(green),segment=activeRouteSegment(origin,green);let tail=segment?route.slice(segment.index+1):[];if(!tail.length||tail.at(-1)!==green.center)tail=[...tail,green.center];return[aim,...tail]}
function routeRemainingFrom(origin,green){const route=holeRoute(green),segment=activeRouteSegment(origin,green);if(!segment)return 0;return routeDistance([origin,...route.slice(segment.index)])}
function defaultShotPlannerAim(green){
  const near=golferIsNearHole(green),here=near?lastKnownPosition:null,segment=activeRouteSegment(here,green);if(!segment)return green.center;
  if(!segment.isGreen)return segment.target;
  if(green.aim1||green.aim2)return green.center;
  const tee=selectedTee(green),fullDistance=distanceYards(tee,green.center);if(fullDistance<=260)return green.center;
  const midpoint=pointBetween(tee,green.center,.5);if(here&&(distanceYards(here,midpoint)<40||routeProjection(here,tee,midpoint)>.92))return green.center;
  return midpoint;
}
function shotPlannerAim(green){const key=shotPlannerKey(),custom=shotPlannerAims[key];if(custom&&golferIsNearHole(green)&&distanceYards(lastKnownPosition,custom)<35)delete shotPlannerAims[key];return shotPlannerAims[key]||defaultShotPlannerAim(green)}
function updateShotPlanner(green){
  if(!selectedTee(green)||!green?.center)return;
  const origin=shotPlannerOrigin(green),aim=shotPlannerAim(green),remainingPoints=remainingRoutePoints(origin,aim,green),toTarget=Math.round(distanceYards(origin,aim)),remaining=Math.round(routeDistance(remainingPoints)),routeTotal=toTarget+remaining;
  if(inlinePlannerMarker)inlinePlannerMarker.setLatLng(aim);if(inlinePlannerLines[0])inlinePlannerLines[0].setLatLngs([origin,aim]);if(inlinePlannerLines[1])inlinePlannerLines[1].setLatLngs(remainingPoints);
  if(inlinePlannerLabels[0])inlinePlannerLabels[0].setLatLng(pointBetween(origin,aim,.5));if(inlinePlannerLabels[1]&&remainingPoints[1])inlinePlannerLabels[1].setLatLng(pointBetween(remainingPoints[0],remainingPoints[1],.5));
  const hit=$('plannerLineTargetYards'),left=$('plannerLineRemainingYards'),hitClub=$('plannerLineTargetClub'),goClub=$('plannerLineRemainingClub'),goLabel=$('plannerLineRemainingLabel'),yardage=$('centerYards'),label=$('yardageTargetLabel'),hitSuggestion=suggestedClubFor(toTarget,driverAllowedForCurrentShot()),goSuggestion=suggestedClubFor(remaining,false),hitClubName=hitSuggestion?.club||'Set Clubs',goClubName=goSuggestion?.club||'Set Clubs';if(hit)hit.textContent=toTarget;if(left)left.textContent=remaining;if(hitClub)hitClub.textContent=hitClubName;if(goClub)goClub.textContent=goClubName;if(goLabel)goLabel.classList.toggle('hidden',remaining<5);inlinePlannerLabels[0]?.setPlannerContent?.(toTarget,hitClubName,true);inlinePlannerLabels[1]?.setPlannerContent?.(remaining,goClubName,remaining>=5);if(yardage)yardage.textContent=routeTotal;if(label)label.textContent='Route Remaining';
  if(golferIsNearHole(green))updateClubSuggestion(toTarget,lastGpsAccuracyYards??999)
}
function liveHoleMapPanel(green,h,p){
  if(!selectedTee(green)||!green?.center)return`<section class="live-hole-map missing-hole-map"><b>Hole map unavailable</b><span>An administrator needs to map the tee and center green for Hole ${h}.</span></section>`;
  const yards=mappedHoleDistance(green);
  return`<section class="live-hole-map planner-on"><div class="live-map-viewport"><div id="liveHoleMap" aria-label="Forward-facing course view of Hole ${h}"></div></div><div class="hole-map-summary round-map-summary"><div><small>HOLE</small><b id="roundMapHole">${h}</b></div><div class="hole-distance-summary"><small>DISTANCE</small><b><span id="roundMapDistance">${yards}</span> <i>YDS</i></b></div><div><small>PAR</small><b id="roundMapPar">${p}</b></div><div class="route-remaining-summary"><small>ROUTE REMAINING</small><b><span id="centerYards">${yards}</span> <i>YDS</i></b><span id="yardageTargetLabel" class="visually-hidden">Route Remaining</span></div><div class="round-qr-summary"><button onclick="showRoundQr()" aria-label="Show QR code for the current round" title="Show current round QR code"><img src="icon-192.png" alt="ATG"></button></div></div><div id="gpsStatus" class="visually-hidden">Locating…</div><button id="mapRecenterButton" class="map-recenter-button hidden" onclick="resetLiveHoleView()" aria-label="Restore the complete hole view" title="Restore hole view"><span></span></button><div class="live-map-style-toggle" aria-label="Map style"><button class="${liveMapStyle==='street'?'on':''}" onclick="setLiveMapStyle('street')">Map</button><button class="${liveMapStyle==='satellite'?'on':''}" onclick="setLiveMapStyle('satellite')">Satellite</button></div><div class="hole-edge-navigation" aria-label="Change hole"><button class="hole-edge-arrow previous" onclick="prev()" aria-label="Previous hole" ${h===1?'disabled':''}>‹</button><button class="hole-edge-arrow next" onclick="next()" aria-label="Next hole">›</button></div><div class="forward-label">GOOGLE MAPS · SHOT PLANNER · FORWARD</div><div class="map-wind-card"><div class="map-weather-temperature"><span id="mapWeatherIcon">◌</span><b id="mapTemperature">—°</b></div><small>WIND</small><span id="mapWindArrow" class="map-wind-arrow">↑</span><b id="mapWindSpeed">—</b><em id="mapWindLabel">Loading</em></div><div class="map-zoom-controls" aria-label="Map zoom controls"><button onclick="zoomLiveHoleMap(1)" aria-label="Zoom map in">+</button><button onclick="zoomLiveHoleMap(-1)" aria-label="Zoom map out">−</button></div><div class="hole-map-legend inline-legend"><span><i class="tee-dot"></i>Tee</span><span><i class="aim-dot"></i>Aim</span><span><i class="golfer-dot"></i>You</span><span><i class="green-dot"></i>Green</span></div></section>`;
}
function round(){
  if(s.done){s.v='recap';recap();return}
  ensureCurrentHolePar();const h=s.hole,p=s.pars[h-1],c=selectedRoundCourse(),green=c?.greens?.[h-1];app.classList.add('round-fullscreen');
  app.innerHTML=green?liveHoleMapPanel(green,h,p):`<section class="live-hole-map missing-hole-map"><b>Hole map unavailable</b><span>An administrator needs to map Hole ${h}.</span></section>`;
  const summary=document.querySelector('.round-map-summary');if(summary&&c){const strip=document.createElement('div');strip.className='round-course-name-strip';strip.textContent=c.name;summary.after(strip);requestAnimationFrame(positionRoundCourseNameStrip)}
  updateSyncIndicator();if(green){initInlineHoleMap(green);const segment=activeRouteSegment(null,green);if(segment)loadWeather(segment.origin,segment.target,segment.origin);startLocation(green)}
}
function positionRoundCourseNameStrip(){const summary=document.querySelector('.round-map-summary'),strip=document.querySelector('.round-course-name-strip');if(!summary||!strip)return;strip.style.top=`${summary.offsetTop+summary.offsetHeight}px`;strip.style.left=`${summary.offsetLeft}px`;strip.style.width=`${summary.offsetWidth}px`}
window.addEventListener('resize',positionRoundCourseNameStrip);
function yardagePanel(){return`<section class="gps-card"><div class="gps-signal-row top-gps-signal gps-compact-row"><div class="gps-accuracy"><b>GPS</b><div id="gpsStatus" class="small muted">Locating…</div></div><div class="hole-yardage-compact"><small id="yardageTargetLabel">Yards to Hole</small><b id="centerYards">–</b><em>yd</em></div><div class="top-weather-compact"><span id="currentWeatherIcon">◌</span><div><b id="currentTemperature">—°</b><small id="currentWeatherLabel">Loading</small></div></div></div><div class="club-suggestion featured-club"><div class="club-recommendation-copy"><small>Suggested Club</small><b id="clubSuggestion">—</b><span id="clubSuggestionNote">Waiting for an accurate GPS signal</span></div></div><button class="club-refresh-button" onclick="refreshLocation()">↻ Refresh GPS</button></section>`}
function loadGoogleMaps(){
  if(window.google?.maps)return Promise.resolve(window.google.maps);
  if(googleMapsPromise)return googleMapsPromise;
  googleMapsPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&loading=async`;script.async=true;script.defer=true;
    script.onload=()=>window.google?.maps?resolve(window.google.maps):reject(new Error('Google Maps did not initialize'));
    script.onerror=()=>reject(new Error('Google Maps could not load'));
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}
function googlePoint(value){return{lat:Number(value.lat),lng:Number(value.lng)}}
function googleMapFacade(raw,container){
  const listeners=[];
  return{
    provider:'google',raw,container,
    remove(){listeners.forEach(listener=>listener.remove?.());google.maps.event.clearInstanceListeners(raw);container.replaceChildren()},
    getCenter(){const center=raw.getCenter();return center?{lat:center.lat(),lng:center.lng()}:null},
    getZoom(){return Number(raw.getZoom()||0)},
    setZoom(value){raw.setZoom(value)},
    setView(value,zoom){raw.setCenter({lat:Number(value[0]),lng:Number(value[1])});if(Number.isFinite(zoom))raw.setZoom(zoom)},
    panBy(value){raw.panBy(Number(value[0]),Number(value[1]))},
    on(names,callback){for(const name of String(names).split(/\s+/)){const eventName=name==='zoomend'?'zoom_changed':name==='moveend'?'dragend':name;listeners.push(raw.addListener(eventName,callback))}}
  };
}
function googleMarkerFacade(marker){return{raw:marker,setLatLng(point){marker.setPosition(googlePoint(point))},getLatLng(){const point=marker.getPosition();return point?{lat:point.lat(),lng:point.lng()}:null},setMap(value){marker.setMap(value)}}}
function googlePolylineFacade(line){return{raw:line,setLatLngs(points){line.setPath(points.map(googlePoint))},setMap(value){line.setMap(value)}}}
function createGoogleHtmlOverlay(position,className,html){
  class AtgOverlay extends google.maps.OverlayView{
    constructor(){super();this.position=googlePoint(position);this.div=document.createElement('div');this.div.className=`${className} google-planner-label`;this.div.innerHTML=html;this.div.style.position='absolute';this.div.style.pointerEvents='none'}
    onAdd(){this.getPanes().overlayMouseTarget.appendChild(this.div)}
    draw(){
      const projection=this.getProjection();if(!projection)return;const point=projection.fromLatLngToDivPixel(this.position);if(!point)return;
      const mapDiv=this.getMap()?.getDiv(),label=this.div.firstElementChild,width=label?.offsetWidth||96,height=label?.offsetHeight||70,mapWidth=mapDiv?.clientWidth||window.innerWidth,mapHeight=mapDiv?.clientHeight||window.innerHeight,minTop=205,maxTop=Math.max(minTop,mapHeight-92-height);
      const left=Math.min(Math.max(point.x-width-34,10),Math.max(10,mapWidth-width-10)),laneOffset=className.includes('hit-label')?-(height/2+8):(height/2+8),top=Math.min(Math.max(point.y-height/2+laneOffset,minTop),maxTop);
      this.div.style.width=`${width}px`;this.div.style.height=`${height}px`;this.div.style.left=`${left}px`;this.div.style.top=`${top}px`;
      requestAnimationFrame(()=>resolveGooglePlannerLabelCollision(mapDiv));
    }
    onRemove(){this.div.remove()}
    setLatLng(point){this.position=googlePoint(point);if(this.getProjection())this.draw()}
  }
  const overlay=new AtgOverlay();return overlay;
}
function resolveGooglePlannerLabelCollision(mapDiv){
  if(!mapDiv)return;const hit=mapDiv.querySelector('.google-planner-label.hit-label'),go=mapDiv.querySelector('.google-planner-label.go-label');if(!hit||!go||go.firstElementChild?.classList.contains('hidden'))return;
  const a=hit.getBoundingClientRect(),b=go.getBoundingClientRect(),overlapX=Math.min(a.right,b.right)-Math.max(a.left,b.left),overlapY=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(overlapX<=0||overlapY<=0)return;
  const gap=10,limit=mapDiv.clientHeight-92-go.offsetHeight,currentGo=parseFloat(go.style.top)||0,nextGo=currentGo+overlapY+gap;if(nextGo<=limit){go.style.top=`${nextGo}px`;return}
  hit.style.top=`${Math.max(205,(parseFloat(hit.style.top)||205)-overlapY-gap)}px`;
}
function rememberGoogleOverlay(overlay){inlineGoogleOverlays.push(overlay);return overlay}
function clearInlineGoogleOverlays(){
  for(const overlay of inlineGoogleOverlays){try{google.maps.event.clearInstanceListeners(overlay.raw||overlay);(overlay.raw||overlay).setMap?.(null)}catch{}}
  inlineGoogleOverlays=[];inlineGolferMarker=null;inlinePlannerMarker=null;inlinePlannerLines=[];inlinePlannerLabels=[];
}
function googleCircleMarker(rawMap,position,fillColor,radius=9,title=''){
  const marker=new google.maps.Marker({map:rawMap,position:googlePoint(position),title,clickable:false,zIndex:900,icon:{path:google.maps.SymbolPath.CIRCLE,scale:radius,fillColor,fillOpacity:1,strokeColor:'#fff',strokeOpacity:1,strokeWeight:3}});
  rememberGoogleOverlay(marker);return marker;
}
function googlePlannerIcon(){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="58" height="58" viewBox="0 0 58 58"><circle cx="29" cy="29" r="25" fill="#d5ad51" stroke="#fff" stroke-width="4"/><circle cx="29" cy="29" r="15" fill="none" stroke="#173126" stroke-width="2"/><circle cx="29" cy="29" r="9" fill="none" stroke="#173126" stroke-width="2"/></svg>`;
  return{url:`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,scaledSize:new google.maps.Size(58,58),anchor:new google.maps.Point(29,29)};
}
function googlePlannerLabelIcon(kind,yards='—',club='—'){
  const width=116,height=78,label=kind==='hit'?'TO HIT':'TO GO',safeClub=String(club).replace(/[&<>"']/g,''),safeYards=String(yards).replace(/[^0-9—]/g,'');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect x="1" y="1" width="114" height="76" rx="12" fill="#0c1410" fill-opacity=".9" stroke="#f5cf68" stroke-opacity=".65"/><text x="58" y="25" text-anchor="middle" fill="#f5cf68" font-family="Arial,sans-serif" font-size="22" font-weight="800">${safeYards}</text><text x="58" y="37" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="10" font-weight="800">yd</text><text x="58" y="49" text-anchor="middle" fill="#d6e1db" font-family="Arial,sans-serif" font-size="8" font-weight="800" letter-spacing="1">${label}</text><line x1="14" y1="56" x2="102" y2="56" stroke="#f5cf68" stroke-opacity=".72"/><text x="58" y="70" text-anchor="middle" fill="#a9efc9" font-family="Arial,sans-serif" font-size="11" font-weight="800">${safeClub}</text></svg>`;
  return{url:`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,size:new google.maps.Size(width,height),scaledSize:new google.maps.Size(width,height),anchor:new google.maps.Point(width+34,height/2)};
}
function googlePlannerLabelMarker(rawMap,position,kind){
  const marker=new google.maps.Marker({map:rawMap,position:googlePoint(position),clickable:false,optimized:false,zIndex:1100,icon:googlePlannerLabelIcon(kind)});
  return{raw:marker,setMap:value=>marker.setMap(value),setLatLng:point=>marker.setPosition(googlePoint(point)),setPlannerContent:(yards,club,visible=true)=>{marker.setVisible(visible);if(visible)marker.setIcon(googlePlannerLabelIcon(kind,yards,club))}};
}
function orientInlineHoleMap(green,origin=null,target=null){
  if(!inlineHoleMap||!selectedTee(green)||!green?.center)return;
  const segment=activeRouteSegment(null,green),start=origin||segment?.origin||selectedTee(green),end=target||segment?.target||green.center,container=$('liveHoleMap'),bearing=bearingDegrees(start,end);
  if(inlineHoleMap.provider==='google'){
    if(container){container.dataset.forwardBearing=String(bearing);container.style.setProperty('--map-bearing','0deg');container.style.transform='none'}
    if(!inlineUserMovedMap||inlineViewResetting)inlineHoleMap.raw.moveCamera({heading:bearing,tilt:inlineHoleMap.raw.getTilt()||0});
    return;
  }
  if(container){container.dataset.forwardBearing=String(bearing);container.style.setProperty('--map-bearing',`${bearing}deg`);container.style.transform=`rotate(${-bearing}deg)`}
}
function zoomLiveHoleMap(change){if(!inlineHoleMap)return;inlineHoleMap.setZoom(inlineHoleMap.getZoom()+change,{animate:true})}
function showMapRecenterButton(){if(!inlineViewResetting){inlineUserMovedMap=true;$('mapRecenterButton')?.classList.remove('hidden')}}
function fitLiveHoleView(green){
  if(!inlineHoleMap||!selectedTee(green)||!green?.center)return;
  inlineViewResetting=true;inlineUserMovedMap=false;inlineHoleGreen=green;$('mapRecenterButton')?.classList.add('hidden');
  const points=[...holeRoute(green),green.front,green.back].filter(Boolean);
  if(inlineHoleMap.provider==='google'){
    const bounds=new google.maps.LatLngBounds();points.forEach(point=>bounds.extend(googlePoint(point)));inlineHoleMap.raw.setHeading(0);inlineHoleMap.raw.setTilt(0);
    google.maps.event.addListenerOnce(inlineHoleMap.raw,'idle',()=>{const zoom=inlineHoleMap.raw.getZoom();if(Number.isFinite(zoom))inlineHoleMap.raw.setZoom(Math.min(21,zoom+.3));orientInlineHoleMap(green);setTimeout(()=>{inlineViewResetting=false;inlineUserMovedMap=false;$('mapRecenterButton')?.classList.add('hidden')},240)});
    inlineHoleMap.raw.fitBounds(bounds,{top:190,right:72,bottom:115,left:72});return;
  }
  inlineHoleMap.fitBounds(points.map(point=>[point.lat,point.lng]),{padding:[100,70],maxZoom:22,animate:false});
  inlineHoleMap.setZoom(inlineHoleMap.getZoom()-1.5,{animate:false});
  setTimeout(()=>{orientInlineHoleMap(green);$('mapRecenterButton')?.classList.add('hidden');inlineViewResetting=false},180);
}
function resetLiveHoleView(){fitLiveHoleView(inlineHoleGreen)}
function setLiveMapStyle(style){
  liveMapStyle=style==='street'?'street':'satellite';localStorage.atgLiveMapStyle=liveMapStyle;
  if(inlineHoleMap?.provider==='google'){
    inlineHoleMap.raw.setMapTypeId(liveMapStyle==='satellite'?'satellite':'roadmap');document.querySelectorAll('.live-map-style-toggle button').forEach(button=>button.classList.toggle('on',button.textContent.trim().toLowerCase()===liveMapStyle));return;
  }
  render();
}
function enableForwardMapDragging(){
  const viewport=document.querySelector('.live-map-viewport'),container=$('liveHoleMap');if(!viewport||!container)return;
  if(inlineHoleMap?.provider==='google')return;
  const pointers=new Map();let dragPointer=null,plannerPointer=null;
  const resetRemaining=()=>{plannerPointer=null;if(pointers.size===1){const [id]=pointers.keys();dragPointer=id}else dragPointer=null};
  viewport.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;const plannerHandle=event.target.closest?.('.shot-planner-marker');pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(plannerHandle){plannerPointer=event.pointerId;dragPointer=null}else if(pointers.size===1)dragPointer=event.pointerId;else dragPointer=null;try{viewport.setPointerCapture(event.pointerId)}catch{}});
  viewport.addEventListener('pointermove',event=>{const prior=pointers.get(event.pointerId);if(!prior)return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size!==1||!inlineHoleMap)return;const dx=event.clientX-prior.x,dy=event.clientY-prior.y;if(!dx&&!dy)return;const angle=Number(container.dataset.forwardBearing||0)*Math.PI/180,localX=Math.cos(angle)*dx-Math.sin(angle)*dy,localY=Math.sin(angle)*dx+Math.cos(angle)*dy;if(plannerPointer===event.pointerId&&inlinePlannerMarker&&shotPlannerGreen){event.preventDefault();const point=inlineHoleMap.latLngToContainerPoint(inlinePlannerMarker.getLatLng()),latLng=inlineHoleMap.containerPointToLatLng([point.x+localX,point.y+localY]);shotPlannerAims[shotPlannerKey()]={lat:latLng.lat,lng:latLng.lng};inlinePlannerMarker.setLatLng(latLng);updateShotPlanner(shotPlannerGreen);return}if(dragPointer===event.pointerId)inlineHoleMap.panBy([-localX,-localY],{animate:false})});
  const end=event=>{pointers.delete(event.pointerId);resetRemaining()};viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
}
function initInlineHoleMapLeaflet(green){
  const container=$('liveHoleMap');if(!container||!selectedTee(green)||!green?.center||!window.L)return;
  inlineHoleMap=L.map(container,{zoomControl:false,zoomSnap:.25,dragging:false,scrollWheelZoom:false,doubleClickZoom:'center',boxZoom:false,keyboard:false,touchZoom:'center',attributionControl:false});
  inlineHoleGreen=green;
  const useStreetAttribution=(fallback=false)=>{const label=document.querySelector('.forward-label'),credit=document.querySelector('.hole-map-attribution');if(label)label.textContent=fallback?'SATELLITE UNAVAILABLE · MAP VIEW · FORWARD':'MAP VIEW · FAIRWAY ROUTE · FORWARD';if(credit){credit.textContent='© OpenStreetMap';credit.href='https://www.openstreetmap.org/copyright/'}};
  if(liveMapStyle==='satellite'&&MAPTILER_API_KEY)addSatelliteLayer(inlineHoleMap,()=>useStreetAttribution(true));else{addStreetLayer(inlineHoleMap);useStreetAttribution(false)}
  fitLiveHoleView(green);
  L.circleMarker(selectedTee(green),{radius:9,color:'#fff',weight:3,fillColor:'#d8a93e',fillOpacity:1}).addTo(inlineHoleMap);
  for(const aim of[green.aim1,green.aim2].filter(Boolean))L.circleMarker(aim,{radius:8,color:'#fff',weight:3,fillColor:'#e0bd66',fillOpacity:1}).addTo(inlineHoleMap);
  L.circleMarker(green.center,{radius:10,color:'#fff',weight:3,fillColor:'#176b45',fillOpacity:1}).addTo(inlineHoleMap);
  shotPlannerGreen=green;const origin=shotPlannerOrigin(green),aim=shotPlannerAim(green),remainingPoints=remainingRoutePoints(origin,aim,green),icon=L.divIcon({className:'shot-planner-marker',html:'<span>◎</span>',iconSize:[42,42],iconAnchor:[21,21]}),hitLabel=L.divIcon({className:'planner-line-label-marker hit-label',html:'<span><b id="plannerLineTargetYards">—</b> yd<small>to hit</small><em id="plannerLineTargetClub">—</em></span>',iconSize:[1,1],iconAnchor:[0,0]}),goLabel=L.divIcon({className:'planner-line-label-marker go-label',html:'<span id="plannerLineRemainingLabel"><b id="plannerLineRemainingYards">—</b> yd<small>to go</small><em id="plannerLineRemainingClub">—</em></span>',iconSize:[1,1],iconAnchor:[0,0]});
  inlinePlannerLines=[L.polyline([origin,aim],{color:'#f5cf68',weight:2.25,opacity:1}).addTo(inlineHoleMap),L.polyline(remainingPoints,{color:'#f5dfa8',weight:2.25,opacity:.95,dashArray:'7 9'}).addTo(inlineHoleMap)];
  inlinePlannerMarker=L.marker(aim,{icon,interactive:true,keyboard:false,zIndexOffset:1200}).addTo(inlineHoleMap);inlinePlannerLabels=[L.marker(pointBetween(origin,aim,.5),{icon:hitLabel,interactive:false,keyboard:false,zIndexOffset:1100}).addTo(inlineHoleMap),L.marker(pointBetween(remainingPoints[0],remainingPoints[1]||remainingPoints[0],.5),{icon:goLabel,interactive:false,keyboard:false,zIndexOffset:1100}).addTo(inlineHoleMap)];updateShotPlanner(green);
  enableForwardMapDragging();setTimeout(()=>inlineHoleMap?.on('zoomend moveend',showMapRecenterButton),220);
}
function drawGoogleLiveHole(green){
    const rawMap=inlineHoleMap.raw;inlineHoleGreen=green;clearInlineGoogleOverlays();
    googleCircleMarker(rawMap,selectedTee(green),'#d8a93e',9,teeSetLabel());
    for(const [index,aimPoint] of[green.aim1,green.aim2].filter(Boolean).entries())googleCircleMarker(rawMap,aimPoint,'#e0bd66',8,`Aim ${index+1}`);
    googleCircleMarker(rawMap,green.center,'#176b45',10,'Green center');
    shotPlannerGreen=green;const origin=shotPlannerOrigin(green),aim=shotPlannerAim(green),remainingPoints=remainingRoutePoints(origin,aim,green);
    const hitLine=rememberGoogleOverlay(new google.maps.Polyline({map:rawMap,path:[googlePoint(origin),googlePoint(aim)],strokeColor:'#f5cf68',strokeWeight:2.25,strokeOpacity:1,zIndex:800}));
    const goLine=rememberGoogleOverlay(new google.maps.Polyline({map:rawMap,path:remainingPoints.map(googlePoint),strokeColor:'#f5dfa8',strokeWeight:2.25,strokeOpacity:0,zIndex:800,icons:[{icon:{path:'M 0,-1 0,1',strokeColor:'#f5dfa8',strokeOpacity:.95,strokeWeight:2.25,scale:2.2},offset:'0',repeat:'14px'}]}));
    inlinePlannerLines=[googlePolylineFacade(hitLine),googlePolylineFacade(goLine)];
    const planner=rememberGoogleOverlay(new google.maps.Marker({map:rawMap,position:googlePoint(aim),draggable:true,keyboardShortcuts:false,zIndex:1200,icon:googlePlannerIcon(),title:'Drag to plan your shot'}));
    inlinePlannerMarker=googleMarkerFacade(planner);
    const hitLabel=rememberGoogleOverlay(googlePlannerLabelMarker(rawMap,pointBetween(origin,aim,.5),'hit'));
    const goLabel=rememberGoogleOverlay(googlePlannerLabelMarker(rawMap,pointBetween(remainingPoints[0],remainingPoints[1]||remainingPoints[0],.5),'go'));
    inlinePlannerLabels=[hitLabel,goLabel];
    planner.addListener('drag',()=>{const point=planner.getPosition();if(!point)return;shotPlannerAims[shotPlannerKey()]={lat:point.lat(),lng:point.lng()};updateShotPlanner(green)});
    planner.addListener('dragend',()=>{inlineUserMovedMap=true;$('mapRecenterButton')?.classList.remove('hidden')});
    fitLiveHoleView(green);updateShotPlanner(green);
}
async function initInlineHoleMap(green){
  const container=$('liveHoleMap'),key=shotPlannerKey();if(!container||!selectedTee(green)||!green?.center)return;
  try{
    await loadGoogleMaps();if($('liveHoleMap')!==container||shotPlannerKey()!==key)return;
    document.querySelector('.live-map-viewport')?.classList.add('google-map-active');
    const rawMap=new google.maps.Map(container,{center:googlePoint(green.center),zoom:17,mapId:GOOGLE_MAP_ID,mapTypeId:liveMapStyle==='satellite'?'satellite':'roadmap',disableDefaultUI:true,clickableIcons:false,gestureHandling:'greedy',keyboardShortcuts:false,headingInteractionEnabled:true,tiltInteractionEnabled:true,backgroundColor:'#173c2b'});
    inlineHoleMap=googleMapFacade(rawMap,container);const label=document.querySelector('.forward-label');if(label)label.textContent='GOOGLE MAPS · FAIRWAY ROUTE · FORWARD';drawGoogleLiveHole(green);
    setTimeout(()=>{if(inlineHoleMap?.raw!==rawMap)return;rawMap.addListener('dragstart',showMapRecenterButton);rawMap.addListener('zoom_changed',showMapRecenterButton);rawMap.addListener('heading_changed',showMapRecenterButton);rawMap.addListener('tilt_changed',showMapRecenterButton)},650);
  }catch(error){
    console.warn('Google Maps unavailable; using the existing map fallback.',error);if($('liveHoleMap')!==container)return;document.querySelector('.live-map-viewport')?.classList.remove('google-map-active');initInlineHoleMapLeaflet(green);
  }
}
function updateInlineGolferPosition(here,green){
  if(!inlineHoleMap||!here||!green?.center||distanceYards(here,green.center)>3000)return;
  if(inlineGolferMarker){inlineGolferMarker.setLatLng(here);return}
  if(inlineHoleMap.provider==='google'){
    const marker=googleCircleMarker(inlineHoleMap.raw,here,'#2476d1',9,'Your location');inlineGolferMarker=googleMarkerFacade(marker);return;
  }
  inlineGolferMarker=L.circleMarker(here,{radius:9,color:'#fff',weight:3,fillColor:'#2476d1',fillOpacity:1}).addTo(inlineHoleMap);
}
function startLocation(green){
  if(!navigator.geolocation){$('gpsStatus').textContent='GPS is not supported by this browser.';return}
  locationWatch=navigator.geolocation.watchPosition(pos=>{
    const accuracyYards=Math.round(pos.coords.accuracy*1.094),status=$('gpsStatus');lastGpsAccuracyYards=accuracyYards;status.textContent=`Accuracy ±${accuracyYards} yd`;status.classList.toggle('gps-warning',accuracyYards>50);
    const here={lat:pos.coords.latitude,lng:pos.coords.longitude};lastKnownPosition=here;const near=golferIsNearHole(green),segment=activeRouteSegment(near?here:null,green);if(!segment)return;
    updateShotPlanner(green);
    const tee=selectedTee(green);updateInlineGolferPosition(here,green);orientInlineHoleMap(green,segment.origin,segment.target);loadWeather(near?here:tee,segment.target,tee);
  },err=>{if($('gpsStatus'))$('gpsStatus').textContent=err.code===1?'Location permission was denied. Allow it in browser settings.':'Unable to get a GPS signal.'},{enableHighAccuracy:true,maximumAge:3000,timeout:15000});
}
function stopLocation(){if(locationWatch!==null){navigator.geolocation.clearWatch(locationWatch);locationWatch=null}}
function refreshLocation(){const g=selectedRoundCourse()?.greens?.[s.hole-1];stopLocation();if(g)startLocation(g)}
function distanceYards(a,b){const R=6371000,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng),q=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))*1.0936133}
function draftPoint(value){return value?{lat:Number(value[0]),lng:Number(value[1])}:null}
function pointToward(start,end,yards){const distance=distanceYards(start,end),ratio=distance?yards/distance:0;return{lat:start.lat+(end.lat-start.lat)*ratio,lng:start.lng+(end.lng-start.lng)*ratio}}
function buildEagleGlenDraft(){
  return EAGLE_GLEN_DRAFT_POINTS.map((row,index)=>{
    const black=draftPoint(row[0]),aim1=draftPoint(row[1]),aim2=draftPoint(row[2]),center=draftPoint(row[3]),firstTarget=aim1||aim2||center,approach=aim2||aim1||black,blackYards=EAGLE_GLEN_TEE_YARDS.black[index];
    const tees={};for(const color of ['black','blue','white','red'])tees[color]=color==='black'?black:pointToward(black,firstTarget,Math.max(0,blackYards-EAGLE_GLEN_TEE_YARDS[color][index]));
    const front=pointToward(center,approach,12),back=pointToward(center,approach,-12);
    return{tee:black,tees,aim1,aim2,front,center,back,_review:'candidate'};
  });
}
function buildExistingCourseReviewDraft(course,config){
  return(course.greens||[]).map(green=>{
    const reference=green.tee||green.tees?.black||green.tees?.blue,firstTarget=green.aim1||green.aim2||green.center;if(!reference||!firstTarget)return{...green,_review:'candidate'};
    const tees={};for(const color of ['black','blue','white','red'])tees[color]=pointToward(reference,firstTarget,Number(config[color]??0));
    return{...green,tee:tees.black,tees,_review:'candidate'};
  });
}
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
  const summary=$('weatherSummary'),effect=$('windEffect'),temperature=$('currentTemperature'),mapTemperature=$('mapTemperature'),icon=$('currentWeatherIcon'),mapIcon=$('mapWeatherIcon'),condition=$('currentWeatherLabel');
  if(!weather){if(summary)summary.textContent='Weather temporarily unavailable';if(effect)effect.textContent='GPS yardages still work normally';if(temperature)temperature.textContent='—°';if(mapTemperature)mapTemperature.textContent='—°';if(icon)icon.textContent='◌';if(mapIcon)mapIcon.textContent='◌';if(condition)condition.textContent='Weather unavailable';updateMapWind(null,tee||here,target);return}
  const degrees=`${Math.round(weather.temperature_2m)}°`,weatherIcon=weatherConditionIcon(weather.weather_code);if(temperature)temperature.textContent=degrees;if(mapTemperature)mapTemperature.textContent=degrees;if(icon)icon.textContent=weatherIcon;if(mapIcon)mapIcon.textContent=weatherIcon;if(condition)condition.textContent=weatherDescription(weather.weather_code);
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
async function changeScore(encoded,d){const p=s.sharedRoundId?await ensureMyRoundPlayerName():decodeURIComponent(encoded);if(!p)return;s.scores[p]??={};const previous=s.scores[p][s.hole]??Number(s.pars[s.hole-1])??0;const nextScore=Math.max(1,previous+d);s.scores[p][s.hole]=nextScore;if(s.sharedRoundId){const item={round_id:s.sharedRoundId,user_id:currentUser.id,hole:s.hole,strokes:nextScore,updated_at:new Date().toISOString()};pendingScores[pendingScoreKey(item)]=item;persistPendingScores()}save();if(s.v==='round'&&inlineHoleMap?.provider==='google')refreshScoreEntry();else render();if(s.sharedRoundId){const synced=await syncPendingScores();if(!synced&&navigator.onLine)alert('Your score is protected on this phone but has not synchronized yet. The app will keep retrying.')}}
function updateGoogleRoundHole(){
  if(s.v!=='round'||inlineHoleMap?.provider!=='google')return false;
  const course=selectedRoundCourse(),green=course?.greens?.[s.hole-1],par=Number(s.pars[s.hole-1])||4;if(!selectedTee(green)||!green?.center)return false;
  stopLocation();const yards=mappedHoleDistance(green);$('roundMapHole').textContent=s.hole;$('roundMapDistance').textContent=yards;$('roundMapPar').textContent=par;$('liveHoleMap')?.setAttribute('aria-label',`Forward-facing course view of Hole ${s.hole}`);
  const previous=document.querySelector('.hole-edge-arrow.previous');if(previous)previous.disabled=s.hole===1;
  const name=myRoundPlayerName(),holeScore=scoreValue(name)||par,roundTotal=total(name,s.hole);if($('roundHoleScore'))$('roundHoleScore').textContent=holeScore;if($('roundScoreTotal'))$('roundScoreTotal').textContent=`Tap · Total ${roundTotal}`;
  inlineHoleMap.raw.setMapTypeId(liveMapStyle==='satellite'?'satellite':'roadmap');drawGoogleLiveHole(green);const segment=activeRouteSegment(null,green);if(segment)loadWeather(segment.origin,segment.target,segment.origin);startLocation(green);save();return true;
}
function showRoundHole(){if(!updateGoogleRoundHole())render()}
function prev(){if(s.hole>1){s.hole--;showRoundHole()}}
function next(){if(s.hole<s.holes){s.hole++;showRoundHole()}else{if(!s.sharedRoundId)s.done=true;s.v='recap';render()}}
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
  if(!await requireGolferSignInToJoin())return;
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
  let result=await db.from('round_messages').select('id,user_id,message,media_path,media_type,media_name,created_at').eq('round_id',s.sharedRoundId).order('created_at').limit(200);
  if(result.error&&/media_(path|type|name)/i.test(result.error.message||'')){
    chatMediaReady=false;
    result=await db.from('round_messages').select('id,user_id,message,created_at').eq('round_id',s.sharedRoundId).order('created_at').limit(200);
  }else chatMediaReady=!result.error;
  if(result.error){if(showError)alert('Round chat could not be loaded. Make sure the Supabase chat upgrade has been installed.');return false}
  chatMessages=result.data||[];
  const paths=[...new Set(chatMessages.map(item=>item.media_path).filter(Boolean))];
  if(paths.length){
    const signed=await db.storage.from('round-chat-media').createSignedUrls(paths,3600);
    if(!signed.error){const urls=new Map((signed.data||[]).map(item=>[item.path,item.signedUrl]));chatMessages=chatMessages.map(item=>({...item,media_url:urls.get(item.media_path)||''}))}
  }
  return true;
}
function chatPhotoMarkup(item){
  if(!item.media_path)return'';
  if(!item.media_url)return'<div class="chat-photo-unavailable">Photo unavailable</div>';
  return`<button class="chat-photo-button" onclick="openChatPhoto('${esc(item.id)}')" aria-label="Open shared photo"><img src="${esc(item.media_url)}" alt="Photo shared in the round chat" loading="lazy"></button>`;
}
function chatView(){
  const nameFor=userId=>{const saved=sharedPlayers.find(player=>player.user_id===userId)?.display_name;if(userId===currentUser?.id&&isGenericGolferName(saved))return signedInGolferFirstName()||saved||'Golfer';return saved||'Golfer'};
  app.classList.add('chat-page');
  app.innerHTML=`<div class="row"><button class="back" onclick="s.v='round';render()">← Round</button><button class="back" onclick="loadRoundMessages().then(()=>render())">Refresh</button></div><h1>Round Chat</h1><p class="muted">Only golfers in this round can see these messages and photos.</p><div class="chat-message-stage"><div class="chat-watermark" aria-hidden="true"><img src="agape-golf-logo.png" alt=""></div><section id="chatMessages" class="chat-messages">${chatMessages.length?chatMessages.map(item=>`<article class="chat-bubble ${item.user_id===currentUser.id?'mine':''}"><b>${esc(nameFor(item.user_id))}</b>${chatPhotoMarkup(item)}${item.message?`<p>${esc(item.message)}</p>`:''}<small>${new Date(item.created_at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</small></article>`).join(''):'<div class="empty">No messages yet. Say hello to the group!</div>'}</section></div><form class="chat-compose" onsubmit="event.preventDefault();sendRoundMessage()"><label id="chatMediaButton" class="chat-media-button" aria-label="Take or choose a photo" title="Take or choose a photo">📷<input id="chatPhotoInput" type="file" accept="image/*" onchange="uploadChatPhoto(this.files[0]);this.value=''" ${chatMediaReady?'':'disabled'}></label><input id="chatInput" maxlength="500" autocomplete="off" placeholder="Message everyone" aria-label="Chat message"><button type="submit">Send</button></form>`;
  setTimeout(()=>{const box=$('chatMessages');if(box)box.scrollTop=box.scrollHeight},0);
}
async function sendRoundMessage(){
  const input=$('chatInput'),message=input?.value.trim();if(!message)return;
  input.disabled=true;
  const {error}=await db.from('round_messages').insert({round_id:s.sharedRoundId,user_id:currentUser.id,message});
  if(error){input.disabled=false;alert('Message could not be sent: '+error.message);return}
  input.value='';await loadRoundMessages(false);render();
}
async function resizeChatPhoto(file){
  if(!file?.type.startsWith('image/'))throw new Error('Choose a photo from your camera or photo library.');
  if(file.size>20*1024*1024)throw new Error('Choose a photo smaller than 20 MB.');
  const source=await new Promise((resolve,reject)=>{const image=new Image(),url=URL.createObjectURL(file);image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('This photo format could not be opened. Try JPEG or PNG.'))};image.src=url});
  const maxSide=1600,scale=Math.min(1,maxSide/Math.max(source.naturalWidth,source.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(source.naturalWidth*scale));canvas.height=Math.max(1,Math.round(source.naturalHeight*scale));canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('The photo could not be prepared.')),'image/jpeg',.78));
  if(blob.size>3*1024*1024)throw new Error('This photo is still too large after compression. Choose a smaller image.');
  return blob;
}
async function uploadChatPhoto(file){
  if(!file)return;
  if(!chatMediaReady){alert('Install the Chat Photos SQL update in Supabase first.');return}
  const button=$('chatMediaButton'),input=$('chatInput'),caption=input?.value.trim()||null;if(button){button.classList.add('uploading');button.setAttribute('aria-label','Uploading photo')}
  let path='';
  try{
    const blob=await resizeChatPhoto(file),id=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;path=`${s.sharedRoundId}/${currentUser.id}/${id}.jpg`;
    const upload=await db.storage.from('round-chat-media').upload(path,blob,{contentType:'image/jpeg',cacheControl:'86400',upsert:false});if(upload.error)throw upload.error;
    const saved=await db.from('round_messages').insert({round_id:s.sharedRoundId,user_id:currentUser.id,message:caption,media_path:path,media_type:'image/jpeg',media_name:'round-photo.jpg'});
    if(saved.error){await db.storage.from('round-chat-media').remove([path]);throw saved.error}
    if(input)input.value='';await loadRoundMessages(false);render();
  }catch(error){if(path)await db.storage.from('round-chat-media').remove([path]);alert('Photo could not be shared: '+(error.message||'Unknown error'));if(button){button.classList.remove('uploading');button.setAttribute('aria-label','Take or choose a photo')}}
}
function openChatPhoto(messageId){
  const item=chatMessages.find(message=>message.id===messageId);if(!item?.media_url)return;
  const overlay=document.createElement('div');overlay.className='chat-photo-viewer';overlay.innerHTML=`<div class="chat-photo-viewer-card"><button class="chat-photo-close" aria-label="Close photo">×</button><img src="${esc(item.media_url)}" alt="Shared round photo"><a href="${esc(item.media_url)}" target="_blank" rel="noopener" download="${esc(item.media_name||'round-photo.jpg')}">↓ Save or Download Photo</a><small>On iPhone, use Share → Save Image if it opens in a new window.</small></div>`;overlay.onclick=event=>{if(event.target===overlay||event.target.closest('.chat-photo-close'))overlay.remove()};document.body.appendChild(overlay);
}
async function deleteRoundChatMedia(roundId){
  const result=await db.from('round_messages').select('media_path').eq('round_id',roundId).not('media_path','is',null);
  if(result.error&&/media_path/i.test(result.error.message||''))return true;
  if(result.error){alert('The round photos could not be checked, so nothing was deleted. Try again.');return false}
  const paths=[...new Set((result.data||[]).map(item=>item.media_path).filter(Boolean))];
  for(let i=0;i<paths.length;i+=1000){const removed=await db.storage.from('round-chat-media').remove(paths.slice(i,i+1000));if(removed.error){alert('The round photos could not be removed, so the round was kept to prevent orphaned files. Try again.');return false}}
  return true;
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
function courseFavoritesKey(){return`atgCourseFavorites:${currentUser?.id||'guest'}`}
function favoriteCourseIds(){try{return new Set(JSON.parse(localStorage.getItem(courseFavoritesKey())||'[]'))}catch{return new Set()}}
function recentCourseIds(){try{return JSON.parse(localStorage.getItem(`atgRecentCourses:${currentUser?.id||'guest'}`)||'[]')}catch{return[]}}
function rememberRecentCourse(id){const recent=[id,...recentCourseIds().filter(item=>item!==id)].slice(0,20);localStorage.setItem(`atgRecentCourses:${currentUser?.id||'guest'}`,JSON.stringify(recent))}
function toggleCourseFavorite(id,event){event?.stopPropagation();const favorites=favoriteCourseIds();favorites.has(id)?favorites.delete(id):favorites.add(id);localStorage.setItem(courseFavoritesKey(),JSON.stringify([...favorites]));refreshCourseLibrary()}
function courseDistanceMiles(course){const point=coursePreviewPoint(course)||course.catalog_point;return point&&courseLibraryLocation?distanceYards(courseLibraryLocation,point)/1760:null}
function courseDifficulty(course){const distances=(course.greens||[]).map(mappedHoleDistance).filter(Number.isFinite);if(distances.length<Math.max(3,Math.ceil(course.holes*.5)))return'unknown';const average=distances.reduce((sum,value)=>sum+value,0)/distances.length;return average<310?'forward':average>390?'championship':'standard'}
function courseMatchesFilters(course){
  const filters=courseLibraryFilters,favorites=favoriteCourseIds(),recent=recentCourseIds(),distance=courseDistanceMiles(course),difficulty=courseDifficulty(course);
  if(filters.nearby&&(distance===null||distance>25))return false;
  if(filters.favorites&&!favorites.has(course.id))return false;
  if(filters.recent&&!recent.includes(course.id))return false;
  if(filters.holes&&course.holes!==filters.holes)return false;
  if(filters.mapped&&mappedCount(course)!==course.holes)return false;
  if(filters.par3&&(!(course.pars||[]).length||(course.pars||[]).some(par=>Number(par)!==3)))return false;
  if(filters.difficulty&&difficulty!==filters.difficulty)return false;
  return true;
}
function rankedSharedCourses(){
  const favorites=favoriteCourseIds(),recent=recentCourseIds();
  return courses.map((course,index)=>{const distance=courseDistanceMiles(course),recentIndex=recent.indexOf(course.id);let score=0;if(favorites.has(course.id))score+=100000;if(recentIndex>=0)score+=20000-recentIndex*100;if(distance!==null)score+=Math.max(0,10000-distance*100);score+=mappedCount(course)*8;return{course,index,distance,score}}).sort((a,b)=>b.score-a.score||a.course.name.localeCompare(b.course.name));
}
function activeCourseFilterCount(){return Object.entries(courseLibraryFilters).filter(([key,value])=>key==='holes'?Boolean(value):value===true||typeof value==='string').length}
function filterSharedCourses(value){courseLibraryQuery=String(value||'').trim().toLowerCase();refreshCourseLibrary()}
function refreshCourseLibrary(){
  const grid=$('courseLibraryGrid');if(!grid)return;
  for(const previewMap of coursePreviewMaps){try{previewMap.remove()}catch{}}coursePreviewMaps=[];
  const query=courseLibraryQuery,filtered=rankedSharedCourses().filter(item=>{const haystack=[item.course.name,item.course.city,item.course.state,item.course.postal_code,item.course.address].filter(Boolean).join(' ').toLowerCase();return(!query||haystack.includes(query))&&courseMatchesFilters(item.course)});
  const visible=query||activeCourseFilterCount()?filtered:filtered.slice(0,7);
  grid.innerHTML=visible.map(item=>courseLibraryCard(item.course,item.index,item.distance)).join('');
  const empty=$('courseLibraryEmpty');if(empty)empty.classList.toggle('hidden',visible.length>0);
  const heading=$('courseResultsHeading');if(heading)heading.textContent=query||activeCourseFilterCount()?`${visible.length} Course${visible.length===1?'':'s'} Found`:'Recommended for You';
  const count=$('courseFilterCount');if(count){count.textContent=activeCourseFilterCount()||'';count.classList.toggle('hidden',!activeCourseFilterCount())}
  setTimeout(initCoursePreviews,0);
}
function courseLibraryCard(course,index,distance=null){const point=coursePreviewPoint(course),image=course.courseImage||'',favorite=favoriteCourseIds().has(course.id),difficulty=courseDifficulty(course),mapped=mappedCount(course),status=mapped?`${mapped} MAPPED${mapped===course.holes?'':' · PARTIAL'}`:course.catalogOnly?'APPROVED · GPS MAPPING PENDING':'0 MAPPED',mapPreview=!image&&point;return`<article class="course-library-card"><div class="course-preview course-start-target" role="button" tabindex="0" onclick="startCourseFromLibrary(${index})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();startCourseFromLibrary(${index})}">${image?`<img src="${esc(image)}" alt="${esc(course.name)} course overview" loading="lazy">`:mapPreview?`<div id="coursePreview${index}" class="course-preview-map" data-lat="${point.lat}" data-lng="${point.lng}" aria-label="Satellite preview of ${esc(course.name)}"></div>`:''}<div class="course-preview-placeholder"><span>⛳</span><small>${mapPreview?'Loading satellite preview':`${esc(course.city||'Southern California')} · ${esc(course.postal_code||'')}`}</small></div><button class="course-favorite ${favorite?'on':''}" onclick="toggleCourseFavorite('${esc(course.id)}',event)" aria-label="${favorite?'Remove':'Add'} ${esc(course.name)} ${favorite?'from':'to'} favorites" aria-pressed="${favorite}">${favorite?'★':'☆'}</button>${mapPreview?'<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener" onclick="event.stopPropagation()">© MapTiler</a>':''}</div><div class="course-card-info"><div><small>${course.holes} HOLES · ${status}${distance===null?'':` · ${distance<10?distance.toFixed(1):Math.round(distance)} MI`}</small><button class="course-name-start" onclick="startCourseFromLibrary(${index})">${esc(course.name)}</button><span>${course.course_type?`${esc(course.course_type)} · `:''}${difficulty==='unknown'?`Par ${course.par_total||'pending'}`:difficulty==='forward'?'Forward friendly':difficulty==='championship'?'Championship length':'Standard length'} · Tap to play</span></div>${adminRole?(course.catalogOnly?`<button onclick="mapCatalogCourse(${index})">Map</button>`:`<button onclick="editCourse(${index})">Edit</button>`):'<i>›</i>'}</div></article>`}
function setCourseFilter(name,value){courseLibraryFilters[name]=courseLibraryFilters[name]===value?(name==='holes'||name==='difficulty'?null:false):value;renderCourseFilterSheet();refreshCourseLibrary()}
function clearCourseFilters(){courseLibraryFilters={nearby:false,favorites:false,recent:false,holes:null,mapped:false,par3:false,difficulty:null};renderCourseFilterSheet();refreshCourseLibrary()}
function closeCourseFilters(){document.querySelector('.course-filter-overlay')?.remove()}
function filterChip(label,name,value=true){const on=courseLibraryFilters[name]===value;return`<button class="course-filter-chip ${on?'on':''}" onclick="setCourseFilter('${name}',${typeof value==='string'?`'${value}'`:value})" aria-pressed="${on}">${label}</button>`}
function renderCourseFilterSheet(){
  const sheet=document.querySelector('.course-filter-sheet');if(!sheet)return;
  sheet.innerHTML=`<header><button onclick="closeCourseFilters()">Cancel</button><b>Filter Courses</b><span></span></header><div class="course-filter-body"><h3>Show First</h3><div class="course-filter-chips three">${filterChip('Near Me','nearby')}${filterChip('Favorites','favorites')}${filterChip('Recently Played','recent')}</div><h3>Course Format</h3><div class="course-filter-chips">${filterChip('9 Holes','holes',9)}${filterChip('18 Holes','holes',18)}${filterChip('Fully Mapped','mapped')}${filterChip('Par 3','par3')}</div><h3>Level of Difficulty</h3><div class="course-filter-chips three">${filterChip('Forward Friendly','difficulty','forward')}${filterChip('Standard','difficulty','standard')}${filterChip('Championship','difficulty','championship')}</div><section class="catalog-filters-pending"><h3>Additional Catalog Filters</h3><p>Public, private, resort, tournaments, leagues, ratings and course condition will appear after verified catalog data is added. They are not estimated.</p></section></div><footer><button onclick="clearCourseFilters()">Clear All</button><button onclick="closeCourseFilters()">Show Results</button></footer>`;
}
function showCourseFilters(){const overlay=document.createElement('div');overlay.className='course-filter-overlay';overlay.onclick=event=>{if(event.target===overlay)closeCourseFilters()};overlay.innerHTML='<section class="course-filter-sheet" role="dialog" aria-modal="true" aria-label="Filter courses"></section>';document.body.appendChild(overlay);renderCourseFilterSheet()}
function requestCourseLibraryLocation(){if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(position=>{courseLibraryLocation={lat:position.coords.latitude,lng:position.coords.longitude};refreshCourseLibrary()},()=>{}, {enableHighAccuracy:false,timeout:7000,maximumAge:300000})}
async function startCourseFromLibrary(index){const course=courses[index];if(!course)return;const mapped=mappedCount(course);if(!confirm(`Would you like to start a new game at ${course.name}?${course.catalogOnly&&!mapped?'\n\nThis course is approved for scorecard play while GPS mapping continues.':''}`))return;rememberRecentCourse(course.id);await start();if(s.v!=='setup')return;if(!course.catalogOnly){chooseCourse(course.id);return}s.courseId=null;s.catalogCourseId=course.id;s.course=course.name;s.holes=course.holes;s.pars=course.pars?.length===course.holes?[...course.pars]:Array(course.holes).fill(4);s.teeSet='black';s.teeDistanceMeters=course.tee_meters||null;s.v='pars';s.resumeView='pars';save();if(!mapped)alert(`${course.name} is ready for scorecard play. Live GPS guidance will appear as its holes are mapped.`);render()}
function initCoursePreviews(){
  const previews=[...document.querySelectorAll('.course-preview-map')];if(!previews.length||!window.L)return;
  const initialize=node=>{if(node.dataset.ready)return;node.dataset.ready='1';const previewMap=L.map(node,{zoomControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,touchZoom:false,attributionControl:false}).setView([Number(node.dataset.lat),Number(node.dataset.lng)],15);if(MAPTILER_API_KEY)addSatelliteLayer(previewMap);else addStreetLayer(previewMap);coursePreviewMaps.push(previewMap)};
  if(!('IntersectionObserver'in window)){previews.forEach(initialize);return}
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){initialize(entry.target);observer.unobserve(entry.target)}},{rootMargin:'180px'});previews.forEach(node=>observer.observe(node));
}
function coursesView(){const backView=coursesReturnView==='accountView'?'accountView':'home';app.innerHTML=`<button class="back" onclick="s.v='${backView}';render()">← ${backView==='accountView'?'Account':'Home'}</button><h1>${adminRole==='super_admin'?'Courses / Players':'Shared Courses'}</h1><p class="muted">Seven recommended courses are shown first. Search reveals the complete approved library.</p>${directoryTabs('courses')}${cloudError?`<div class="error-notice">${esc(cloudError)}</div>`:''}${courses.length?`<div class="course-discovery-tools"><label class="course-library-search"><span>⌕</span><input type="search" placeholder="Search courses" aria-label="Search shared courses" value="${esc(courseLibraryQuery)}" oninput="filterSharedCourses(this.value)"><button onclick="showCourseFilters()" aria-label="Filter courses"><i></i><b id="courseFilterCount" class="hidden"></b></button></label><button class="course-favorites-shortcut ${courseLibraryFilters.favorites?'on':''}" onclick="setCourseFilter('favorites',true)" aria-label="Show favorite courses">${courseLibraryFilters.favorites?'★':'☆'}</button></div><div class="course-results-heading"><b id="courseResultsHeading">Recommended for You</b><span>Maximum 7 until you search or filter</span></div><div id="courseLibraryEmpty" class="empty hidden">No courses match that search and filter combination.</div><section id="courseLibraryGrid" class="course-library-grid"></section>`:'<div class="empty">No shared courses have been mapped yet.</div>'}${adminRole?'<button class="primary" onclick="newCourse()">Map a New Course</button>':currentUser?'<div class="notice">Your account does not have course-manager permission.</div>':'<button class="secondary" onclick="signInAdmin()">Admin sign in</button>'}`;if(courses.length){refreshCourseLibrary();requestCourseLibraryLocation()}}
function mappedCount(c){return(c?.greens||[]).filter(g=>(g.tee||g.tees?.black)&&g.front&&g.center&&g.back).length}
function newCourse(){if(!adminRole){alert('Administrator sign-in required.');return}const name=prompt('Course name:');if(!name?.trim())return;const holes=confirm('Does this course have 18 holes?\nChoose Cancel for 9 holes.')?18:9;draft={id:crypto.randomUUID(),isNew:true,name:name.trim(),holes,pars:Array(holes).fill(4),greens:Array.from({length:holes},()=>({tee:null,aim1:null,aim2:null,front:null,center:null,back:null})),mapHole:1,target:'center'};s.v='mapCourse';render()}
function mapCatalogCourse(i){if(!adminRole){alert('Administrator sign-in required.');return}const course=courses[i];if(!course?.catalogOnly)return;draft={id:crypto.randomUUID(),isNew:true,name:course.name,holes:course.holes,pars:course.pars?.length===course.holes?[...course.pars]:Array(course.holes).fill(4),greens:Array.from({length:course.holes},()=>({tee:null,aim1:null,aim2:null,front:null,center:null,back:null,_review:'candidate'})),mapHole:1,target:'tee',mapStyle:'satellite',mapView:course.catalog_point?{...course.catalog_point,zoom:17}:null,catalogSourceId:course.id};s.v='mapCourse';render()}
function editCourse(i){if(!adminRole){alert('Administrator sign-in required.');return}draft=JSON.parse(JSON.stringify(courses[i]));draft.isNew=false;draft.mapHole=1;draft.target='center';if(draft.id===EAGLE_GLEN_COURSE_ID&&!draft.greens?.every(g=>g?.tees?.black)){draft.pars=[...EAGLE_GLEN_PARS];draft.greens=buildEagleGlenDraft();draft.intelligentDraft=true;draft.reviewedHoles=Array(18).fill(false);draft.mapStyle='satellite'}else if(REVIEW_TEE_OFFSETS[draft.id]&&!draft.greens?.every(g=>g?.tees?.black)){draft.greens=buildExistingCourseReviewDraft(draft,REVIEW_TEE_OFFSETS[draft.id]);draft.intelligentDraft=true;draft.reviewedHoles=Array(draft.holes).fill(false);draft.mapStyle='satellite'}s.v='mapCourse';render()}
function markerName(key){return({tee:'Reference Tee',tee_black:'Black Tee',tee_blue:'Blue Tee',tee_white:'White Tee',tee_red:'Red Tee',aim1:'Aim 1',aim2:'Aim 2',front:'Front',center:'Center',back:'Back'})[key]||key}
function markerPoint(green,key){return key.startsWith('tee_')?green.tees?.[key.slice(4)]||null:green[key]||null}
function setMarkerPoint(green,key,point){if(key.startsWith('tee_')){green.tees??={};green.tees[key.slice(4)]=point;if(key==='tee_black')green.tee=point}else green[key]=point}
function markerButtons(keys,green){return keys.map(key=>{const point=markerPoint(green,key);return`<button class="marker-tab ${draft.target===key?'on':''} ${point?'set':''}" onclick="draft.target='${key}';render()">${markerName(key)} ${point?'✓':''}</button>`}).join('')}
function mapEditorMarkerEntries(green){const keys=green.tees?['aim1','aim2','front','center','back']:['tee','aim1','aim2','front','center','back'],entries=keys.map(key=>[key,green[key]]);for(const color of ['black','blue','white','red'])if(green.tees?.[color])entries.push([`tee_${color}`,green.tees[color]]);return entries.filter(([,point])=>point)}
function mapCourse(){
  if(!adminRole){s.v='coursesView';render();return}
  const h=draft.mapHole,g=draft.greens[h-1],satelliteReady=Boolean(GOOGLE_MAPS_API_KEY),reviewed=(draft.reviewedHoles||[]).filter(Boolean).length;
  g.aim1??=null;g.aim2??=null;draft.mapStyle=draft.mapStyle||'street';
  const teeSets=g.tees?`<section><small>TEE-SET CANDIDATES</small><div class="marker-tabs four-tabs tee-set-tabs">${markerButtons(['tee_black','tee_blue','tee_white','tee_red'],g)}</div></section>`:'',routeKeys=g.tees?['aim1','aim2']:['tee','aim1','aim2'];
  const reviewPanel=draft.intelligentDraft?`<section class="mapping-review-panel"><b>PROVISIONAL INTELLIGENT MAPPING</b><span>${reviewed} of ${draft.holes} holes visually reviewed · review is optional before play</span><button class="secondary" onclick="reviewDraftHole()">${draft.reviewedHoles?.[h-1]?'Hole Reviewed ✓':h<draft.holes?'Review Hole & Continue →':'Mark Hole Reviewed ✓'}</button><button class="primary" onclick="approveIntelligentCourseMapping()">Approve for Play & Publish</button></section>`:'';
  app.innerHTML=`<button class="back" onclick="cancelMapping()">← Courses</button><h1>${esc(draft.name)}</h1>${draft.intelligentDraft?'<div class="notice mapping-draft-notice"><b>Review draft mapping:</b> Tee and pin coordinates come from published course-map data. Colored tee positions and green edges are intelligent estimates and must be visually confirmed.</div>':''}<div class="row map-toolbar"><button class="back" onclick="mapPrev()">←</button><b>Hole ${h} of ${draft.holes}</b><button class="back" onclick="mapNext()">→</button></div><div class="row"><span>Par</span><div class="stepper"><button onclick="draft.pars[${h-1}]=Math.max(3,draft.pars[${h-1}]-1);render()">−</button><span>${draft.pars[h-1]}</span><button onclick="draft.pars[${h-1}]=Math.min(6,draft.pars[${h-1}]+1);render()">+</button></div></div><p class="muted small">Select any marker below, then tap the satellite map to correct its position. Aim points are optional and should follow the normal playing route.</p><div class="marker-groups">${teeSets}<section><small>FAIRWAY ROUTE · AIM POINTS OPTIONAL</small><div class="marker-tabs three-tabs">${markerButtons(routeKeys,g)}</div></section><section><small>GREEN</small><div class="marker-tabs three-tabs">${markerButtons(['front','center','back'],g)}</div></section></div><form class="course-search" onsubmit="event.preventDefault();searchCourseAddress()"><label for="courseSearch">Find course by name or address</label><div class="search-row"><input id="courseSearch" autocomplete="street-address" placeholder="Sierra Lakes Golf Club or street address"><button id="courseSearchButton" type="submit">Search</button></div></form><div id="courseSearchResults" class="search-results"></div><div class="search-divider"><span>or</span></div><button class="secondary locate-map" onclick="centerOnMe()">Use My Location to Find Course</button><div class="map-layer-toggle"><button class="${draft.mapStyle==='street'?'on':''}" onclick="setMapStyle('street')">Street</button><button class="${draft.mapStyle==='satellite'?'on':''}" onclick="setMapStyle('satellite')" ${satelliteReady?'':'disabled'}>Satellite</button></div>${satelliteReady?'':'<div class="satellite-key-note">Google satellite mapping is not configured.</div>'}<div id="courseMap" aria-label="Course mapping map"></div><div id="mapMessage" class="notice">Tap the map to set ${markerName(draft.target)} for Hole ${h}.</div><div class="marker-clear-actions"><button class="secondary" onclick="clearMarker()">Clear ${markerName(draft.target)}</button><button class="secondary clear-all-markers" onclick="clearAllMarkers()">Clear All Markers · Hole ${h}</button></div>${reviewPanel}${draft.intelligentDraft?'':'<button id="saveCourseButton" class="primary" onclick="saveMappedCourse()">Save Shared Course</button>'}`;
  setTimeout(initMap,0)
}
function setMapStyle(style){
  if(style==='satellite'&&!GOOGLE_MAPS_API_KEY){alert('Google satellite mapping is not configured.');return}draft.mapStyle=style;
  if(map?.provider==='google'){
    map.raw.setMapTypeId(style==='satellite'?'satellite':'roadmap');document.querySelectorAll('.map-layer-toggle button').forEach(button=>button.classList.toggle('on',button.textContent.trim().toLowerCase()===(style==='satellite'?'satellite':'street')));return;
  }
  render();
}
function addStreetLayer(targetMap){return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap'}).addTo(targetMap)}
function addSatelliteLayer(targetMap,onFallback){
  const layer=L.tileLayer(`https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}@2x.jpg?key=${encodeURIComponent(MAPTILER_API_KEY)}`,{tileSize:256,maxZoom:22,crossOrigin:true,attribution:'<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a>'});let failures=0,fellBack=false;
  layer.on('tileerror',()=>{if(fellBack||++failures<3)return;fellBack=true;targetMap.removeLayer(layer);addStreetLayer(targetMap);if(onFallback)onFallback()});return layer.addTo(targetMap);
}
function initMapLeaflet(){
  const g=draft.greens[draft.mapHole-1],existing=markerPoint(g,draft.target),any=g.center||g.aim1||g.aim2||g.tee||g.front||g.back,view=draft.mapView?[draft.mapView.lat,draft.mapView.lng]:(existing||any||[34.1,-117.3]),zoom=draft.mapView?.zoom??(existing||any?18:10);map=L.map('courseMap').setView(view,zoom);
  if(draft.mapStyle==='satellite'&&MAPTILER_API_KEY)addSatelliteLayer(map,()=>{const message=$('mapMessage');if(message)message.textContent='Satellite imagery is unavailable. Street mapping has been restored.'});
  else addStreetLayer(map);
  const colors={tee:'#d8a93e',tee_black:'#111',tee_blue:'#2571d9',tee_white:'#f5f5f5',tee_red:'#d93636',aim1:'#c68b2c',aim2:'#9b6c22',front:'#f4a340',center:'#176b45',back:'#174f9c'},route=holeRoute(g);if(route.length>1)L.polyline(route.map(point=>[point.lat,point.lng]),{color:'#d29f31',weight:4,opacity:.9,dashArray:'8 6'}).addTo(map);mapEditorMarkerEntries(g).forEach(([k,p])=>L.circleMarker(p,{radius:k.startsWith('tee_')?7:8,color:colors[k]||'#174f9c',fillOpacity:.92,weight:k==='tee_white'?3:2}).addTo(map).bindTooltip(markerName(k)));map.on('click',e=>{setMarkerPoint(draft.greens[draft.mapHole-1],draft.target,{lat:e.latlng.lat,lng:e.latlng.lng});render()});
}
async function initMap(){
  const container=$('courseMap');if(!container||!draft)return;
  try{
    await loadGoogleMaps();if($('courseMap')!==container||!draft)return;
    const g=draft.greens[draft.mapHole-1],existing=markerPoint(g,draft.target),any=g.center||g.aim1||g.aim2||g.tee||g.front||g.back,view=draft.mapView||existing||any||{lat:34.1,lng:-117.3},zoom=draft.mapView?.zoom??(existing||any?18:10);
    const rawMap=new google.maps.Map(container,{center:googlePoint(view),zoom,mapId:GOOGLE_MAP_ID,mapTypeId:draft.mapStyle==='satellite'?'satellite':'roadmap',mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'greedy',clickableIcons:false,headingInteractionEnabled:true,tiltInteractionEnabled:true});map=googleMapFacade(rawMap,container);
    const colors={tee:'#d8a93e',tee_black:'#111',tee_blue:'#2571d9',tee_white:'#f5f5f5',tee_red:'#d93636',aim1:'#c68b2c',aim2:'#9b6c22',front:'#f4a340',center:'#176b45',back:'#174f9c'},route=holeRoute(g);if(route.length>1)new google.maps.Polyline({map:rawMap,path:route.map(googlePoint),strokeColor:'#d29f31',strokeWeight:4,strokeOpacity:.9});
    for(const [key,point] of mapEditorMarkerEntries(g))new google.maps.Marker({map:rawMap,position:googlePoint(point),title:markerName(key),icon:{path:google.maps.SymbolPath.CIRCLE,scale:key.startsWith('tee_')?7:8,fillColor:colors[key]||'#174f9c',fillOpacity:.95,strokeColor:key==='tee_white'?'#222':'#fff',strokeWeight:2}});
    rawMap.addListener('click',event=>{const point=event.latLng;if(!point)return;setMarkerPoint(draft.greens[draft.mapHole-1],draft.target,{lat:point.lat(),lng:point.lng()});render()});
  }catch(error){console.warn('Google course map unavailable; using fallback.',error);if($('courseMap')===container)initMapLeaflet()}
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
function clearMarker(){setMarkerPoint(draft.greens[draft.mapHole-1],draft.target,null);render()}
function clearAllMarkers(){
  const hole=draft.mapHole,markers=draft.greens[hole-1];
  if(!markers.tee&&!markers.aim1&&!markers.aim2&&!markers.front&&!markers.center&&!markers.back){alert(`Hole ${hole} has no markers to clear.`);return}
  if(!confirm(`Clear every route and green marker for Hole ${hole}?`))return;
  draft.greens[hole-1]={tee:null,tees:null,aim1:null,aim2:null,front:null,center:null,back:null,_review:'candidate'};render();
}
function mapPrev(){if(draft.mapHole>1){draft.mapHole--;draft.skipMapViewSave=true;render()}}
function mapNext(){if(draft.mapHole<draft.holes){draft.mapHole++;draft.skipMapViewSave=true;render()}}
function reviewDraftHole(){if(!draft?.intelligentDraft)return;draft.reviewedHoles??=Array(draft.holes).fill(false);draft.reviewedHoles[draft.mapHole-1]=true;if(draft.mapHole<draft.holes){draft.mapHole++;draft.skipMapViewSave=true}render()}
async function approveIntelligentCourseMapping(){
  if(!draft?.intelligentDraft)return;
  const reviewed=(draft.reviewedHoles||[]).filter(Boolean).length;
  if(!confirm(`Approve ${draft.name} for play now?\n\n${reviewed} of ${draft.holes} holes have been visually reviewed. Unreviewed coordinates will remain marked provisional for the pre-round check.`))return;
  draft.greens.forEach((green,index)=>green._review=draft.reviewedHoles?.[index]?'approved':'provisional');draft.intelligentDraft=false;await saveMappedCourse();
}
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
window.addEventListener('online',async()=>{await Promise.all([syncPendingScores(),syncPendingHoleStats()]);await loadCourses();if(s.sharedRoundId)await loadSharedRound(false);render()});
window.addEventListener('offline',updateSyncIndicator);
if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
initializeCloud();
