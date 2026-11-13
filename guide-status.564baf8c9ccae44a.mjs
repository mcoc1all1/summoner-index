// Editorial scope and gameplay verification are distinct. A drafted guide does
// not become a verified rotation merely because its four tactics were authored.
export function guideStatus(c){
 if(['authored','curated','held'].includes(c?.guideStatus))return c.guideStatus;
 if(c?.fieldNotes?.editorialDepth==='champion-specific-tactical-v1')
  return 'authored';
 if(c?.coverage==='curated')return 'curated';
 return 'held';
}
export function guideStatusLabel(c){
 switch(guideStatus(c)){
  case 'authored':return 'Tactical draft · not gameplay tested';
  case 'curated':return 'Curated profile · not gameplay tested';
  default:return 'Research hold · guide withheld';
 }
}
export function guideStatusCounts(champions=[]){
 const counts={authored:0,curated:0,held:0};
 for(const c of champions)counts[guideStatus(c)]++;
 return counts;
}
