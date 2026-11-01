import fs from 'node:fs';
import path from 'node:path';
const root=new URL('../dist/',import.meta.url);
const files=fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('index.html'));
const origin='https://mcoc1all1.github.io/summoner-index/';
const urls=files.map(f=>origin+f.replaceAll('\\','/').replace(/index.html$/,''));
urls.push(origin+'app.mjs',origin+'catalog.json',origin+'styles.css',origin+'loadout-coverage.mjs');
let index=0;const results=[];
await Promise.all(Array.from({length:6},async()=>{
 while(index<urls.length){const url=urls[index++];try{
  const r=await fetch(url,{signal:AbortSignal.timeout(20000)});
  await r.arrayBuffer();results.push({url,status:r.status,ok:r.ok});
 }catch(error){results.push({url,ok:false,error:error.message});}}
}));
const failures=results.filter(r=>!r.ok&&!r.url.endsWith('/404/'));
const report={checkedAt:new Date().toISOString(),checked:results.length,failures,scope:'Generated page routes and core assets. Does not certify gameplay accuracy, external source availability or legal clearance.'};
fs.writeFileSync(new URL('../docs/live-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));if(failures.length)process.exitCode=1;
