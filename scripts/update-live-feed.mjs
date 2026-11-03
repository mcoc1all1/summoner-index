import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateLiveData} from '../src/live-data.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'content','live.json');
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const FEED='https://forums.playcontestofchampions.com/en/categories/news-announcements/feed.rss';

const decode=value=>String(value||'')
 .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1')
 .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
 .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
 .trim();
const text=(block,tag)=>decode(block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,'i'))?.[1]||'');
const slug=value=>value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'announcement';
const category=title=>/battleground/i.test(title)?'battlegrounds':/alliance|war|quest/i.test(title)?'alliance':/champion|rework|balance/i.test(title)?'champions':/update|release|maintenance|hotfix|issue/i.test(title)?'updates':'event';
const isoDate=value=>{
 const date=new Date(value);
 return Number.isNaN(date.valueOf())?null:date.toISOString().slice(0,10);
};

const response=await fetch(FEED,{headers:{
 'user-agent':'Mozilla/5.0 (compatible; SummonerIndex/1.1; +https://mcoc1all1.github.io/summoner-index/)',
 'accept':'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5',
 'accept-language':'en-US,en;q=0.9'
}});

if(!response.ok){
 const temporary=response.status===403||response.status===429||response.status>=500;
 if(temporary){
  console.warn(`Official feed unavailable (${response.status}); keeping the last reviewed Events & News data and ending cleanly.`);
  process.exit(0);
 }
 throw new Error(`Official feed request failed: ${response.status}`);
}

const xml=await response.text();
const items=[...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(match=>match[1]);
if(!items.length){
 console.warn('Official feed returned no RSS items; keeping the last reviewed Events & News data and ending cleanly.');
 process.exit(0);
}

const known=new Set(data.news.map(item=>item.sourceUrl));
let added=0;
for(const block of items){
 const title=text(block,'title');
 const sourceUrl=text(block,'link');
 const publishedAt=isoDate(text(block,'pubDate'));
 if(!title||!publishedAt||known.has(sourceUrl))continue;
 let url;
 try{url=new URL(sourceUrl);}catch{continue;}
 if(url.protocol!=='https:'||url.hostname!=='forums.playcontestofchampions.com')continue;
 data.news.push({
  id:`auto-${publishedAt}-${slug(title)}`,
  title,
  category:category(title),
  publishedAt,
  summary:'Official MCOC announcement. Open the source for full details; interpretation and event-date extraction are reviewed separately.',
  sourceUrl:url.href,
  sourceName:'Official MCOC forum',
  managed:'auto'
 });
 known.add(url.href);
 added++;
}

data.news.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||a.title.localeCompare(b.title));
data.checkedAt=new Date().toISOString().slice(0,10);
const errors=validateLiveData(data);
if(errors.length)throw new Error(errors.join('\n'));
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log(added?`Added ${added} new official announcement${added===1?'':'s'} for automatic publication.`:'No new official announcements.');
