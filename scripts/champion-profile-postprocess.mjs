import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'dist','champions');
if(fs.existsSync(dir))for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 if(!entry.isDirectory())continue;
 const file=path.join(dir,entry.name,'index.html');
 if(!fs.existsSync(file))continue;
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(/(href="[^"]*\/compare)\?ids=([^,"&]+)(")/g,'$1?profile=$2$3');
 fs.writeFileSync(file,html);
}
console.log('Normalized champion compare entry links.');
