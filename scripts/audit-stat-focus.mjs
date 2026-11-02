import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const db=JSON.parse(fs.readFileSync(path.join(root,'content/catalog.json'),'utf8'));

const rows=db.champions.map(c=>{
  const focus=c.loadout||c.focusTrial||{};
  const eligibility=c.statFocusEligibility||{};
  const review=c.statFocusReview||{};
  const publicEligible=eligibility.status==='confirmed' && Array.isArray(eligibility.sourceIds) && eligibility.sourceIds.length>0 && /^\d{4}-\d{2}-\d{2}$/.test(eligibility.checkedAt||'');
  return {
    id:c.id,name:c.name,class:c.class,coverage:c.coverage||null,publicEligible,
    eligibility:eligibility.status||'unverified',eligibilityCheckedAt:eligibility.checkedAt||null,eligibilitySourceIds:eligibility.sourceIds||[],
    reviewStatus:review.status||'unreviewed',reviewConfidence:review.confidence||null,reviewCheckedAt:review.checkedAt||null,reviewSourceIds:review.sourceIds||[],reviewNote:review.note||null,
    attack:focus.attackFocus||null,attackAlt:focus.attackAlternative||null,attackReason:focus.attackReason||null,
    defense:focus.defenseFocus||null,defenseAlt:focus.defenseAlternative||null,defenseReason:focus.defenseReason||null,
    focusReviewedAt:focus.reviewedAt||null,focusSourceIds:focus.sourceIds||[],
    abilities:c.referenceFacts?.abilities||[],abilityIds:c.abilityIds||[],summary:c.summary||'',playstyle:c.playstyle||'',strengths:c.strengths||'',risks:c.risks||''
  };
}).filter(r=>r.attack||r.defense||r.reviewStatus!=='unreviewed');

const actionable=r=>r.publicEligible&&r.reviewStatus==='reviewed'&&r.attack&&r.attack!=='Not reviewed';
const withheld=r=>r.reviewStatus==='withheld'||r.attack==='Not reviewed';
const unsafe=rows.filter(r=>r.publicEligible&&r.attack&&r.attack!=='Not reviewed'&&r.reviewStatus!=='reviewed');
const incompleteReviews=rows.filter(r=>r.reviewStatus==='reviewed'&&(!r.reviewSourceIds.length||!r.reviewCheckedAt||!r.reviewConfidence));
const counts=(key,list)=>Object.fromEntries([...new Set(list.map(r=>r[key]).filter(Boolean))].sort().map(v=>[v,list.filter(r=>r[key]===v).length]));
const reviewedRows=rows.filter(actionable);
const possibleConflicts=[];
for(const r of reviewedRows){
  const text=[r.summary,r.playstyle,r.strengths,r.risks,...r.abilities,...r.abilityIds].join(' ');
  const flags=[];
  if(r.attack==='Critical Rating'&&/guaranteed crit|guaranteed critical|cannot crit|cannot land critical|critical hits? cannot/i.test(text))flags.push('Critical Rating needs manual review against crit rules');
  if(r.attack==='Critical Damage Rating'&&/cannot crit|cannot land critical|critical hits? cannot/i.test(text))flags.push('Critical Damage needs manual review against crit rules');
  if(r.attack==='Special Damage'&&/(heavy attack|damage over time|rupture|bleed|poison|incinerate|shock|degen)/i.test(text)&&!/special/i.test(text))flags.push('Special Damage needs manual review against non-special damage emphasis');
  if(flags.length)possibleConflicts.push({name:r.name,attack:r.attack,flags});
}

const report={
  generatedAt:new Date().toISOString(),champions:db.champions.length,championsWithFocusData:rows.length,
  reviewedRecommendations:reviewedRows.length,withheldRecommendations:rows.filter(withheld).length,
  eligibleButWithheld:rows.filter(r=>r.publicEligible&&withheld(r)).length,notPublicEligible:rows.filter(r=>!r.publicEligible).length,
  unsafeActionableRecommendations:unsafe,incompleteReviews,
  attackDistribution:counts('attack',reviewedRows),defenseDistribution:counts('defense',reviewedRows),possibleConflicts,rows
};
const out=path.join(root,'stat-focus-audit-current.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({champions:report.champions,reviewedRecommendations:report.reviewedRecommendations,withheldRecommendations:report.withheldRecommendations,eligibleButWithheld:report.eligibleButWithheld,unsafeActionableRecommendations:unsafe.length,incompleteReviews:incompleteReviews.length,possibleConflicts:possibleConflicts.length,report:path.basename(out)},null,2));
if(unsafe.length||incompleteReviews.length)process.exitCode=1;
