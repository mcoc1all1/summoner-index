import {focusEligibilityState,hasFocusDraft} from './loadouts.mjs';

export function loadoutCoverage(db){
 const rows=db.champions.map(c=>({id:c.id,name:c.name,
  attacker:!!(c.loadout?.attackFocus||c.focusTrial?.attackFocus),
  defender:!!c.loadout?.defenseFocus,
  focusDraft:hasFocusDraft(c),
  focusVerified:hasFocusDraft(c)&&focusEligibilityState(c).confirmed,
  battlecast:!!c.loadout?.battlecastId,statcast:!!c.loadout?.statcastId,
  exception:!!c.loadoutException,
  relicCheckedAt:c.loadout?.relicCheckedAt||null,
  gameplayTested:false
 }));
 return {total:rows.length,attacker:rows.filter(r=>r.attacker).length,
  defender:rows.filter(r=>r.defender).length,
  verifiedFocus:rows.filter(r=>r.focusVerified).length,
  hiddenFocusDrafts:rows.filter(r=>r.focusDraft&&!r.focusVerified).length,
  bothRelics:rows.filter(r=>r.battlecast&&r.statcast).length,
  oneRelic:rows.filter(r=>r.battlecast!==r.statcast).length,
  noRelics:rows.filter(r=>!r.battlecast&&!r.statcast&&!r.exception).length,
  exceptions:rows.filter(r=>r.exception).length,rows};
}
