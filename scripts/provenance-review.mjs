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
 // Reflect explicit follow-up resolutions without assuming other catalog sources have
 // been audited. Removing a misleading ID is a valid outcome, not verified immunity.
 const followUpFile='immunity-verified-20261104-patches.json';
 const followUp=fs.existsSync(path.join(folder,followUpFile))?read(folder,followUpFile):{championPatches:[]};
 const resolved=new Map();
 for(const patch of followUp.championPatches||[]){
  for(const effectId of patch.removeImmunityIds||[])resolved.set(patch.id+':'+effectId,'removed-after-review');
  for(const record of patch.addProtections||[])resolved.set(patch.id+':'+record.effectId,'scoped-and-source-linked');
 }
 const immunityClaims=(immunity.championPatches||[]).flatMap(patch=>{
  const locallyScoped=new Set((patch.addProtections||[]).map(record=>record.effectId));
  return (patch.addImmunityIds||[]).map(effectId=>{
   const laterResolution=resolved.get(patch.id+':'+effectId)||null;
   const local=locallyScoped.has(effectId);
   return {
    championId:patch.id,effectId,patchFile:'immunity-roster-audit-patches.json',
    scopeRecordedInThisPatch:local,
    resolvedInLaterPatch:laterResolution,
    reviewNeeded:!local&&!laterResolution,
    reason:laterResolution==='removed-after-review'?'Broad immunity tag removed; ability described separately':
      laterResolution==='scoped-and-source-linked'?'Specific conditionality and source documented in follow-up patch':
      local?'Scoped protection recorded in originating patch':
      'Activation, debuff/passive form and claim-specific provenance must be checked against the merged catalog'
   };
  });
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
