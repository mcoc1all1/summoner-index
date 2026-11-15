/* A real player-operated checklist, not a fabricated XP, fight result or reward.
   Per-boss progress is private to this browser; no network requests or analytics.
   Every checkbox is usable even when storage is blocked. */
const panel=document.querySelector('[data-boss-prep]');
if(panel){
 const bossId=panel.getAttribute('data-boss-prep');
 const key='summonerindex:boss-prep:v1:'+bossId;
 const boxes=[...panel.querySelectorAll('input[data-prep-step]')];
 const progress=panel.querySelector('progress');
 const status=panel.querySelector('[data-prep-progress]');
 const note=panel.querySelector('[data-prep-note]');
 const reset=panel.querySelector('[data-prep-reset]');
 let storageEnabled=true;
 function read(){
  try{
   const raw=JSON.parse(localStorage.getItem(key)||'[]');
   return Array.isArray(raw)?raw.filter(x=>typeof x==='string'&&boxes.some(b=>b.dataset.prepStep===x)):[];
  }catch{return [];}
 }
 function paint(){
  const checked=boxes.filter(box=>box.checked).length;
  progress.value=checked;
  progress.textContent=checked+' of '+boxes.length;
  status.textContent=checked+' of '+boxes.length+' checked';
  panel.dataset.prepComplete=String(checked===boxes.length);
  note.textContent=checked===boxes.length?
   'Checklist complete · confirm current in-game conditions before entering.':
   storageEnabled?'Progress saved only in this browser.':'Progress is available for this visit; browser storage is blocked.';
  reset.hidden=checked===0;
 }
 function store(){
  try{localStorage.setItem(key,JSON.stringify(boxes.filter(box=>box.checked).map(box=>box.dataset.prepStep)));}
  catch{storageEnabled=false;}
  paint();
 }
 function applySaved(){
  const saved=new Set(read());
  for(const box of boxes)box.checked=saved.has(box.dataset.prepStep);
  paint();
 }
 for(const box of boxes)box.addEventListener('change',store);
 reset?.addEventListener('click',()=>{
  for(const box of boxes)box.checked=false;
  store();
  boxes[0]?.focus();
 });
 window.addEventListener('storage',event=>{
  if(event.key===key||event.key===null)applySaved();
 });
 applySaved();
}
