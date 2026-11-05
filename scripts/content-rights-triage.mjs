import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDefault=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=(root,name)=>JSON.parse(fs.readFileSync(path.join(root,'content',name),'utf8'));
const hostname=value=>{try{return new URL(value).hostname.toLowerCase();}catch{return 'unresolved';}};
const sourceStatus=source=>{
 if(!source?.url)return 'missing-source-URL';
 const host=hostname(source.url);
 if(/(^|\.)playcontestofchampions\.com$|(^|\.)forums\.playcontestofchampions\.com$/.test(host))return 'publisher-source';
 if(/(^|\.)reddit\.com$|(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(host))return 'community-report';
 return 'third-party-source';
};

// A triage inventory, not a copyright finding. A gameplay fact may be used
// without a third-party expressive-content license; published selections and
// original writing still need checking individually.
export function contentRightsTriage(root=rootDefault){
 const db=load(root,'catalog.json'),carina=load(root,'carina-volume-4.json');
 const masteries=load(root,'masteries.json'),live=load(root,'live.json');
 const sources=new Map([...(db.sources||[]),...(masteries.sources||[])].map(s=>[s.id,s]));
 const catalogTypes=[['champions',db.champions],['counters',db.counters],['bosses',db.bosses],
  ['relics',db.relics],['synergies',db.synergies],['quests',db.quests],['videos',db.videos]];
 const rows=[];
 for(const [type,records] of catalogTypes)for(const rec of records||[]){
  const linked=(rec.sourceIds||[]).map(id=>sources.get(id)).filter(Boolean);
  const missing=(rec.sourceIds||[]).filter(id=>!sources.has(id));
  const origins=[...new Set(linked.map(sourceStatus))].sort();
  rows.push({type,id:rec.id,name:rec.name||rec.title||rec.id,
   sources:linked.length,missingSourceIds:missing,
   origins,
   reviewStatus:'requires-page-level-expression-assessment',
   note:'Citations and source-access alone do not establish reuse permission or actual infringement.'});
 }
 for(const guide of carina.guides||[]){
  const candidateSources=[guide.source,guide.sourceUrl,...(guide.teamOptions||[]).map(x=>x.sourceUrl)].filter(Boolean);
  rows.push({type:'carina-guides',id:guide.id,name:guide.title,
   sources:candidateSources.length,missingSourceIds:[],
   origins:[...new Set(candidateSources.map(x=>sourceStatus({url:x})))].sort(),
   reviewStatus:'requires-page-level-expression-assessment',
   note:'Verify that quoted player teams are accurately attributed and explanatory prose/selection is independently written.'});
 }
 const auxiliary=[
  {type:'mastery-guidance',id:'masteries',name:'Mastery recommendations',sources:masteries.sources||[]},
  {type:'events-news',id:'events',name:'Events and News hub',sources:live.sources||[]}
 ];
 for(const item of auxiliary)rows.push({
  type:item.type,id:item.id,name:item.name,sources:item.sources.length,missingSourceIds:[],
  origins:[...new Set(item.sources.map(sourceStatus))].sort(),
  reviewStatus:'requires-page-level-expression-assessment',
  note:'Review dated accuracy and expressive reuse; links to publisher news are not a license to reproduce its text.'
 });
 const byType=Object.fromEntries([...new Set(rows.map(x=>x.type))].sort().map(type=>{
  const group=rows.filter(x=>x.type===type);
  return [type,{records:group.length,thirdPartyLinked:group.filter(x=>x.origins.includes('third-party-source')).length,
   publisherLinked:group.filter(x=>x.origins.includes('publisher-source')).length,
   withoutLinkedSources:group.filter(x=>!x.sources).length}];
 }));
 return {purpose:'Research/content rights queue, not plagiarism detection, a legal finding, or publisher clearance',
  generatedAt:new Date().toISOString().slice(0,10),records:rows.length,byType,
  priorityExamples:rows.filter(x=>x.origins.includes('third-party-source')||x.missingSourceIds.length).slice(0,35),
  reviewNeeded:true,
  nextActions:['Compare distinctive written expression and selection against each actual source on each high-traffic page.',
   'Prioritize guides, third-party compilations, and adapted wiki passages.',
   'For accurate game facts, keep independent prose and precise citations; do not assume permission is required for every fact.',
   'Record evidence and license conditions where reuse of protected material is intended.',
   'Never mark pages as cleared based on this inventory alone.']};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=contentRightsTriage();
 const output=JSON.stringify(result,null,2)+'\n';
 if(process.argv.includes('--write')){
  const target=path.join(rootDefault,'docs','content-rights-triage-current.json');
  fs.writeFileSync(target,output);
  console.log('Wrote docs/content-rights-triage-current.json');
 }else console.log(output);
 if(process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
   '\n### Expanded third-party content triage\n'+
   Object.entries(result.byType).map(([name,group])=>'- '+name+': '+group.records+
   ' records ('+group.thirdPartyLinked+' linked to third-party sources)').join('\n')+
   '\n\nThis is a review queue, not rights clearance.\n');
}
