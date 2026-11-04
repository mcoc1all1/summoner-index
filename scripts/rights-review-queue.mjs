import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Audit the actual assembled boss-guide catalog; never infer approval from
// source attribution, gameplay accuracy, or a stale editorial fingerprint.
export function rightsReviewQueue(db,manifest){
 const byId=new Map((manifest.reviews||[]).map(r=>[r.id,r]));
 const sourceById=new Map((db.sources||[]).map(s=>[s.id,s]));
 const items=(db.bosses||[]).map(boss=>{
  const review=byId.get(boss.id);
  const sources=(boss.sourceIds||[]).map(id=>sourceById.get(id)).filter(Boolean);
  const rights=review?.rights||{};
  const cleared=rights.status==='reviewed'
    && ['independently-authored-facts','licensed','permission','documented-exception'].includes(rights.basis)
    && !!rights.evidence?.trim()
    && !!review?.reviewedAt?.trim();
  return {id:boss.id,name:boss.name,chapter:boss.chapter,
   status:cleared?'reviewed':'pending',
   reason:!review?'No individual guide expression/right-to-reuse assessment recorded':
    !cleared?'Evidence or a supported rights basis is still pending':'Review recorded; recheck when content changes',
   citations:sources.map(s=>({title:s.title,url:s.url,kind:s.kind}))};
 });
 return {scope:'Boss text/expression review inventory only; facts and game mechanics are not automatically copyrighted.',
  total:items.length,reviewed:items.filter(x=>x.status==='reviewed').length,
  pending:items.filter(x=>x.status==='pending').length,items};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const dist=path.join(root,'dist','catalog.json');
 if(!fs.existsSync(dist))throw Error('Run npm run build first to assemble the current boss catalog');
 const db=JSON.parse(fs.readFileSync(dist,'utf8'));
 const reviews=JSON.parse(fs.readFileSync(path.join(root,'content/publication-review.json'),'utf8'));
 const report=rightsReviewQueue(db,reviews);
 console.log(JSON.stringify(report,null,2));
 if(process.argv.includes('--require-cleared')&&report.pending>0){
  console.error(report.pending+' boss guides still require an individual rights/expression review.');
  process.exitCode=1;
 }
}
