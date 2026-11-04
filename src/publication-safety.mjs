// Filter before rendering HTML, browser JSON or versioned assets.
// Source-linked compilations and unreviewed editorial drafts stay in the
// canonical research catalog; a public build is not rights clearance.
function publicFocus(source){
 if(!source)return source;
 const kept={...source};
 const genericRationale=/^Community-corroborated starting point; matchup and playstyle can change the preferred choice\.$/;
 const isReviewed=source.statFocusReview?.status==='reviewed'
   && source.statFocusEligibility?.status==='confirmed'
   && !genericRationale.test(source.loadout?.attackReason||'')
   && !genericRationale.test(source.loadout?.defenseReason||'');
 if(source.statFocusReview?.status==='reviewed'&&!isReviewed)
  kept.statFocusReview={...source.statFocusReview,status:'withheld',note:'Specific attacker and defender rationale must be authored and reviewed before publication.'};
 if(kept.loadout){
  kept.loadout={
   ...kept.loadout,
   battlecastId:null,
   statcastId:null,
   relicNotes:'External relic pairing suggestions are not published pending independent review.',
   relicCheckedAt:null,
   attackAlternative:'Not reviewed',
   defenseAlternative:'Not reviewed',
   ...(isReviewed?{}:{
    attackFocus:'Not reviewed',
    defenseFocus:'Not reviewed',
    attackReason:'Champion-specific Stat Focus recommendation not yet approved for publication.',
    defenseReason:'Champion-specific Stat Focus recommendation not yet approved for publication.'
   })
  };
 }
 if(kept.focusTrial){
  kept.focusTrial={
   ...kept.focusTrial,
   attackAlternative:'Not reviewed',
   ...(!isReviewed?{
    attackFocus:'Not reviewed',
    attackReason:'Champion-specific Stat Focus recommendation not yet approved for publication.'
   }:{})
  };
 }
 kept.relicIds=[];
 return kept;
}

export function publicResearchView(db){
 return {...db,champions:db.champions.map(champion=>{
  const c=publicFocus(champion);
  if(!c.referenceFacts)return c;
  return {...c,referenceFacts:{
   status:'source-link-only',
   url:c.referenceFacts.url,
   checkedAt:c.referenceFacts.checkedAt
  }};
 })};
}
