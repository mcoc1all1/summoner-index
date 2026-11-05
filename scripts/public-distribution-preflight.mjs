import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const forbiddenDirectories=new Set(['.git','.github','content','docs','scripts','src','tests','node_modules','private','research','credentials']);
const forbiddenFileNames=new Set(['.env','.env.local','.npmrc','.gitignore','package.json','package-lock.json','pnpm-lock.yaml','yarn.lock','publication-review.json','commercial-launch-register.json','boss-commercial-review-casefiles.json']);
const forbiddenExtensions=new Set(['.pem','.key','.p12','.pfx','.sql','.md','.ps1','.sh','.yaml','.yml','.log','.map']);
const secretMatchers=[
 {id:'private-key',re:/-----BEGIN (?:OPENSSH |RSA |EC |DSA )?PRIVATE KEY-----/},
 {id:'github-token',re:/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{30,}\b/},
 {id:'aws-access-key',re:/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/}
];
const fail=(issues,id,detail)=>issues.push({id,detail});

export function inspectDistribution(dist,{requireNoindex=true}={}){
 const issues=[],inventory={files:0,html:0,json:0,bytes:0};
 if(!fs.existsSync(dist)||!fs.statSync(dist).isDirectory()){
  fail(issues,'missing-dist','Built output directory missing');
  return {ready:false,issues,inventory};
 }
 const visit=(directory)=>{
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
   const file=path.join(directory,entry.name),relative=path.relative(dist,file).split(path.sep).join('/');
   const segments=relative.split('/');
   if(entry.isSymbolicLink()){fail(issues,'symlink',relative);continue;}
   if(entry.isDirectory()){
    if(forbiddenDirectories.has(entry.name)||entry.name.startsWith('.')){
     fail(issues,'forbidden-directory',relative);continue;
    }
    visit(file);continue;
   }
   if(!entry.isFile()){fail(issues,'unknown-file-type',relative);continue;}
   inventory.files++;
   inventory.bytes+=fs.statSync(file).size;
   if(relative==='.nojekyll'){
    if(fs.statSync(file).size!==0)fail(issues,'invalid-nojekyll','This Pages marker must be empty');
    continue; // Safe root-level Jekyll bypass marker in the clean publishing snapshot.
   }
   if(forbiddenFileNames.has(entry.name)||forbiddenExtensions.has(path.extname(entry.name).toLowerCase())||entry.name.startsWith('.')){
    fail(issues,'source-file-exposed',relative);
    continue;
   }
   const suffix=path.extname(file).toLowerCase();
   const readable=new Set(['.html','.xml','.txt','.json','.mjs','.js','.css','.svg']);
   if(!readable.has(suffix))continue; // Images/fonts may be allowed; all text types are inspected.
   const content=fs.readFileSync(file,'utf8');
   for(const token of secretMatchers)if(token.re.test(content))fail(issues,token.id,relative);
   if(suffix==='.html'){
    inventory.html++;
    if(requireNoindex&&!/<meta name="robots" content="noindex,follow">/.test(content))
     fail(issues,'indexing-hold-violated',relative);
   }
   if(suffix==='.json'){
    inventory.json++;
    if(relative==='catalog.json'){
     let data;
     try {data=JSON.parse(content);}catch{fail(issues,'invalid-public-catalog','catalog.json');continue;}
     for(const champ of data.champions||[]){
      const ref=champ.referenceFacts;
      if(ref&&(ref.status!=='source-link-only'||ref.abilities!==undefined||ref.protections!==undefined||ref.battlecast!==undefined||ref.statcast!==undefined))
       fail(issues,'compiled-reference-republished',champ.id||'unknown');
      if(champ.relicIds?.length||champ.loadout?.battlecastId||champ.loadout?.statcastId)
       fail(issues,'unreviewed-relic-pairing',champ.id||'unknown');
     }
    }
   }
  }
 };
 visit(dist);
 if(!fs.existsSync(path.join(dist,'index.html')))fail(issues,'missing-home','index.html');
 if(!fs.existsSync(path.join(dist,'catalog.json')))fail(issues,'missing-public-catalog','catalog.json');
 if(requireNoindex){
  const sitemap=path.join(dist,'sitemap.xml');
  if(!fs.existsSync(sitemap)||/<loc>\s*https?:\/\//i.test(fs.readFileSync(sitemap,'utf8')))
   fail(issues,'indexing-sitemap','Beta sitemap must exist without URL entries');
 }
 return {ready:issues.length===0,issues,inventory,note:'Distribution-file preflight only. Does not clear copyright, licensing, ownership, or AdSense requirements.'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dist=path.join(root,'dist');
 const report=inspectDistribution(dist);
 console.log(JSON.stringify(report,null,2));
 if(process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
   '\n### Public distribution preflight\n- Result: **'+(report.ready?'PASS':'FAIL')+
   '**\n- Files inspected: '+report.inventory.files+
   '\n- HTML pages: '+report.inventory.html+
   '\n- Failures: '+report.issues.length+
   '\n- All beta pages remain noindex.\n');
 if(!report.ready)process.exitCode=1;
}
