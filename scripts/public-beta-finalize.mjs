import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Run last so the public artifact cannot accidentally expose the editor or
// raw imported source lists after later page-enhancement passes.
if(process.env.PUBLIC_BETA==='1'){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const dist=path.join(root,'dist');
 fs.rmSync(path.join(dist,'content-workbench'),{recursive:true,force:true});
 const publicData=JSON.parse(fs.readFileSync(path.join(dist,'catalog.json'),'utf8'));
 for(const c of publicData.champions){
  const ref=c.referenceFacts;
  if(ref&&(ref.abilities||ref.protections||ref.battlecast||ref.statcast))
   throw Error('Source-compilation leak in public catalog: '+c.id);
  if(c.loadout&&(c.loadout.battlecastId||c.loadout.statcastId))
   throw Error('Source-derived relic shortlist leak: '+c.id);
  if(c.relicIds?.length)throw Error('Source-derived relic links leak: '+c.id);
 }
 // Make generated explanatory copy accurate for the restricted public beta.
 const visit=dir=>{
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const file=path.join(dir,entry.name);
   if(entry.isDirectory())visit(file);
   else if(file.endsWith('.html')){
    let html=fs.readFileSync(file,'utf8');
    html=html.replaceAll('Source catalogue · detailed guide pending.','External kit reference · detailed guide pending.');
    html=html.replaceAll('Source-listed abilities, protections and relic suggestions are below.','The external kit reference is linked, not reproduced here.');
    html=html.replaceAll('source catalogues ·','linked kit references ·');
    html=html.replaceAll('source catalogues;', 'linked kit references;');
    fs.writeFileSync(file,html);
   }
  }
 };
 visit(dist);
 console.log('Public beta publication safeguards: research lists withheld, workbench excluded.');
}
