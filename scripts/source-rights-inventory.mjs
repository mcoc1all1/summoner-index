import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Repeatable source inventory; it tracks provenance, NOT legal clearance.
export function inventorySources(root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')){
 const dir=path.join(root,'content');
 const base=JSON.parse(fs.readFileSync(path.join(dir,'catalog.json'),'utf8'));
 const entries=base.sources.map(s=>({...s,file:'content/catalog.json'}));
 const patchFiles=fs.readdirSync(dir).filter(n=>n.endsWith('-patches.json')).sort();
 for(const file of patchFiles){
  const json=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
  for(const source of json.sources||[])entries.push({...source,file:'content/'+file});
 }
 const hostOf=url=>{
  try{return new URL(url).hostname.toLowerCase();}
  catch{return 'invalid';}
 };
 const hosts={};
 for(const source of entries){
  const host=hostOf(source.url);
  const row=hosts[host]??={records:0,urls:new Set(),files:new Set()};
  row.records++;row.urls.add(source.url);row.files.add(source.file);
 }
 const hostSummary=Object.fromEntries(Object.entries(hosts).sort(([a],[b])=>a.localeCompare(b)).map(([name,v])=>[
  name,{sourceDeclarations:v.records,distinctURLs:v.urls.size,files:[...v.files].sort()}
 ]));
 const publicReferenceBlocks=base.champions.filter(c=>c.referenceFacts);
 return {
  generatedAt:new Date().toISOString().slice(0,10),
  scope:'Raw source declarations in canonical catalog and all content/*-patches.json files; records can repeat and later patches can override earlier ones. Not a rights-cleared or deduplicated published catalog.',
  baseSourceDeclarations:base.sources.length,
  patchFiles:patchFiles.length,
  patchSourceDeclarations:entries.length-base.sources.length,
  totalSourceDeclarations:entries.length,
  distinctSourceURLs:new Set(entries.map(s=>s.url)).size,
  sourceHosts:Object.keys(hostSummary).length,
  championReferenceBlocks:publicReferenceBlocks.length,
  linkedKitSourceHosts:[...new Set(publicReferenceBlocks.map(c=>hostOf(c.referenceFacts.url)))].sort(),
  hosts:hostSummary,
  restrictions:'Source attribution and a generated inventory do not authorize reproduction of copyrighted expression or a substantial protected compilation.'
 };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=inventorySources();
 const output=JSON.stringify(report,null,2)+'\n';
 if(process.argv.includes('--write')){
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  fs.writeFileSync(path.join(root,'docs','source-inventory-current.json'),output);
  console.log('Updated docs/source-inventory-current.json');
 }else console.log(output);
}
