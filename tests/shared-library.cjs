const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('shared-course-library-v145.js','utf8');
function setup(rows,initial=[],payload={}){
 const ctx={courses:initial,window:{},localStorage:{},console,setTimeout:()=>{},render(){},loadCourses:async()=>{ctx.courses=[]},supabase:{createClient:(url,key,opts)=>{assert.equal(opts.auth.persistSession,false);return{rpc:async(name,args)=>({data:name==='shared_course_catalog_page'?rows.slice(args.p_offset,args.p_offset+500):payload[args.p_course_id]})}}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);return ctx;
}
test('all pages, independent identities, location metadata, refresh retention',async()=>{
 const rows=Array.from({length:1251},(_,i)=>({shared_course_id:String(i),name:`Course ${i}`,city:'Jakarta',country_code:'ID',postal_code:'12345'}));
 rows[1].name=rows[0].name;rows[1].city='Bali';
 const c=setup(rows);assert.equal(await c.window.loadSharedCourseLibrary({retries:0}),true);assert.equal(c.courses.length,1251);assert.equal(c.courses[0].postal_code,'12345');
 await c.loadCourses();assert.equal(c.courses.length,1251);assert.equal(new Set(c.courses.map(c=>c.sharedCourseId)).size,1251);
});
test('ATG geometry survives hydration and invalid coordinates never activate GPS',async()=>{
 const rows=[{shared_course_id:'1',name:'Saved',mapping_status:'published'},{shared_course_id:'2',name:'Invalid',mapping_status:'published'}];
 const original={tee:{lat:33,lng:-117},center:{lat:33.001,lng:-117}};
 const p={'1':{holes:1,mapping_status:'published',greens:[{tee:{lat:34,lng:-118},center:{lat:34.001,lng:-118}}]},'2':{holes:1,mapping_status:'published',greens:[{tee:{lat:null,lng:null},center:{lat:100,lng:2}}]}};
 const c=setup(rows,[{id:'atg-uuid',name:'Saved',holes:1,greens:[original]}],p);await c.window.loadSharedCourseLibrary({retries:0});assert.equal(c.courses.find(c=>c.id==='atg-uuid').greens[0],original);assert.equal(c.courses.find(c=>c.sharedCourseId==='2').catalogOnly,true);
});
test('valid shared geometry enables play without private database writes',async()=>{
 const c=setup([{shared_course_id:'1',name:'Ready',mapping_status:'published'}],[],{'1':{holes:1,pars:[4],mapping_status:'published',greens:[{tee:{lat:33,lng:-117},center:{lat:33.001,lng:-117}}]}});await c.window.loadSharedCourseLibrary({retries:0});assert.equal(c.courses[0].catalogOnly,false);assert.equal(c.courses[0].greens.length,1);
});
