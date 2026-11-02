import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {basePath,localAttributes} from '../src/deployment.mjs';
import {siteOrigin} from '../src/build-safety.mjs';
import {validateLiveData} from '../src/live-data.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const base=basePath(process.env.SITE_BASE_PATH||'');
const origin=siteOrigin(process.env.SITE_ORIGIN||'https://contest-fieldguide.rt119.chatgpt.site');
const beta=process.env.PUBLIC_BETA==='1';
const data=JSON.parse(fs.readFileSync(path.join(root,'content','live.json'),'utf8'));
const errors=validateLiveData(data);
if(errors.length)throw new Error(errors.join('\n'));

const e=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const dateLabel=value=>new Intl.DateTimeFormat('en',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`));
const eventCard=item=>`<article class="panel live-card" data-live-event data-category="${e(item.category)}" data-start="${e(item.start)}" data-end="${e(item.end||'')}"><div class="live-card-top"><span class="live-status" data-live-status>Scheduled</span><span class="live-category">${e(item.category)}</span></div><h3>${e(item.title)}</h3><p>${e(item.summary)}</p><p class="live-dates"><strong>${dateLabel(item.start)}</strong>${item.end?` – <strong>${dateLabel(item.end)}</strong>`:''}</p><div class="live-card-actions"><a class="text-link" href="${e(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Official source ↗</a></div></article>`;
const newsCard=item=>`<article class="panel news-card" data-category="${e(item.category)}"><div class="live-card-top"><span class="live-category">${e(item.category)}</span><time datetime="${e(item.publishedAt)}">${dateLabel(item.publishedAt)}</time></div><h3>${e(item.title)}</h3><p>${e(item.summary)}</p><a class="text-link" href="${e(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Read official announcement ↗</a></article>`;

const template=fs.readFileSync(path.join(out,'index.html'),'utf8');
const title='Events & News | Summoner Index · MCOC';
const description='Ongoing and upcoming MCOC events, official announcements, game updates and recently ended events.';
const rawBody=`<p class="beta-bar"><strong>Public beta</strong> <a href="/methodology">How recommendations are sourced →</a></p><section class="hero live-hero"><span class="eyebrow">MCOC UPDATES</span><h1>Events & News</h1><p>What is live, what is coming next, and the latest official MCOC announcements. Event dates are curated from official sources; safe announcement metadata from the official feed publishes automatically after validation.</p><div class="live-freshness"><span class="status-dot"></span> Official sources checked <strong>${e(data.checkedAt)}</strong></div></section><nav class="quick-row live-jump" aria-label="Events and news page sections"><a href="#live-now">Live now</a><a href="#coming-up">Coming up</a><a href="#latest-news">Latest news</a><a href="#recently-ended">Recently ended</a></nav><div class="live-filter-bar" role="group" aria-label="Events and news category"><button class="active" data-live-filter="all">All</button><button data-live-filter="battlegrounds">Battlegrounds</button><button data-live-filter="alliance">Alliance</button><button data-live-filter="champions">Champions</button><button data-live-filter="updates">Updates</button><button data-live-filter="event">Events</button></div><section class="live-section" id="live-now"><div class="section-head"><div><span class="eyebrow">ONGOING</span><h2>Live now</h2></div><span class="live-count" data-count-for="live">0</span></div><div class="live-grid" data-live-target="live"></div><p class="empty" data-empty-for="live" hidden>No reviewed events are live right now.</p></section><section class="live-section" id="coming-up"><div class="section-head"><div><span class="eyebrow">UPCOMING</span><h2>Coming up</h2></div><span class="live-count" data-count-for="upcoming">0</span></div><div class="live-grid" data-live-target="upcoming"></div><p class="empty" data-empty-for="upcoming" hidden>No reviewed upcoming events are currently listed.</p></section><section class="live-section" id="latest-news"><div class="section-head"><div><span class="eyebrow">OFFICIAL ANNOUNCEMENTS</span><h2>Latest news & updates</h2></div></div><div class="live-grid news-grid">${data.news.map(newsCard).join('')}</div></section><section class="live-section" id="recently-ended"><div class="section-head"><div><span class="eyebrow">RECENT</span><h2>Recently ended</h2></div><span class="live-count" data-count-for="ended">0</span></div><div class="live-grid" data-live-target="ended"></div><p class="empty" data-empty-for="ended" hidden>No events ended in the last 14 days.</p></section><div id="live-event-source" hidden>${data.events.map(eventCard).join('')}</div><section class="panel live-source-note"><h2>How this stays current</h2><p>Event dates are reviewed against official MCOC sources. Safe metadata for new official News & Announcements posts is published automatically after validation; interpreted dates, mechanics, rewards and recommendations remain review-only. Status labels are calculated from the published dates in your browser.</p><div class="quick-row">${data.sources.map(source=>`<a href="${e(source.url)}" target="_blank" rel="noopener noreferrer">${e(source.name)} ↗</a>`).join('')}</div></section><script type="module" src="/live.mjs"></script>`;
const body=localAttributes(rawBody,base);

let html=template
 .replace(/<title>[\s\S]*?<\/title>/,`<title>${title}</title>`)
 .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${e(description)}">`)
 .replace(/<meta name="robots" content="[^"]*">/,`<meta name="robots" content="${beta?'noindex,follow':'index,follow'}">`)
 .replace(/<link rel="canonical" href="[^"]*">/,`<link rel="canonical" href="${origin}${base}/live">`)
 .replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="Events & News · Summoner Index">`)
 .replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${e(description)}">`)
 .replace(/<meta property="og:url" content="[^"]*">/,`<meta property="og:url" content="${origin}${base}/live">`)
 .replace(/<main id="main" tabindex="-1">[\s\S]*?<\/main>/,`<main id="main" tabindex="-1">${body}</main>`)
 .replace('data-page="/"','data-page="/live"');
fs.mkdirSync(path.join(out,'live'),{recursive:true});
fs.writeFileSync(path.join(out,'live','index.html'),html);
fs.writeFileSync(path.join(out,'live.mjs'),fs.readFileSync(path.join(root,'src','live.mjs'),'utf8'));

function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,item.name);
 if(item.isDirectory())walk(file);
 else if(item.name.endsWith('.html')){
  let text=fs.readFileSync(file,'utf8');
  if(!text.includes('href="'+base+'/live"')&&text.includes('<nav aria-label="Main navigation">'))text=text.replace('<nav aria-label="Main navigation">','<nav aria-label="Main navigation"><a href="'+base+'/live"><i aria-hidden="true">●</i>Events &amp; News</a>');
  if(file===path.join(out,'live','index.html'))text=text.replace(/<nav aria-label="Main navigation">[\s\S]*?<\/nav>/,nav=>nav.replace(/\sclass="active"\saria-current="page"/g,'').replace(`href="${base}/live"`,`href="${base}/live" class="active" aria-current="page"`));
  fs.writeFileSync(file,text);
 }
}}
walk(out);

const home=path.join(out,'index.html');
let homeHtml=fs.readFileSync(home,'utf8');
if(!homeHtml.includes('EVENTS & NEWS'))homeHtml=homeHtml.replace('<div class="workspace-grid">',`<section class="panel live-home-callout"><span class="eyebrow">EVENTS & NEWS</span><h2>What’s happening in MCOC?</h2><p>See ongoing events, what starts next and the latest official announcements.</p><a class="primary" href="${base}/live">Open Events & News →</a></section><div class="workspace-grid">`);
fs.writeFileSync(home,homeHtml);

console.log('Generated Events & News hub.');
