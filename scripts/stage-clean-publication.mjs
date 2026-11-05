import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {inspectDistribution} from './public-distribution-preflight.mjs';

const repositoryRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const inside=(parent,child)=>child===parent||(!path.relative(parent,child).startsWith('..'+path.sep)
 && path.relative(parent,child)!=='..'
 && !path.isAbsolute(path.relative(parent,child)));

function listFiles(root){
 const rows=[];
 const visit=dir=>{
  for(const item of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
   const absolute=path.join(dir,item.name);
   if(item.isDirectory())visit(absolute);
   else if(item.isFile()){
    const bytes=fs.readFileSync(absolute);
    rows.push({
     path:path.relative(root,absolute).split(path.sep).join('/'),
     bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')
    });
   }else throw Error('Unsafe non-file content in staging: '+absolute);
  }
 };
 visit(root);
 return rows;
}

// Creates only a local, cleanly separated, public-output snapshot.
// NEVER creates a GitHub repository, writes to a remote, or modifies site indexing.
export function stageCleanPublication({dist=path.join(repositoryRoot,'dist'),output}={}){
 if(typeof output!=='string'||!output.trim())throw Error('An explicit --output directory is required');
 const source=path.resolve(dist),target=path.resolve(output);
 if(inside(repositoryRoot,target))throw Error('Output must be outside the source repository to avoid accidental publication of research/history');
 if(inside(source,target)||inside(target,source))throw Error('The staging destination and dist directory must not overlap');
 if(fs.existsSync(target))throw Error('Refusing to replace an existing staging directory: '+target);
 const before=inspectDistribution(source,{requireNoindex:true});
 if(!before.ready)throw Error('Refusing to stage a build that fails the public distribution and noindex preflight: '+JSON.stringify(before.issues.slice(0,8)));
 const parent=path.dirname(target);
 if(!fs.existsSync(parent)||!fs.statSync(parent).isDirectory())throw Error('Create the staging parent directory first: '+parent);
 try{
  fs.mkdirSync(target);
  const site=path.join(target,'site');
  fs.cpSync(source,site,{recursive:true,force:false,errorOnExist:true,dereference:false});
  // Necessary when using a plain branch as a Pages publishing source.
  // This file has no effect on the already deployed GitHub Actions beta.
  fs.writeFileSync(path.join(site,'.nojekyll'),'');
  const after=inspectDistribution(site,{requireNoindex:true});
  if(!after.ready)throw Error('Staged output failed its second publication preflight: '+JSON.stringify(after.issues.slice(0,8)));
  const files=listFiles(site);
  const summary={
   kind:'isolated-public-beta-snapshot',createdAt:new Date().toISOString(),files:files.length,
   bytes:files.reduce((sum,x)=>sum+x.bytes,0),
   treeSha256:createHash('sha256').update(files.map(x=>x.path+':'+x.sha256).join('\n')).digest('hex'),
   allPagesNoindex:true,ownerAuthorizedAdLaunch:false,adScriptsEnabled:false,
   sourceHistoryIncluded:false,
   scope:'Safe technical publication snapshot only. Originality/licensing reviews and private-source migration remain pending.',
   filesManifest:files
  };
  fs.writeFileSync(path.join(target,'manifest.json'),JSON.stringify(summary,null,2)+'\n');
  fs.writeFileSync(path.join(target,'NEXT-STEPS.txt'),
   'Contents of site/ are the clean public-beta output only. No git repository or remote was created.\n'+
   'Do NOT publish the separate manifest.json or NEXT-STEPS.txt files as website pages.\n'+
   'Do NOT remove noindex until the website owner authorizes the commercial launch.\n'+
   'After creating a private source repository and an independently initialized PUBLIC distribution repository,\n'+
   'an owner can use only site/ as the website root. Do not reuse the current public source .git history.\n'+
   'Review docs/RIGHTS-AND-SOURCE-SEPARATION-2026-11-04.md before any cutover.\n');
  return {output:target,site,manifest:path.join(target,'manifest.json'),
   files:summary.files,bytes:summary.bytes,treeSha256:summary.treeSha256,
   allPagesNoindex:true,remoteChanges:false};
 }catch(error){
  // A failed staging operation cannot leave a misleading half-built directory.
  if(fs.existsSync(target))fs.rmSync(target,{recursive:true,force:true});
  throw error;
 }
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const argv=process.argv.slice(2);
 if(argv.length!==2||argv[0]!=='--output'){
  console.error('Usage: node scripts/stage-clean-publication.mjs --output ABSOLUTE_PATH_OUTSIDE_REPOSITORY');
  process.exitCode=2;
 }else{
  const result=stageCleanPublication({output:argv[1]});
  console.log(JSON.stringify(result,null,2));
  if(process.env.GITHUB_STEP_SUMMARY)
   fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    '\n### Clean isolated publication snapshot\n- Files: '+result.files+
    '\n- Output: '+result.site+
    '\n- All pages: **noindex**\n- Repo remotes/visibility: **untouched**\n');
 }
}
