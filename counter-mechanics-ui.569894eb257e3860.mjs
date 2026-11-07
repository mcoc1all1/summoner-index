import {escapeHtml as e} from './domain.569894eb257e3860.mjs';
import {mechanicLabel} from './fight-mechanics.569894eb257e3860.mjs';

const labels=(db,ids=[])=>ids.map(id=>mechanicLabel(db,id));
const chipRow=(label,items,className)=>items.length?`<div class="counter-mechanic-row ${className}"><strong>${e(label)}</strong><div class="counter-mechanic-chips">${items.map(item=>`<span>${e(item)}</span>`).join('')}</div></div>`:'';

export function counterMechanicSummary(db,counter){
 const data=counter?.fightMechanics;
 if(!data)return '';
 const handled=labels(db,data.handledProblemIds);
 const helps=labels(db,[...(data.mitigatedProblemIds||[]),...(data.exploitedProblemIds||[])]);
 const unresolved=labels(db,data.unresolvedProblemIds);
 if(!handled.length&&!helps.length&&!unresolved.length)return '';
 return `<section class="counter-mechanics" aria-label="Structured fight mechanics"><div class="counter-mechanics-title"><strong>Matchup mechanics</strong><small>${e(data.fit==='strong'?'Strong structured fit':data.fit==='partial'?'Partial structured fit':'Context-dependent fit')}</small></div>${chipRow('Handles',handled,'mechanic-handled')}${chipRow('Helps with',helps,'mechanic-helps')}${chipRow('Still watch',unresolved,'mechanic-watch')}</section>`;
}
