// Doomscrip progress is client-only; there are no network submissions.
const KEY='summonerindex:doomscrip-tracker:v1';
const sourceInputs=[...document.querySelectorAll('[data-ds-amount]')];
const milestoneInputs=[...document.querySelectorAll('[data-ds-milestone]')];
const victoriousInputs=[...document.querySelectorAll('[data-ds-v4]')];
const doomOwned=document.getElementById('ds-a1-doom-owned');
const a1Talismans=document.getElementById('ds-a1-talismans');
const spent=document.getElementById('ds-spent');
const format=value=>new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}).format(value);
const safe=value=>{const n=Number(value);return Number.isFinite(n)&&n>=0?Math.min(Math.trunc(n),9999999):0};
let storageAvailable=true;
let saved={amounts:{},spent:0,milestones:[],doomOwned:false,v4A2:[],a1Talismans:0};
try{const raw=localStorage.getItem(KEY);if(raw){const incoming=JSON.parse(raw);if(incoming&&typeof incoming==='object')saved={...saved,...incoming};}}catch{storageAvailable=false;}
if(!saved.amounts||typeof saved.amounts!=='object')saved.amounts={};
if(!Array.isArray(saved.milestones))saved.milestones=[];
if(!Array.isArray(saved.v4A2))saved.v4A2=[];
for(const el of sourceInputs){el.value=safe(saved.amounts[el.dataset.dsAmount]??0);}
spent.value=safe(saved.spent);
for(const el of milestoneInputs)el.checked=saved.milestones.includes(Number(el.dataset.dsMilestone));
for(const el of victoriousInputs)el.checked=saved.v4A2.includes(el.dataset.dsV4);
doomOwned.checked=saved.doomOwned===true;
a1Talismans.value=Math.min(100,safe(saved.a1Talismans));
const el=id=>document.getElementById(id);
function update(){
 const earned=sourceInputs.reduce((sum,input)=>sum+safe(input.value),0);
 const spentValue=safe(spent.value);
 const balance=earned-spentValue;
 const pct=Math.min(100,Math.round(earned/500000*100));
 el('ds-earned').textContent=format(earned);
 el('ds-balance').textContent=format(balance);
 el('ds-goal-percent').textContent=pct+'%';
 el('ds-goal-caption').textContent=earned>=500000?'You have recorded enough total lifetime earnings for the base Doom cost. Check your spendable balance before purchasing.':format(500000-earned)+' more recorded Doomscrip to reach the base cost.';
 el('ds-progress').setAttribute('aria-valuenow',String(Math.min(earned,500000)));
 el('ds-progress-fill').style.width=Math.min(100,earned/500000*100)+'%';
 // Show cumulative earnings versus the estimated full-spend route, not spendable currency.
 const a1Budget=945000;
 const a1EarnPct=Math.min(100,Math.round(earned/a1Budget*100));
 el('ds-a1-earned-progress').textContent=a1EarnPct+'%';
 el('ds-a1-meter').setAttribute('aria-valuenow',String(Math.min(earned,a1Budget)));
 el('ds-a1-meter-fill').style.width=(Math.min(100,earned/a1Budget*100))+'%';
 el('ds-a1-budget-caption').textContent=earned<a1Budget
   ? format(a1Budget-earned)+' in additional lifetime earnings to match the community full-cost estimate (actual required amount can differ).'
   : 'Your recorded lifetime earnings meet this community estimate; check spending, purchases, and all prerequisites separately.';
 const victoriousAtA2=victoriousInputs.filter(x=>x.checked).length;
 const talismansOwned=Math.min(100,safe(a1Talismans.value));
 const a1Steps=Number(doomOwned.checked)+Number(victoriousAtA2>=2)+Number(talismansOwned>=100);
 el('ds-a1-v4-count').textContent=Math.min(victoriousAtA2,2)+' / 2';
 el('ds-a1-ready-count').textContent=a1Steps+' / 3 steps';
 el('ds-a1-ready').textContent=a1Steps===3
    ? 'All three steps are marked complete. Check the live Armory and champion Ascension screen before completing A1.'
    : 'Remaining: '+[
      !doomOwned.checked?'unlock 7-Star Doom':null,
      victoriousAtA2<2?'get '+(2-victoriousAtA2)+' more Victorious Four to A2':null,
      talismansOwned<100?'collect '+(100-talismansOwned)+' more Doom Ascension Talismans':null
     ].filter(Boolean).join('; ')+'.';
 const markedMilestones=milestoneInputs.filter(x=>x.checked);
 const claimedWarScrip=markedMilestones.reduce((sum,x)=>sum+safe(x.dataset.dsReward),0);
 el('ds-war-claimed-currency').textContent=format(claimedWarScrip);
 el('ds-war-remaining-currency').textContent=format(Math.max(0,300000-claimedWarScrip));
 el('ds-milestones-count').textContent=markedMilestones.length;
 const output={amounts:Object.fromEntries(sourceInputs.map(x=>[x.dataset.dsAmount,safe(x.value)])),spent:spentValue,
  milestones:milestoneInputs.filter(x=>x.checked).map(x=>Number(x.dataset.dsMilestone)),
  doomOwned:doomOwned.checked,
  v4A2:victoriousInputs.filter(x=>x.checked).map(x=>x.dataset.dsV4),
  a1Talismans:talismansOwned};
 try{localStorage.setItem(KEY,JSON.stringify(output));}
 catch{storageAvailable=false;}
 el('ds-save-status').textContent=storageAvailable?'Saved on this device only. No data sent to Summoner Index.':'Browser storage is unavailable. Your changes may be lost when this page closes.';
}
for(const input of [...sourceInputs,spent,a1Talismans])input.addEventListener('input',update);
for(const input of [...milestoneInputs,...victoriousInputs,doomOwned])input.addEventListener('change',update);
el('ds-filter').addEventListener('change',e=>{
 const filter=e.target.value;
 for(const card of document.querySelectorAll('[data-ds-source]')){
  const status=card.querySelector('.ds-status');
  const uncertain=status.classList.contains('ds-status-unknown')||status.classList.contains('ds-status-pending');
  card.hidden=filter==='ongoing'?uncertain:filter==='uncertain'?!uncertain:false;
 }
});
// Explicit opt-in: milestone checkboxes alone never alter earned Doomscrip.
el('ds-war-sync').addEventListener('click',()=>{
 const source=sourceInputs.find(x=>x.dataset.dsAmount==='reclamation');
 if(!source)return;
 const claimedTotal=milestoneInputs.filter(x=>x.checked).reduce((n,x)=>n+safe(x.dataset.dsReward),0);
 const existing=safe(source.value);
 if(existing!==0&&existing!==claimedTotal&&!confirm(
   'Replace your previously entered Reclamation War Doomscrip ('+format(existing)+') with '+format(claimedTotal)+' from checked milestones?'
 ))return;
 source.value=claimedTotal;
 update();
 el('ds-save-status').textContent='Reclamation earnings updated from your checked milestones ('+format(claimedTotal)+' Doomscrip).';
});
el('ds-clear').addEventListener('click',()=>{
 if(!confirm('Reset all Doomscrip amounts, spending, Doom A1 prerequisites, 18 milestones on this device?'))return;
 for(const x of sourceInputs)x.value=0;
 spent.value=0;
 for(const x of [...milestoneInputs,...victoriousInputs,doomOwned])x.checked=false;
 a1Talismans.value=0;
 try{localStorage.removeItem(KEY);}catch{}
 update();
 el('ds-save-status').textContent='Your tracker was reset on this device.';
});
update();
