// The public beta may cite research sources, but it must not mirror their
// compiled champion lists or suggested relic pairings without a reuse basis.
// The full research source remains in content/catalog.json for local review.
// This is a publication risk reduction, not a declaration of copyright clearance.
export function publicResearchView(db){
 return {
  ...db,
  champions:db.champions.map(c=>({
   ...c,
   ...(c.referenceFacts?{referenceFacts:{
    status:'source-link-only',
    url:c.referenceFacts.url,
    checkedAt:c.referenceFacts.checkedAt
   }}:{}),
   // These pairs were recorded directly from a third-party shortlist.
   // Keep editorial Stat Focus trials, but withhold these relic selections.
   ...(c.loadout?{loadout:{
    ...c.loadout,
    battlecastId:null,
    statcastId:null,
    relicNotes:'Community relic pairings are withheld from this public beta pending independent research or permission.',
    relicCheckedAt:null
   }}:{}),
   relicIds:[]
  }))
 };
}
