import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalogPath=path.join(root,'content/catalog.json');
const patchPath=path.join(root,'content/accuracy-patches.json');
const original=fs.readFileSync(catalogPath,'utf8');
const patches=JSON.parse(fs.readFileSync(patchPath,'utf8'));
const db=applyAccuracyPatches(JSON.parse(original),patches);
const args=process.argv.slice(2);
if(!args.length)throw new Error('Expected a command to run after applying accuracy patches.');

try {
  fs.writeFileSync(catalogPath,JSON.stringify(db,null,2)+'\n');
  const result=spawnSync(args[0],args.slice(1),{cwd:root,stdio:'inherit',shell:process.platform==='win32'});
  if(result.error)throw result.error;
  process.exitCode=result.status??1;
} finally {
  fs.writeFileSync(catalogPath,original);
}
