// Small, route-specific public datasets. Keep content/catalog.json as the canonical editor source.
// Do not discard the champion index in counters: saved rosters can contain any champion.
const fields=(record,keys)=>Object.fromEntries(keys.filter(k=>record[k]!==undefined).map(k=>[k,record[k]]));
const rosterChampion=c=>fields(c,['id','name','class','initials','rarityAvailability']);
const directoryChampion=c=>({
 ...fields(c,['id','name','class','initials','summary','coverage','abilityIds','immunityIds','tagIds','protections','rarityAvailability']),
 ...(c.referenceFacts?.abilities?.length?{referenceFacts:{abilities:c.referenceFacts.abilities}}:{})
});
const compareChampion=c=>fields(c,['id','name','class','initials','rarityAvailability','immunityIds','abilityIds','resistanceNote','strengths','risks','awakening','signatureTarget','loadout','focusTrial','statFocusEligibility']);
const loadoutChampion=c=>fields(c,['id','name','class','loadout','loadoutException','referenceFacts','focusTrial','statFocusEligibility','statFocusReview']);

export function catalogViews(db){
 const index=db.champions.map(rosterChampion);
 const directory=db.champions.map(directoryChampion);
 const compactBosses=db.bosses.map(b=>fields(b,['id','name','chapter','summary']));
 const directoryTables={champions:directory,abilities:db.abilities,immunities:db.immunities,tags:db.tags};
 const cited=new Set(db.counters.flatMap(c=>c.sourceIds||[]));
 const counterRelics=new Set(db.counters.map(c=>c.relicId).filter(Boolean));
 return {
  'catalog-finder':{champions:index.map(c=>({id:c.id,name:c.name})),bosses:compactBosses,gameModes:db.gameModes},
  'catalog-roster':{champions:index},
  'catalog-champions':{...directoryTables,bosses:[]},
  'catalog-search':{...directoryTables,bosses:compactBosses},
  'catalog-counters':{champions:index,bosses:compactBosses,counters:db.counters,abilities:db.abilities,gameModes:db.gameModes,
   relics:db.relics.filter(r=>counterRelics.has(r.id)),sources:db.sources.filter(s=>cited.has(s.id)),fightMechanics:db.fightMechanics||[]},
  'catalog-compare':{champions:db.champions.map(compareChampion),counters:db.counters.map(c=>fields(c,['attackerId','defenderId'])),
   bosses:compactBosses,relics:db.relics,immunities:db.immunities,abilities:db.abilities},
  'catalog-loadouts':{champions:db.champions.map(loadoutChampion),relics:db.relics,sources:db.sources,reviewedAt:db.reviewedAt}
 };
}
