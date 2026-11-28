// Automatic content fingerprinting for the published Summoner Index branch.
// Runs on every site-publish push; uses only Node built-ins. Does not alter SEO,
// metadata, AdSense, HTML page content, or third-party URLs.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const staticExt=/\.(?:mjs|js|css|json)$/;
const fingerprinted=/^(.+)\.([a-f\d]{16})\.(mjs|js|css|json)$/;
const names=fs.readdirSync(root).filter(n=>
 staticExt.test(n)&&!fingerprinted.test(n)&&n!=='asset-manifest.json'&&
 fs.statSync(path.join(root,n)).isFile()
).sort();
if(!names.length)throw new Error('No stable browser assets found at published site root');
const stable=new Map(names.map(n=>[n,fs.readFileSync(path.join(root,n),'utf8')]));
const version=createHash('sha256').update(JSON.stringify(['',[...stable]])).digest('hex').slice(0,16);
const assets=Object.fromEntries(names.map(n=>[n,n.replace(/(\.[^.]+)$/,'.'+version+'$1')]));
// Resolve a stable filename OR an older content-hashed filename to the current version.
const current=name=>{
 if(Object.hasOwn(assets,name))return assets[name];
 const match=name.match(fingerprinted);
 if(!match)return null;
 const original=match[1]+'.'+match[3];
 return assets[original]||null;
};
const refs=/(['"])(\.\/|\/)([^'"\s?#+]+\.(?:mjs|js|css|json))\1/g;
let assetFiles=0;
for(const [name,original] of stable){
 let output=original;
 if(/\.(?:mjs|js|css)$/.test(name)){
  output=output.replace(refs,(whole,quote,prefix,file)=>{
   const next=current(file);
   return next?quote+prefix+next+quote:whole;
  });
 }
 const destination=path.join(root,assets[name]);
 if(!fs.existsSync(destination)||fs.readFileSync(destination,'utf8')!==output){
  fs.writeFileSync(destination,output);
  assetFiles++;
 }
}
let pagesChanged=0,linkedAssets=0,visited=0;
const visit=dir=>{
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.name==='.git'||entry.name==='node_modules')continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){visit(file);continue;}
  if(!entry.isFile()||!entry.name.endsWith('.html'))continue;
  visited++;
  const old=fs.readFileSync(file,'utf8');
  const updated=old.replace(/\b(src|href)="([^"]+)"/g,(whole,attribute,url)=>{
   if(!url.startsWith('/')||url.startsWith('//'))return whole;
   const pathname=url.split(/[?#]/,1)[0];
   const name=pathname.slice(1);
   if(name.includes('/'))return whole;
   const next=current(name);
   if(!next)return whole;
   linkedAssets++;
   return attribute+'="/'+next+url.slice(pathname.length)+'"';
  });
  if(updated!==old){fs.writeFileSync(file,updated);pagesChanged++;}
 }
};
visit(root);
const manifest=JSON.stringify({version,assets},null,2)+'\n';
if(!fs.existsSync(path.join(root,'asset-manifest.json'))||
 fs.readFileSync(path.join(root,'asset-manifest.json'),'utf8')!==manifest){
 fs.writeFileSync(path.join(root,'asset-manifest.json'),manifest);
}
// Owner-authorized indexing policy for exactly two public pages.
// Run on every site-publish push so a regenerated HTML/sitemap cannot silently
// restore an old noindex state. Other pages' robots directives stay untouched.
const indexablePages=['tools','doomscrip'];
let indexingChanges=0;
for(const slug of indexablePages){
 const htmlFile=path.join(root,slug,'index.html');
 if(!fs.existsSync(htmlFile))throw new Error('Approved public index page missing: '+slug);
 const previous=fs.readFileSync(htmlFile,'utf8');
 const canonical='https://summonerindex.com/'+slug;
 if(!previous.includes('<link rel="canonical" href="'+canonical+'">'))
  throw new Error('Canonical mismatch in public index page: '+slug);
 const robots=/<meta name="robots" content="(?:noindex|index),follow">/g;
 if([...previous.matchAll(robots)].length!==1)
  throw new Error('Cannot safely update robots directive: '+slug);
 const updated=previous.replace(robots,'<meta name="robots" content="index,follow">');
 if(updated!==previous){fs.writeFileSync(htmlFile,updated);indexingChanges++;}
}
const sitemapFile=path.join(root,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapFile,'utf8');
if(!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')||
 !sitemap.includes('</urlset>'))throw new Error('Unexpected sitemap format');
for(const slug of indexablePages){
 const canonical='https://summonerindex.com/'+slug;
 if(sitemap.includes('<loc>'+canonical+'</loc>'))continue;
 sitemap=sitemap.replace('</urlset>','  <url><loc>'+canonical+'</loc></url>\n</urlset>');
 indexingChanges++;
}
if(sitemap!==fs.readFileSync(sitemapFile,'utf8'))
 fs.writeFileSync(sitemapFile,sitemap);
console.log('Owner-approved indexing: /tools and /doomscrip; '+
 indexingChanges+' HTML/sitemap updates; all other routes unchanged.');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const required of ['styles.css','app.mjs','theme.css','theme.mjs','theme-boot.js']){
 if(!assets[required]||!home.includes('="/'+assets[required]+'"'))
  throw new Error('Missing up-to-date main page asset link: '+required);
}
const theme=fs.readFileSync(path.join(root,assets['theme.mjs']),'utf8');
if(!theme.includes('./'+assets['boss-prep.mjs']))
 throw new Error('Missing cache-busted theme → boss-prep module import');
console.log('Site assets version '+version+': '+names.length+' assets; '+
 visited+' HTML pages checked; '+pagesChanged+' updated; '+
 linkedAssets+' references; '+assetFiles+' new/changed asset copies.');
