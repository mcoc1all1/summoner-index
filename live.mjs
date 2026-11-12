const DAY=86400000;
const source=document.querySelector('#live-event-source');
const filters=[...document.querySelectorAll('[data-live-filter]')];
const format=value=>new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(`${value}T00:00:00Z`));
// Kabam's published event dates use a Pacific calendar. Never use each
// visitor's timezone to move an event into 'ongoing' before its Pacific date.
const todayKey=()=>{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const value=type=>parts.find(part=>part.type===type)?.value;
 return value('year')+'-'+value('month')+'-'+value('day');
};

function classify(card){
 const today=todayKey(),start=card.dataset.start,end=card.dataset.end;
 // A published start date without an exact start hour is not proof that
 // the event has opened. Keep it in the scheduled section on day one.
 if(today<=start)return 'upcoming';
 // Date-only announcements have no verified end date. Do not label them
 // active indefinitely after their scheduled start.
 if(!end)return 'archive';
 if(today>end){
  const elapsed=Date.parse(`${today}T00:00:00Z`)-Date.parse(`${end}T00:00:00Z`);
  return elapsed<=14*DAY?'ended':'archive';
 }
 return 'live';
}

function relative(card,state){
 const start=card.dataset.start,end=card.dataset.end;
 const today=Date.parse(`${todayKey()}T00:00:00Z`);
 if(state==='upcoming'){
  const days=Math.max(0,Math.round((Date.parse(`${start}T00:00:00Z`)-today)/DAY));
  return days===0?'Scheduled today · check game':days===1?'Starts tomorrow (PT)':`Starts in ${days} days (PT)`;
 }
 if(state==='live'&&end){
  const days=Math.max(0,Math.round((Date.parse(`${end}T00:00:00Z`)-today)/DAY));
  return days===0?'Scheduled to end today (PT)':days===1?'Ends tomorrow (PT)':`Scheduled to end in ${days} days (PT)`;
 }
 return state==='live'?'Scheduled ongoing · check game':'Recently ended';
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
 source.remove();
}

function applyFilter(value){
 document.querySelectorAll('.live-card,.news-card').forEach(card=>{
  const category=card.querySelector('.live-category')?.textContent?.trim().toLowerCase()||card.dataset.newsCategory||'';
  card.hidden=value!=='all'&&category!==value;
 });
 filters.forEach(button=>{
  const selected=button.dataset.liveFilter===value;
  button.classList.toggle('active',selected);
  button.setAttribute('aria-pressed',String(selected));
 });
 for(const state of ['live','upcoming','ended']){
  const target=document.querySelector(`[data-live-target="${state}"]`);
  const count=target?[...target.children].filter(card=>!card.hidden).length:0;
  const label=document.querySelector(`[data-count-for="${state}"]`);
  const empty=document.querySelector(`[data-empty-for="${state}"]`);
  if(label)label.textContent=`${count} ${count===1?'item':'items'}`;
  if(empty)empty.hidden=count>0;
 }
 const news=document.querySelector('#latest-news .live-grid');
 const newsCount=news?[...news.children].filter(card=>!card.hidden).length:0;
 const newsEmpty=document.querySelector('[data-empty-news]');
 if(newsEmpty)newsEmpty.hidden=newsCount>0;
}

placeEvents();
applyFilter('all');
filters.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.liveFilter)));
