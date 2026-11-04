import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rightsAssessmentReasons} from '../src/rights-assessment.mjs';

// Audit the actual assembled boss-guide catalog; never infer approval from
// source attribution, gameplay accuracy, or a stale editorial fingerprint.
export function rightsReviewQueue(db,manifest){
 const byId=new Map((manifest.reviews||[]).map(r=>[r.id,r]));
 const sourceById=new Map((db.sources||[]).map(s=>[s.id,s]));
 const items=(db.bosses||[]).map(boss=>{
  const review=byId.get(boss.id);
  const sources=(boss.sourceIds||[]).map(id=>sourceById.get(id)).filter(Boolean);
  const reasons=rightsAssessmentReasons(db,boss,review);
  if((manifest.reviews||[]).filter(r=>r.id===boss.id).length>1)reasons.push('Duplicate guide reviews');
  const cleared=reasons.length===0;
  return {id:boss.id,name:boss.name,chapter:boss.chapter,
   status:cleared?'reviewed':'pending',
   reason:cleared?'Current evidence-backed assessment recorded; not legal clearance':reasons.join('; '),
   reasons,
   citations:sources.map(s=>({title:s.title,url:s.url,kind:s.kind}))};
 });
 return {scope:'Boss text/expression review inventory only; facts and game mechanics are not automatically copyrighted.',
  total:items.length,reviewed:items.filter(x=>x.status==='reviewed').length,
  pending:items.filter(x=>x.status==='pending').length,items};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 // Invoked through run-with-accuracy-patches; never trust an old dist snapshot.
 const db=JSON.parse(fs.readFileSync(path.join(root,'content/catalog.json'),'utf8'));
 const reviews=JSON.parse(fs.readFileSync(path.join(root,'content/publication-review.json'),'utf8'));
 const report=rightsReviewQueue(db,reviews);
 console.log(JSON.stringify(report,null,2));
 if(process.argv.includes('--check-integrity')){
  const invalid=(reviews.reviews||[]).filter(r=>r.rights?.status==='reviewed'&&!report.items.some(i=>i.id===r.id&&i.status==='reviewed'));
  if(invalid.length){console.error('Stale or incomplete rights approvals: '+invalid.map(r=>r.id).join(', '));process.exitCode=1;}
 }
 if(process.argv.includes('--require-cleared')&&report.pending>0){
  console.error(report.pending+' boss guides still require an individual rights/expression review.');
  process.exitCode=1;
 }
}
