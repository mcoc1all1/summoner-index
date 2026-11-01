import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const contentDir=path.join(root,'content');
const catalogPath=path.join(contentDir,'catalog.json');
const original=fs.readFileSync(catalogPath,'utf8');
const patchFiles=[
  'accuracy-patches.json',
  ...fs.readdirSync(contentDir).filter(name=>/^(?:boss|counter|rarity)-.*-patches\.json$/.test(name)).sort()
];
let db=JSON.parse(original);
for(const name of patchFiles){
  const patches=JSON.parse(fs.readFileSync(path.join(contentDir,name),'utf8'));
  db=applyAccuracyPatches(db,patches);
}
const args=process.argv.slice(2);
if(!args.length)throw new Error('Expected a command to run after applying accuracy patches.');

try {
  fs.writeFileSync(catalogPath,JSON.stringify(db,null,2)+'\n');
  const command=args.map(value=>/\s/.test(value)?`"${value.replaceAll('"','\\"')}"`:value).join(' ');
  const result=spawnSync(command,{cwd:root,stdio:'inherit',shell:true});
  if(result.error)throw result.error;
  process.exitCode=result.status??1;
} finally {
  fs.writeFileSync(catalogPath,original);
}
