const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
const validation = script.slice(script.indexOf('function validId('), script.indexOf('const escapeHTML='));
const sync = script.slice(script.indexOf('async function syncDrive('), script.indexOf('\ninitDB().then('));
const base = { Set, Map, Blob, JSON, Error, Number, encodeURIComponent, clearTimeout, setTimeout, MAX_IMAGE:25*1024*1024, MAX_ITEMS:2000, MAX_MANIFEST:5*1024*1024 };
const v = vm.createContext({...base});
vm.runInContext(validation, v);
const record = {id:'valid-1',driveId:'drive-1',name:'test.png',type:'image/png',added:1,flagged:false,categories:[]};
const manifest = (items=[record], deleted=[]) => ({version:1,items,categories:[],deleted});
assert.equal(v.validateManifest(manifest()).items.length, 1);
for (const id of ['\" onmouseover=\"alert(1)', '<img src=x onerror=alert(1)>', '../escape']) {
  assert.throws(() => v.validateManifest(manifest([{...record,id}])), /Invalid backup image record/);
}
assert.throws(() => v.validateManifest(manifest([{...record,type:'image/svg+xml'}])), /Invalid backup image record/);
assert.throws(() => v.validateManifest({...manifest(),deleted:[{id:'bad\"id',driveId:null}]}), /Invalid backup deletion/);
assert.match(script, /data-id="\$\{escapeHTML\(x\.id\)\}"/);

async function scenario(remote, initial, listedFiles, failManifest=false) {
  let local=[...initial], removed=new Set(), written=[], uploaded=[], deleted=[], notices=[];
  const ctx=vm.createContext({...base,token:'test-token',busy:false,syncAgain:false,driveFolder:null,items:local,categories:[],removed,selected:new Set(),uploadingId:null,
    $:()=>({textContent:''}), closeDialog(){}, folder:async()=> 'folder-1', listFiles:async()=>listedFiles,
    api:async (url,opts={})=>{
      if(opts.method==='DELETE'){deleted.push(url);return {ok:true}}
      if(url.includes('alt=media')&&url.includes('manifest'))return {text:async()=>JSON.stringify(remote)};
      return {blob:async()=>new Blob(['png'],{type:'image/png'})};
    },
    put:async (_,x)=>{const i=local.findIndex(y=>y.id===x.id);if(i<0)local.push(x);else local[i]=x},
    del:async (_,id)=>{local=local.filter(x=>x.id!==id);ctx.items=local},
    refresh:async()=>{ctx.items=local},render(){},rememberRemoved(){},
    uploadDrive:async (name,blob,parent,existing)=>{uploaded.push({name,body:await blob.text()});if(failManifest&&name==='manifest.json')throw Error('manifest failed');return existing||'new-drive-id'},
    message:x=>notices.push(x),scheduleSync(){},
  });
  vm.runInContext(validation+sync,ctx);
  await ctx.syncDrive();
  return {local,uploaded,deleted,notices,removed:ctx.removed};
}
(async()=>{
  const old={...record,blob:new Blob(['png'],{type:'image/png'}),backedUp:true};
  const tombstone=await scenario(manifest([record],[{id:record.id,driveId:record.driveId}]),[old],[{id:'manifest',name:'manifest.json'},{id:'drive-1',name:'test.png'}]);
  assert.equal(tombstone.local.length,0,'remote deletion removes a stale local copy');
  assert.equal(tombstone.removed.has(record.id),true);
  assert.ok(tombstone.deleted.some(x=>x.includes('drive-1')));
  const missing=await scenario(manifest([record]),[old],[{id:'manifest',name:'manifest.json'}]);
  assert.ok(missing.uploaded.some(x=>x.name.startsWith('valid-1__')),'missing Drive image is reuploaded');
  assert.equal(missing.local[0].backedUp,true);
  const failed=await scenario(manifest([]),[{...old,backedUp:false}],[{id:'manifest',name:'manifest.json'}],true);
  assert.equal(failed.local[0].backedUp,false,'failed manifest write never gets a green check');
  console.log('Security and sync tests passed');
})().catch(e=>{console.error(e);process.exitCode=1});
