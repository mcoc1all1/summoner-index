import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'dist','champions');
const db=JSON.parse(fs.readFileSync(path.join(root,'content','catalog.json'),'utf8'));
const champions=new Map(db.champions.map(c=>[c.id,c]));
const attr=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');

if(fs.existsSync(dir))for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 if(!entry.isDirectory())continue;
 const file=path.join(dir,entry.name,'index.html');
 if(!fs.existsSync(file))continue;
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(/(href="[^"]*\/compare)\?ids=([^,"&]+)(")/g,'$1?profile=$2$3');
 const champion=champions.get(entry.name);
 const fullKitUrl=champion?.referenceFacts?.url;
 if(fullKitUrl&&html.includes('id="mechanics"')&&!html.includes('class="text-link full-kit-link"')){
  const link=`<a class="text-link full-kit-link" href="${attr(fullKitUrl)}" target="_blank" rel="noopener noreferrer">View full kit on MCOC Scout ↗</a>`;
  html=html.replace(/(<section class="panel" id="mechanics">[\s\S]*?)(<\/section>)/,`$1${link}$2`);
 }
 fs.writeFileSync(file,html);
}
console.log('Normalized champion compare entry links and full-kit shortcuts.');
