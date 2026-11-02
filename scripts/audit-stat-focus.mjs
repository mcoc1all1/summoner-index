import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const db=JSON.parse(fs.readFileSync(path.join(root,'content/catalog.json'),'utf8'));

const rows=db.champions.map(c=>{
  const focus=c.loadout||c.focusTrial||{};
  const eligibility=c.statFocusEligibility||{};
  const publicEligible=eligibility.status==='confirmed' && Array.isArray(eligibility.sourceIds) && eligibility.sourceIds.length>0 && /^\d{4}-\d{2}-\d{2}$/.test(eligibility.checkedAt||'');
  return {
    id:c.id,
    name:c.name,
    class:c.class,
    publicEligible,
    eligibility:eligibility.status||'unverified',
    attack:focus.attackFocus||null,
    attackAlt:focus.attackAlternative||null,
    attackReason:focus.attackReason||null,
    defense:focus.defenseFocus||null,
    defenseAlt:focus.defenseAlternative||null,
    defenseReason:focus.defenseReason||null,
    abilities:c.referenceFacts?.abilities||[],
    summary:c.summary||'',
    playstyle:c.playstyle||'',
    strengths:c.strengths||'',
    risks:c.risks||''
  };
}).filter(r=>r.attack||r.defense);

const counts=(key,list=rows)=>Object.fromEntries([...new Set(list.map(r=>r[key]).filter(Boolean))].sort().map(v=>[v,list.filter(r=>r[key]===v).length]));
const reasons=new Map();
for(const r of rows){if(r.attackReason){const a=reasons.get(r.attackReason)||[];a.push(r.name);reasons.set(r.attackReason,a);}}
const repeated=[...reasons.entries()].filter(([,names])=>names.length>=3).sort((a,b)=>b[1].length-a[1].length).slice(0,20);
const possibleConflicts=[];
for(const r of rows){
  const text=[r.summary,r.playstyle,r.strengths,r.risks,...r.abilities].join(' ');
  const flags=[];
  if(r.attack==='Critical Rating'&&/guaranteed crit|guaranteed critical|cannot crit|cannot land critical|critical hits? cannot/i.test(text))flags.push('Critical Rating may be wasted by crit rules');
  if(r.attack==='Critical Damage Rating'&&/cannot crit|cannot land critical|critical hits? cannot/i.test(text))flags.push('Critical Damage may be wasted by crit rules');
  if(r.attack==='Special Damage'&&/(heavy attack|damage over time|rupture|bleed|poison|incinerate|shock|degen)/i.test(text)&&!/special/i.test(text))flags.push('Special Damage needs manual check against non-special damage emphasis');
  if(flags.length)possibleConflicts.push({name:r.name,attack:r.attack,flags});
}

console.log('STAT_FOCUS_AUDIT_START');
console.log(JSON.stringify({
  champions:db.champions.length,
  championsWithAnySuggestion:rows.length,
  publicEligibleSuggestions:rows.filter(r=>r.publicEligible).length,
  notPublicEligible:rows.filter(r=>!r.publicEligible).length,
  attackDistribution:counts('attack'),
  defenseDistribution:counts('defense'),
  possibleConflicts,
  repeatedAttackReasons:repeated.map(([reason,names])=>({count:names.length,reason,names:names.slice(0,25)})),
  rows:rows.map(({abilities,summary,playstyle,strengths,risks,...rest})=>rest)
},null,2));
console.log('STAT_FOCUS_AUDIT_END');
