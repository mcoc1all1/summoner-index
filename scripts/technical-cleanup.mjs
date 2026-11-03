import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {basePath} from '../src/deployment.mjs';
import {siteOrigin} from '../src/build-safety.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const base=basePath(process.env.SITE_BASE_PATH||'');
const origin=siteOrigin(process.env.SITE_ORIGIN||'https://contest-fieldguide.rt119.chatgpt.site');

function readJson(relative){
 const file=path.join(root,relative);
 return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
}
const catalog=readJson('content/catalog.json');
const live=readJson('content/live.json');
const masteries=readJson('content/masteries.json');
const dates=[catalog.reviewedAt,live.checkedAt,masteries.reviewedAt].filter(value=>/^\d{4}-\d{2}-\d{2}$/.test(value||''));
const latestReview=dates.sort().at(-1)||new Date().toISOString().slice(0,10);

function walk(dir,callback){
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,item.name);
  if(item.isDirectory())walk(file,callback);
  else if(item.name.endsWith('.html'))callback(file);
 }
}

// Events & News is the public route. Keep /live only as a backwards-compatible redirect.
const legacyDir=path.join(out,'live');
const eventsDir=path.join(out,'events');
if(fs.existsSync(legacyDir)){
 fs.rmSync(eventsDir,{recursive:true,force:true});
 fs.renameSync(legacyDir,eventsDir);
}

walk(out,file=>{
 let html=fs.readFileSync(file,'utf8');
 // Rewrite navigation/callout links only. Keep the browser module filename live.mjs intact.
 html=html
  .replaceAll(`href="${base}/live"`,`href="${base}/events"`)
  .replaceAll(`href="${base}/live?`,`href="${base}/events?`)
  .replaceAll('data-page="/live"','data-page="/events"');
 fs.writeFileSync(file,html);
});

if(fs.existsSync(eventsDir)){
 const eventsFile=path.join(eventsDir,'index.html');
 let html=fs.readFileSync(eventsFile,'utf8');
 html=html
  .replace(/<link rel="canonical" href="[^"]*">/,`<link rel="canonical" href="${origin}${base}/events">`)
  .replace(/<meta property="og:url" content="[^"]*">/,`<meta property="og:url" content="${origin}${base}/events">`)
  .replace('data-page="/live"','data-page="/events"');
 fs.writeFileSync(eventsFile,html);
}

fs.mkdirSync(legacyDir,{recursive:true});
const redirectTarget=`${base}/events`;
fs.writeFileSync(path.join(legacyDir,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Events & News | Summoner Index · MCOC</title><meta name="description" content="Events & News has moved to the current Summoner Index events route."><meta name="robots" content="noindex,follow"><link rel="canonical" href="${origin}${base}/events"><meta http-equiv="refresh" content="0; url=${redirectTarget}"><script>location.replace(${JSON.stringify(redirectTarget)}+location.search+location.hash)</script></head><body><p class="beta-bar"><strong>Public beta</strong> <a href="${base}/methodology">How recommendations are sourced →</a></p><main><h1>Events & News moved</h1><p>Continue to <a href="${redirectTarget}">Events & News</a>.</p></main></body></html>`);

// Keep the intentionally small beta sitemap, but make lastmod reflect the newest reviewed content.
const sitemap=path.join(out,'sitemap.xml');
if(fs.existsSync(sitemap)){
 let xml=fs.readFileSync(sitemap,'utf8');
 xml=xml.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,`<lastmod>${latestReview}</lastmod>`);
 fs.writeFileSync(sitemap,xml);
}

// Regression guard: privacy documentation must name the real storage key.
const privacy=path.join(out,'privacy','index.html');
if(fs.existsSync(privacy)){
 const html=fs.readFileSync(privacy,'utf8');
 if(!html.includes('<code>fieldguide:saved</code>'))throw new Error('Privacy page no longer documents the actual fieldguide:saved storage key.');
}

console.log(`Applied technical consistency pass. Events canonical: /events. Sitemap lastmod: ${latestReview}.`);
