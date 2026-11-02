const DAY=86400000;
const source=document.querySelector('#live-event-source');
const filters=[...document.querySelectorAll('[data-live-filter]')];
const format=value=>new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(`${value}T00:00:00Z`));
const todayKey=()=>new Date().toISOString().slice(0,10);

function classify(card){
 const today=todayKey(),start=card.dataset.start,end=card.dataset.end;
 if(today<start)return 'upcoming';
 if(end&&today>end){
  const elapsed=Date.now()-Date.parse(`${end}T23:59:59Z`);
  return elapsed<=14*DAY?'ended':'archive';
 }
 return 'live';
}

function relative(card,state){
 const start=card.dataset.start,end=card.dataset.end;
 const today=Date.parse(`${todayKey()}T00:00:00Z`);
 if(state==='upcoming'){
  const days=Math.max(0,Math.ceil((Date.parse(`${start}T00:00:00Z`)-today)/DAY));
  return days===0?'Starts today':days===1?'Starts tomorrow':`Starts in ${days} days`;
 }
 if(state==='live'&&end){
  const days=Math.max(0,Math.ceil((Date.parse(`${end}T23:59:59Z`)-Date.now())/DAY));
  return days===0?'Ends today':days===1?'Ends tomorrow':`Ends in ${days} days`;
 }
 return state==='live'?'Live now':'Recently ended';
}

function placeEvents(){
 if(!source)return;
 const cards=[...source.querySelectorAll('[data-live-event]')];
 for(const card of cards){
  const state=classify(card);
  if(state==='archive'){card.remove();continue;}
  const target=document.querySelector(`[data-live-target="${state}"]`);
  const badge=card.querySelector('[data-live-status]');
  if(badge){badge.textContent=relative(card,state);badge.dataset.state=state;}
  if(target)target.append(card);
 }
 for(const state of ['live','upcoming','ended']){
  const target=document.querySelector(`[data-live-target="${state}"]`);
  const count=target?.children.length||0;
  const label=document.querySelector(`[data-count-for="${state}"]`);
  const empty=document.querySelector(`[data-empty-for="${state}"]`);
  if(label)label.textContent=`${count} ${count===1?'item':'items'}`;
  if(empty)empty.hidden=count>0;
 }
 source.remove();
}

function applyFilter(value){
 document.querySelectorAll('.live-card,.news-card').forEach(card=>{
  const category=card.querySelector('.live-category')?.textContent?.trim().toLowerCase()||card.dataset.newsCategory||'';
  card.hidden=value!=='all'&&category!==value;
 });
 filters.forEach(button=>button.classList.toggle('active',button.dataset.liveFilter===value));
}

placeEvents();
filters.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.liveFilter)));
