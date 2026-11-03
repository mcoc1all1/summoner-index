import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(folder,name)=>JSON.parse(fs.readFileSync(path.join(folder,name),'utf8'));

/**
 * This is a provenance REVIEW QUEUE, not an accuracy/plagiarism verdict.
 * A claim can be correctly reviewed elsewhere; missing metadata in one patch
 * must not be interpreted as proof of a false immunity or copied expression.
 */
export function provenanceReview(base=root){
 const folder=path.join(base,'content');
 const immunity=read(folder,'immunity-roster-audit-patches.json');
 const immunityClaims=(immunity.championPatches||[]).flatMap(patch=>{
  const locallyScoped=new Set((patch.addProtections||[]).map(record=>record.effectId));
  return (patch.addImmunityIds||[]).map(effectId=>({
   championId:patch.id,effectId,patchFile:'immunity-roster-audit-patches.json',
   scopeRecordedInThisPatch:locallyScoped.has(effectId),
   reviewNeeded:!locallyScoped.has(effectId),
   reason:locallyScoped.has(effectId)?'Scoped protection recorded in this patch':'Activation, debuff/passive form and claim-specific provenance must be checked against the merged catalog'
  }));
 });
 const focusFiles=fs.readdirSync(folder).filter(name=>/^stat-focus-.*-patches\.json$/.test(name)).sort();
 const statFocus=focusFiles.flatMap(file=>{
  const patch=read(folder,file);
  return (patch.championPatches||[]).filter(row=>row.statFocusRecommendation).map(row=>{
   const choice=row.statFocusRecommendation;
   return {
    championId:row.id,patchFile:file,
    confidence:choice.confidence||'not recorded',
    sourceIds:choice.sourceIds||[],
    championSpecificReasonRecorded:!!(choice.attackReason?.trim()&&choice.defenseReason?.trim()),
    reviewNeeded:!(choice.attackReason?.trim()&&choice.defenseReason?.trim()),
    reason:choice.attackReason?.trim()&&choice.defenseReason?.trim()?'Attacker and defender rationale recorded':'Record champion-specific attacker/defender reasoning; community tables alone are not independent gameplay tests'
   };
  });
 });
 return {
  purpose:'Editorial research and provenance queue, not copyright clearance or gameplay verification',
  immunity:{total:immunityClaims.length,scopeFollowups:immunityClaims.filter(x=>x.reviewNeeded).length,claims:immunityClaims},
  statFocus:{total:statFocus.length,rationaleFollowups:statFocus.filter(x=>x.reviewNeeded).length,claims:statFocus}
 };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=provenanceReview();
 if(process.argv.includes('--summary')){
  console.log(JSON.stringify({purpose:result.purpose,immunity:{total:result.immunity.total,scopeFollowups:result.immunity.scopeFollowups},statFocus:{total:result.statFocus.total,rationaleFollowups:result.statFocus.rationaleFollowups}},null,2));
 }else console.log(JSON.stringify(result,null,2));
}
