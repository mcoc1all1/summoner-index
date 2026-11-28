// Doomscrip progress is client-only; there are no network submissions.
const KEY='summonerindex:doomscrip-tracker:v1';
const sourceInputs=[...document.querySelectorAll('[data-ds-amount]')];
const milestoneInputs=[...document.querySelectorAll('[data-ds-milestone]')];
const weekInputs=[...document.querySelectorAll('[data-ds-week]')];
const spent=document.getElementById('ds-spent');
const format=value=>new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}).format(value);
const safe=value=>{const n=Number(value);return Number.isFinite(n)&&n>=0?Math.min(Math.trunc(n),9999999):0};
let storageAvailable=true;
let saved={amounts:{},spent:0,milestones:[],weeks:[]};
try{const raw=localStorage.getItem(KEY);if(raw){const incoming=JSON.parse(raw);if(incoming&&typeof incoming==='object')saved={...saved,...incoming};}}catch{storageAvailable=false;}
if(!saved.amounts||typeof saved.amounts!=='object')saved.amounts={};
if(!Array.isArray(saved.milestones))saved.milestones=[];
if(!Array.isArray(saved.weeks))saved.weeks=[];
for(const el of sourceInputs){el.value=safe(saved.amounts[el.dataset.dsAmount]??0);}
spent.value=safe(saved.spent);
for(const el of milestoneInputs)el.checked=saved.milestones.includes(Number(el.dataset.dsMilestone));
for(const el of weekInputs)el.checked=saved.weeks.includes(el.dataset.dsWeek);
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
 el('ds-milestones-count').textContent=milestoneInputs.filter(x=>x.checked).length;
 const checkedWeeks=weekInputs.filter(x=>x.checked).length;
 el('ds-weekly-count').textContent=checkedWeeks+' / '+weekInputs.length+' activities checked';
 el('ds-weekly-meter').setAttribute('aria-valuenow',String(checkedWeeks));
 el('ds-weekly-fill').style.width=(checkedWeeks/weekInputs.length*100)+'%';
 for(let n=1;n<=9;n++)el('ds-week-progress-'+n).textContent=weekInputs.filter(x=>x.checked&&x.dataset.dsWeek.startsWith(n+'-')).length+' / 3';
 const output={amounts:Object.fromEntries(sourceInputs.map(x=>[x.dataset.dsAmount,safe(x.value)])),spent:spentValue,
  milestones:milestoneInputs.filter(x=>x.checked).map(x=>Number(x.dataset.dsMilestone)),
  weeks:weekInputs.filter(x=>x.checked).map(x=>x.dataset.dsWeek)};
 try{localStorage.setItem(KEY,JSON.stringify(output));}
 catch{storageAvailable=false;}
 el('ds-save-status').textContent=storageAvailable?'Saved on this device only. No data sent to Summoner Index.':'Browser storage is unavailable. Your changes may be lost when this page closes.';
}
for(const input of [...sourceInputs,spent])input.addEventListener('input',update);
for(const input of [...milestoneInputs,...weekInputs])input.addEventListener('change',update);
el('ds-filter').addEventListener('change',e=>{
 const filter=e.target.value;
 for(const card of document.querySelectorAll('[data-ds-source]')){
  const status=card.querySelector('.ds-status');
  const uncertain=status.classList.contains('ds-status-unknown')||status.classList.contains('ds-status-pending');
  card.hidden=filter==='ongoing'?uncertain:filter==='uncertain'?!uncertain:false;
 }
});
el('ds-clear').addEventListener('click',()=>{
 if(!confirm('Reset all recorded Doomscrip amounts, spending, 18 milestones and weekly checks on this device?'))return;
 for(const x of sourceInputs)x.value=0;
 spent.value=0;
 for(const x of [...milestoneInputs,...weekInputs])x.checked=false;
 try{localStorage.removeItem(KEY);}catch{}
 update();
 el('ds-save-status').textContent='Your tracker was reset on this device.';
});
update();
