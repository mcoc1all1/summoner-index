import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {basePath,localAttributes} from '../src/deployment.mjs';
import {escapeHtml as e} from '../src/domain.mjs';
import {championProfilePage} from '../src/champion-profile.mjs';
import {publicResearchView} from '../src/publication-safety.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const sourceDb=JSON.parse(fs.readFileSync(path.join(root,'content/catalog.json'),'utf8'));
const db=process.env.PUBLIC_BETA==='1'?publicResearchView(sourceDb):sourceDb;
const base=basePath(process.env.SITE_BASE_PATH||'');
const opponents=[...db.champions,...db.bosses];
const notice='<p class="coverage-link"><a href="/coverage">Content coverage</a> · <a href="/methodology">Sources & methodology</a></p>';

function championVideos(c){
 const videos=db.videos.filter(v=>v.championIds?.includes(c.id));
 if(!videos.length)return '';
 return '<section class="panel"><h2>Related videos</h2>'+videos.map(v=>`<a class="video-link" href="https://www.youtube.com/watch?v=${e(v.youtubeId)}" target="_blank" rel="noopener noreferrer">▶ ${e(v.title)} ↗</a><p class="muted">${e(v.note)} <a href="${e(v.discoveryUrl)}" target="_blank" rel="noopener noreferrer">Discovery reference ↗</a></p>`).join('')+'</section>';
}

for(const c of db.champions){
 const file=path.join(out,'champions',c.id,'index.html');
 if(!fs.existsSync(file))throw new Error(`Missing generated champion page: ${c.id}`);
 const incoming=db.counters.filter(row=>row.defenderId===c.id);
 const outgoing=db.counters.filter(row=>row.attackerId===c.id);
 const body=localAttributes(championProfilePage(db,c,{incoming,outgoing,opponents,videosHtml:championVideos(c),noticeHtml:notice}),base);
 let html=fs.readFileSync(file,'utf8');
 const main=/((?:<main\b[^>]*>)[\s\S]*?<p class="beta-bar">[\s\S]*?<\/p>)[\s\S]*?(<\/main>)/;
 if(!main.test(html))throw new Error(`Champion page shell changed; cannot enhance ${c.id}`);
 html=html.replace(main,`$1${body}$2`);
 const stylesheet=`<link rel="stylesheet" href="${base}/champion-profile.css">`;
 if(!html.includes('champion-profile.css'))html=html.replace('</head>',`${stylesheet}</head>`);
 fs.writeFileSync(file,html);
}

fs.copyFileSync(path.join(root,'src/champion-profile.css'),path.join(out,'champion-profile.css'));
console.log(`Enhanced ${db.champions.length} champion kit pages.`);
