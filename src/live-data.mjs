const APPROVED_HOSTS=new Set(['playcontestofchampions.com','www.playcontestofchampions.com','forums.playcontestofchampions.com']);

function dateKey(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const date=new Date(`${value}T00:00:00Z`);
 return Number.isNaN(date.valueOf())||date.toISOString().slice(0,10)!==value?null:value;
}

function todayKey(now=new Date()){return now.toISOString().slice(0,10);}

export function eventState(event,now=new Date()){
 const today=todayKey(now);
 if(today<event.start)return 'upcoming';
 if(event.end&&today>event.end)return 'ended';
 return 'live';
}

export function isRecentlyEnded(event,now=new Date(),days=14){
 if(!event.end||eventState(event,now)!=='ended')return false;
 const elapsed=now.valueOf()-Date.parse(`${event.end}T23:59:59Z`);
 return elapsed>=0&&elapsed<=days*86400000;
}

export function validateLiveData(data){
 const errors=[];
 if(!data||data.version!==1)errors.push('Live data must use version 1.');
 if(!Array.isArray(data?.events))errors.push('Live data requires an events array.');
 if(!Array.isArray(data?.news))errors.push('Live data requires a news array.');
 const ids=new Set();
 for(const [kind,items] of [['event',data?.events||[]],['news',data?.news||[]]])for(const item of items){
  if(!item?.id||typeof item.id!=='string')errors.push(`${kind} entry is missing an id.`);
  else if(ids.has(item.id))errors.push(`Duplicate live item id: ${item.id}`);
  else ids.add(item.id);
  if(!item?.title||typeof item.title!=='string')errors.push(`${item?.id||kind} is missing a title.`);
  if(!item?.sourceUrl||typeof item.sourceUrl!=='string')errors.push(`${item?.id||kind} is missing a source URL.`);
  else try{const url=new URL(item.sourceUrl);if(url.protocol!=='https:'||!APPROVED_HOSTS.has(url.hostname))errors.push(`${item.id} source must be an approved official MCOC URL.`);}catch{errors.push(`${item.id} has an invalid source URL.`);}
  if(kind==='event'){
   if(!dateKey(item.start))errors.push(`${item.id} has an invalid start date.`);
   if(item.end!=null&&!dateKey(item.end))errors.push(`${item.id} has an invalid end date.`);
   if(item.end&&item.end<item.start)errors.push(`${item.id} ends before it starts.`);
  }else if(!dateKey(item.publishedAt))errors.push(`${item.id} has an invalid published date.`);
 }
 return errors;
}

export function liveSections(data,now=new Date()){
 const live=[],upcoming=[],ended=[];
 for(const event of data.events){
  const state=eventState(event,now);
  if(state==='live')live.push(event);
  else if(state==='upcoming')upcoming.push(event);
  else if(isRecentlyEnded(event,now))ended.push(event);
 }
 live.sort((a,b)=>(a.end||'9999-12-31').localeCompare(b.end||'9999-12-31'));
 upcoming.sort((a,b)=>a.start.localeCompare(b.start));
 ended.sort((a,b)=>(b.end||'').localeCompare(a.end||''));
 const news=[...data.news].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
 return {live,upcoming,ended,news};
}
