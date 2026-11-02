import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {basePath,localAttributes} from '../src/deployment.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const base=basePath(process.env.SITE_BASE_PATH||'');
for(const file of ['fight-mechanics.mjs','counter-mechanics-ui.mjs']){
 const source=fs.readFileSync(path.join(root,'src',file),'utf8');
 fs.writeFileSync(path.join(out,file),localAttributes(source,base));
}
console.log('Copied fight mechanics browser modules.');
