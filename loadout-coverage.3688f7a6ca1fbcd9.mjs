const actionableFocus=c=>['reviewed','editorial-pick'].includes(c?.statFocusReview?.status)&&!!(c?.loadout?.attackFocus||c?.focusTrial?.attackFocus);
const eligibilityConfirmed=c=>{
 const x=c?.statFocusEligibility;
 return x?.status==='confirmed'&&typeof x.checkedAt==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.checkedAt)&&Array.isArray(x.sourceIds)&&x.sourceIds.length>0;
};

export function loadoutCoverage(db){
 const rows=db.champions.map(c=>({id:c.id,name:c.name,
  attacker:actionableFocus(c),
  defender:actionableFocus(c)&&!!(c.loadout?.defenseFocus||c.focusTrial?.defenseFocus),
  focusDraft:!!(c.loadout||c.focusTrial),
  focusVerified:actionableFocus(c)&&eligibilityConfirmed(c),
  focusWithheld:c?.statFocusReview?.status==='withheld',
  catalogueTrial:c?.statFocusReview?.status==='catalog-trial',
  editorialPick:c?.statFocusReview?.status==='editorial-pick',
  individuallyReviewed:c?.statFocusReview?.status==='reviewed',
  battlecast:!!c.loadout?.battlecastId,statcast:!!c.loadout?.statcastId,
  exception:!!c.loadoutException,
  relicCheckedAt:c.loadout?.relicCheckedAt||null,
  originalRelicTrial:c.relicResearch?.status==='editorial-trial'&&c.relicResearch?.gameplayTested===false,
  editorialRelicPair:c.relicEditorial?.status==='independent-editorial-trial',
  relicPairHeld:c.relicEditorial?.status==='research-hold',
  gameplayTested:false
 }));
 return {total:rows.length,attacker:rows.filter(r=>r.attacker).length,
  defender:rows.filter(r=>r.defender).length,
  verifiedFocus:rows.filter(r=>r.focusVerified).length,
  originalRelicTrials:rows.filter(r=>r.originalRelicTrial).length,
  authoredRelicPairs:rows.filter(r=>r.editorialRelicPair).length,
  relicPairHolds:rows.filter(r=>r.relicPairHeld).length,
  catalogueTrials:rows.filter(r=>r.catalogueTrial&&r.focusVerified).length,
  editorialPicks:rows.filter(r=>r.editorialPick&&r.focusVerified).length,
  individuallyReviewed:rows.filter(r=>r.individuallyReviewed&&r.focusVerified).length,
  hiddenFocusDrafts:rows.filter(r=>r.focusWithheld).length,
  bothRelics:rows.filter(r=>r.battlecast&&r.statcast).length,
  oneRelic:rows.filter(r=>r.battlecast!==r.statcast).length,
  noRelics:rows.filter(r=>!r.battlecast&&!r.statcast&&!r.exception).length,
  exceptions:rows.filter(r=>r.exception).length,rows};
}