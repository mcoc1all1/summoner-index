const actionableFocus=c=>c?.statFocusReview?.status==='reviewed'&&!!(c?.loadout?.attackFocus||c?.focusTrial?.attackFocus);
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
  battlecast:!!c.loadout?.battlecastId,statcast:!!c.loadout?.statcastId,
  exception:!!c.loadoutException,
  relicCheckedAt:c.loadout?.relicCheckedAt||null,
  gameplayTested:false
 }));
 return {total:rows.length,attacker:rows.filter(r=>r.attacker).length,
  defender:rows.filter(r=>r.defender).length,
  verifiedFocus:rows.filter(r=>r.focusVerified).length,
  hiddenFocusDrafts:rows.filter(r=>r.focusWithheld).length,
  bothRelics:rows.filter(r=>r.battlecast&&r.statcast).length,
  oneRelic:rows.filter(r=>r.battlecast!==r.statcast).length,
  noRelics:rows.filter(r=>!r.battlecast&&!r.statcast&&!r.exception).length,
  exceptions:rows.filter(r=>r.exception).length,rows};
}