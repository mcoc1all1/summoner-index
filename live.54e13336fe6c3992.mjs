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

const mobileQuery=typeof window!=='undefined'&&window.matchMedia?window.matchMedia('(max-width:800px)'):{matches:false,addEventListener(){}};
const editorialNotes=[...document.querySelectorAll('main#main > .live-editorial-note')];
const jump=document.querySelector('.live-jump');
const latestNews=document.querySelector('#latest-news');
const editorialGroup=editorialNotes.length&&document.createElement?document.createElement('section'):null;
if(editorialGroup){
 editorialGroup.id='editorial-updates';
 editorialGroup.className='live-mobile-context';
 editorialGroup.setAttribute('aria-label','Official context and clarifications');
 const title=document.createElement('h2');
 title.textContent='Official context & clarifications';
 editorialGroup.append(title);
}
let activeCategory='all',newsExpanded=false;
function updateMobileLayout(){
 if(editorialGroup&&jump&&latestNews){
  if(mobileQuery.matches){
   if(!editorialGroup.isConnected)latestNews.after(editorialGroup);
   for(const note of editorialNotes)editorialGroup.append(note);
  }else{
   for(const note of editorialNotes)jump.before(note);
   editorialGroup.remove();
  }
 }
 for(const item of document.querySelectorAll('.live-card-details'))item.open=!mobileQuery.matches;
 if(document.body)document.body.classList.toggle('events-mobile-ready',mobileQuery.matches);
 applyFilter(activeCategory);
}
function applyFilter(value){
 activeCategory=value;
 for(const card of document.querySelectorAll('.live-card'))card.hidden=value!=='all'&&card.dataset.category!==value;
 const matchingNews=[...document.querySelectorAll('.news-card')].filter(card=>value==='all'||card.dataset.category===value);
 const limit=mobileQuery.matches&&!newsExpanded?4:Infinity;
 const accepted=new Set(matchingNews.slice(0,limit));
 for(const card of document.querySelectorAll('.news-card'))card.hidden=!accepted.has(card);
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
 const visible=matchingNews.filter(card=>!card.hidden).length;
 const emptyNews=document.querySelector('[data-empty-news]');
 if(emptyNews)emptyNews.hidden=visible>0;
 const count=document.querySelector('.live-news-count');
 if(count)count.textContent=mobileQuery.matches?`Showing ${visible} of ${matchingNews.length} updates`:'';
 const more=document.querySelector('#live-more-news');
 if(more){
  more.hidden=!mobileQuery.matches||matchingNews.length<=4;
  more.textContent=newsExpanded?'Show fewer updates':`Show ${matchingNews.length-visible} older updates`;
  more.setAttribute('aria-expanded',String(newsExpanded));
  more.setAttribute('aria-controls','latest-news');
 }
}

placeEvents();
updateMobileLayout();
filters.forEach(button=>button.addEventListener('click',()=>{newsExpanded=false;applyFilter(button.dataset.liveFilter);}));
const moreNews=document.querySelector('#live-more-news');
if(moreNews)moreNews.addEventListener('click',()=>{newsExpanded=!newsExpanded;applyFilter(activeCategory);});
mobileQuery.addEventListener('change',()=>{newsExpanded=false;updateMobileLayout();});
