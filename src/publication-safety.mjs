// Filter before rendering HTML, browser JSON or versioned assets.
// Source-linked compilations and unreviewed editorial drafts stay in the
// canonical research catalog; a public build is not rights clearance.
function publicFocus(source){
 if(!source)return source;
 const kept={...source};
 const isReviewed=source.statFocusReview?.status==='reviewed'
   && source.statFocusEligibility?.status==='confirmed';
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
