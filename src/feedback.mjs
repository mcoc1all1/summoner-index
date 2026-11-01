import {readRoster} from './roster.mjs';
import {escapeHtml as e} from './domain.mjs';

export function feedbackPage(value,origin,base='') {
 try {
  const url=new URL(value||base+'/',origin);
  if(url.origin!==origin || (base && url.pathname!==base && !url.pathname.startsWith(base+'/')))throw Error();
  return origin+url.pathname;
 } catch {return origin+base+'/';}
}
export function feedbackText(kind,page,details) {
 return `Fieldguide feedback: ${kind}\nPage: ${page}\n\n${details.trim()}`;
}

async function mountChallengeRoster(){
 const host=document.querySelector('[data-challenge-roster]');if(!host)return;
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
  host.innerHTML=`<h2>Check this plan against My Roster</h2><p><strong>${ownedCore.length}/${core.length} featured team members are saved as owned.</strong> ${confirmedSeven.length}/${core.length} are explicitly saved as 7★.</p><p class="muted">Rarity is checked only when you saved it. Rank and Ascension are not used here to claim viability.</p><div class="profile-grid"><article><h3>Featured team</h3><ul>${core.map(row).join('')}</ul></article>${optional.length?`<article><h3>Flex / backup candidates</h3><ul>${optional.map(row).join('')}</ul></article>`:''}</div><a class="text-link" href="${base}/roster">Update My Roster →</a>`;
 }catch{
  host.innerHTML='<h2>Check this plan against My Roster</h2><p>Your saved roster could not be loaded. <a href="/roster">Open My Roster →</a></p>';
 }
}

if(typeof document!=='undefined') {
 mountChallengeRoster();
 const form=document.querySelector('#feedback-form');
 if(form) {
  const field=id=>document.getElementById(id);
  field('feedback-page').value=feedbackPage(new URLSearchParams(location.search).get('path'),location.origin,document.body.dataset.base||'');
  const prepare=()=>{const text=feedbackText(field('feedback-kind').value,field('feedback-page').value,field('feedback-details').value);field('feedback-draft').value=text;return text;};
  form.addEventListener('input',prepare);prepare();
  form.addEventListener('submit',event=>{
   event.preventDefault();const text=prepare();
   field('feedback-status').textContent='Opening an email draft. Nothing has been sent by this website. If no email app opens, copy the text below and email mcoc1all1@proton.me.';
   location.href='mailto:mcoc1all1@proton.me?subject='+encodeURIComponent('Fieldguide: '+field('feedback-kind').value)+'&body='+encodeURIComponent(text);
  });
  field('feedback-copy').addEventListener('click',async()=>{
   const text=prepare();
   try {await navigator.clipboard.writeText(text);field('feedback-status').textContent='Copied. Paste into an email to mcoc1all1@proton.me.';}
   catch {field('feedback-draft').focus();field('feedback-draft').select();field('feedback-status').textContent='Copy the selected text manually and email mcoc1all1@proton.me.';}
  });
 }
}
