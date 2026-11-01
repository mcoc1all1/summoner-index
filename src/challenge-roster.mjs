import {readRoster} from './roster.mjs';
import {escapeHtml as e} from './domain.mjs';
const host=document.querySelector('[data-challenge-roster]');
if(host){
 const base=document.body.dataset.base||'';
 try{
  const db=await fetch(base+'/catalog.json').then(r=>{if(!r.ok)throw Error('Content unavailable');return r.json();});
  const roster=readRoster(db).champions;
  const core=(host.dataset.coreTeam||'').split(',').filter(Boolean);
  const optional=(host.dataset.challengeRoster||'').split(',').filter(id=>id&&!core.includes(id));
  const row=id=>{const c=db.champions.find(x=>x.id===id),owned=roster.find(x=>x.id===id);if(!c)return '';
   if(!owned)return `<li><strong>${e(c.name)}</strong> — not saved in My Roster</li>`;
   const rarity=owned.rarity==null?'rarity not saved':owned.rarity===7?'7★ saved':'saved as '+owned.rarity+'★';
   return `<li><strong>${e(c.name)}</strong> — owned · ${e(rarity)}</li>`;
  };
  const ownedCore=core.filter(id=>roster.some(x=>x.id===id));
  const confirmedSeven=core.filter(id=>roster.some(x=>x.id===id&&x.rarity===7));
  host.innerHTML=`<h2>Check this plan against My Roster</h2><p><strong>${ownedCore.length}/${core.length} featured team members are saved as owned.</strong> ${confirmedSeven.length}/${core.length} are explicitly saved as 7★.</p><p class="muted">Rarity is only checked when you saved it. Rank and Ascension are shown as notes elsewhere and are not used here to claim viability.</p><div class="profile-grid"><article><h3>Featured team</h3><ul>${core.map(row).join('')}</ul></article>${optional.length?`<article><h3>Flex / backup candidates</h3><ul>${optional.map(row).join('')}</ul></article>`:''}</div><a class="text-link" href="${base}/roster">Update My Roster →</a>`;
 }catch{
  host.innerHTML='<h2>Check this plan against My Roster</h2><p>Your saved roster could not be loaded. <a href="/roster">Open My Roster →</a></p>';
 }
}
