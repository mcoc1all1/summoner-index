import ordeal from './challenge-plans-ordeal.mjs';
import abyss from './challenge-plans-abyss.mjs';
import epoch from './challenge-plans-epoch.mjs';

const all=[...ordeal,...abyss,...epoch];
const role=([label,candidates,note])=>({label,candidates,note});
const requirement=([championId,label,text])=>({championId,label,text});
const fight=([name,primary,backup,plan,watch])=>({fight:name,primary:Array.isArray(primary)?primary:[primary],backup:backup||[],plan,watch,evidence:'community-completion-report'});

export function enrichChallenges(collection){
 const next=structuredClone(collection);
 next.guides=next.guides.map(guide=>{
  const extra=all.find(x=>x.id===guide.id);
  if(!extra)return guide;
  return {...guide,...extra,roleCoverage:(extra.roles||[]).map(role),requirements:(extra.requirements||[]).map(requirement),fightPlan:(extra.fights||[]).map(fight)};
 });
 return next;
}

export function challengePlanById(id){
 const extra=all.find(x=>x.id===id);
 if(!extra)return null;
 return {...extra,roleCoverage:(extra.roles||[]).map(role),requirements:(extra.requirements||[]).map(requirement),fightPlan:(extra.fights||[]).map(fight)};
}
