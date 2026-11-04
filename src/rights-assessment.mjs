import {createHash} from 'node:crypto';
import {validDate} from './review.mjs';

export function fingerprint(db,boss){
 return createHash('sha256').update(JSON.stringify({boss,sources:(boss.sourceIds||[]).map(id=>db.sources.find(s=>s.id===id))})).digest('hex');
}
const present=value=>typeof value==='string'&&!!value.trim();
const url=value=>{try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}};
export function rightsAssessmentReasons(db,boss,review,{today=new Date().toISOString().slice(0,10)}={}){
 const reasons=[];
 if(!review)return ['No individual rights assessment recorded'];
 if(review.fingerprint!==fingerprint(db,boss))reasons.push('Content or cited evidence changed since review');
 if(!present(review.reviewer)||!validDate(review.reviewedAt)||review.reviewedAt>today)reasons.push('Valid dated reviewer identity missing');
 const r=review.rights||{};
 if(r.status!=='reviewed')reasons.push('Rights assessment remains pending');
 if(!['independently-authored-facts','licensed','permission','documented-exception'].includes(r.basis)||!present(r.evidence))reasons.push('Supported rights basis and evidence missing');
 for(const key of ['expression','arrangement','compilation'])if(!present(r[key]))reasons.push(`${key} assessment missing`);
 if(!Array.isArray(r.unresolved)||r.unresolved.length)reasons.push('Unresolved rights questions or missing uncertainty assessment');
 const assessments=Array.isArray(r.sources)?r.sources:[];
 const ids=boss.sourceIds||[];
 if(new Set(ids).size!==ids.length||!ids.length)reasons.push('Guide citations missing or duplicated');
 if(new Set(assessments.map(s=>s.sourceId)).size!==assessments.length||assessments.some(s=>!ids.includes(s.sourceId)))reasons.push('Duplicate or unrelated source assessments');
 for(const id of ids){
  const source=db.sources.find(s=>s.id===id),a=assessments.find(s=>s.sourceId===id);
  if(!source||!url(source.url)||!a||a.url!==source.url||a.access!=='compared'||!present(a.comparison)||!present(a.licenseStatus)||!present(a.locator)||!validDate(a.checkedAt)||a.checkedAt>review.reviewedAt)reasons.push(`Incomplete source comparison: ${id}`);
 }
 if(r.basis==='licensed'&&(!url(r.licenseURL)||!present(r.obligations)))reasons.push('License and compliance record missing');
 if(r.basis==='permission'&&(!present(r.permissionRecord)||!present(r.permissionScope)))reasons.push('Permission evidence and scope missing');
 if(r.basis==='documented-exception'&&(!present(r.jurisdiction)||!present(r.exceptionAnalysis)))reasons.push('Jurisdiction-specific exception analysis missing');
 return reasons;
}
