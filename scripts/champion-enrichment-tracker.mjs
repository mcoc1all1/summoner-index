import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {publicResearchView} from '../src/publication-safety.mjs';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const fieldCount=(row,key)=>Array.isArray(row[key])?row[key].length:0;
const hasNotes=c=>Array.isArray(c.fieldNotes?.decisions)&&c.fieldNotes.decisions.length>=2;
const safeString=x=>String(x??'').replaceAll(/\r?\n/g,' ');
const csvCell=x=>'"'+safeString(x).replaceAll('"','""')+'"';

export function championEnrichmentAudit(rawDb,{batchSize=20}={}){
 if(!Number.isInteger(batchSize)||batchSize<5||batchSize>50)
  throw Error('Batch size must be an integer from 5 to 50');
 const db=publicResearchView(rawDb); // never export source-derived private fields or draft focus choices
 const attackerMatches=new Map(),defenderOptions=new Map(),synergies=new Map();
 for(const counter of db.counters||[]){
  attackerMatches.set(counter.attackerId,(attackerMatches.get(counter.attackerId)||0)+1);
  defenderOptions.set(counter.defenderId,(defenderOptions.get(counter.defenderId)||0)+1);
 }
 for(const synergy of db.synergies||[])synergies.set(synergy.championId,(synergies.get(synergy.championId)||0)+1);
 const rows=db.champions.map(c=>{
  const utility=fieldCount(c,'abilityIds'), protections=fieldCount(c,'protections'),
   rotation=fieldCount(c,'rotation'), decisions=c.fieldNotes?.decisions?.length||0,
   sourceCount=new Set([...(c.sourceIds||[]),...(c.fieldNotes?.sourceIds||[])]).size;
  const attacker=attackerMatches.get(c.id)||0,defender=defenderOptions.get(c.id)||0;
  const identityReview=c.coverage==='roster'&&!rotation;
  const publishedFocus=c.statFocusReview?.status==='reviewed'
   && c.statFocusEligibility?.status==='confirmed'
   && c.loadout?.attackFocus && c.loadout.attackFocus!=='Not reviewed';
  const completed=hasNotes(c);
  const gaps=[
   ...(!rotation?['No sourced rotation']:[]),
   ...(!decisions?['No decision-focused field notes']:[]),
   ...(!utility?['No structured utility labels']:utility<=2?['Limited structured utility']:[]),
   ...(!protections?['No scoped protection records (not a claim of no immunities)']:[]),
   ...(!attacker&&!defender?['No documented counter matchups']:[]),
   ...(!publishedFocus?['Stat Focus not approved/published']:[]),
   ...(!sourceCount?['No attached source references']:[])
  ];
  const score=(decisions===0?50:0)+(rotation===0?20:0)
   +(utility===0?14:utility<=2?8:utility===3?2:0)
   +(protections===0?11:protections===1?4:0)
   +(identityReview?8:0)+(sourceCount<2?4:0)
   +((attacker>=2||defender>=2)?8:(attacker||defender)?5:0)
   +(!publishedFocus?3:0);
  return {id:c.id,name:c.name,championClass:c.class,priorityScore:score,
   coverage:c.coverage||'not-recorded',structuredUtility:utility,scopedProtections:protections,
   rotationSteps:rotation,fieldNotes:decisions,sourceReferences:sourceCount,
   attackerMatchups:attacker,defenderCounterOptions:defender,
   synergyRecords:synergies.get(c.id)||0,reviewedStatFocus:!!publishedFocus,
   sevenStarEligibility:c.statFocusEligibility?.status||'unverified',
   identityReview,completed,gaps,priorityRank:null,batch:null,
   status:completed?'Pilot complete':identityReview?'Identity review first':'Queued'};
 });
 const queue=rows.filter(r=>!r.completed&&!r.identityReview)
  .sort((a,b)=>b.priorityScore-a.priorityScore
    ||(b.attackerMatchups+b.defenderCounterOptions)-(a.attackerMatchups+a.defenderCounterOptions)
    ||a.name.localeCompare(b.name));
 for(const [i,row] of queue.entries()){row.priorityRank=i+1;row.batch=Math.floor(i/batchSize)+1;}
 const sorted=[...rows].sort((a,b)=>(a.completed?0:a.identityReview?2:1)-(b.completed?0:b.identityReview?2:1)
  ||(a.priorityRank||0)-(b.priorityRank||0)||a.name.localeCompare(b.name));
 const summary={
  schemaVersion:1,totalChampions:rows.length,completedPilot:rows.filter(r=>r.completed).length,
  identityReview:rows.filter(r=>r.identityReview).length,queued:queue.length,
  batchSize,batches:Math.ceil(queue.length/batchSize),
  championsWithRotations:rows.filter(r=>r.rotationSteps>0).length,
  championsWithFieldNotes:rows.filter(r=>r.fieldNotes>=2).length,
  championsWithoutScopedProtections:rows.filter(r=>r.scopedProtections===0).length,
  championsWithoutStructuredUtility:rows.filter(r=>r.structuredUtility===0).length,
  approvedStatFocus:rows.filter(r=>r.reviewedStatFocus).length,
  methodology:'Priority scores measure gaps in published structured content and documented matchups; they do not measure champion strength, gameplay truth or legal clearance. An empty protection record does not mean no immunity. Published focus counts are informational, not mandatory for every champion.'
 };
 return {summary,rows:sorted};
}

export function trackerCsv(report){
 const columns=['priorityRank','batch','status','id','name','championClass','priorityScore','coverage',
  'structuredUtility','scopedProtections','rotationSteps','fieldNotes','sourceReferences',
  'attackerMatchups','defenderCounterOptions','synergyRecords','reviewedStatFocus',
  'sevenStarEligibility','identityReview','gaps'];
 return columns.join(',')+'\n'+report.rows.map(row=>columns.map(k=>csvCell(Array.isArray(row[k])?row[k].join(' | '):row[k])).join(',')).join('\n')+'\n';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const db=JSON.parse(fs.readFileSync(path.join(repoRoot,'content/catalog.json'),'utf8'));
 const report=championEnrichmentAudit(db);
 const summary={...report.summary,firstBatch:report.rows.filter(r=>r.batch===1).map(r=>({id:r.id,name:r.name,priorityScore:r.priorityScore}))};
 console.log(JSON.stringify(summary,null,2));
 if(process.argv.includes('--write')){
  const dest=path.join(repoRoot,'docs');
  fs.mkdirSync(dest,{recursive:true});
  fs.writeFileSync(path.join(dest,'champion-enrichment-tracker.json'),JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync(path.join(dest,'champion-enrichment-tracker.csv'),trackerCsv(report));
  console.log('Generated docs/champion-enrichment-tracker.{json,csv} (public-safe metadata only)');
 }
}
