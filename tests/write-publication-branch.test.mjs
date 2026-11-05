import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const script=fileURLToPath(new URL('../scripts/write-publication-branch.sh',import.meta.url));
const run=(cmd,args,options={})=>execFileSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],...options}).trim();
function fixture(){
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'summoner-keep-original-'));
 const repo=path.join(base,'public-repo'),site=path.join(base,'approved-site'),origin=path.join(base,'remote.git');
 fs.mkdirSync(repo);fs.mkdirSync(site);
 run('git',['init','-b','main',repo]);
 run('git',['-C',repo,'config','user.name','Site test']);
 run('git',['-C',repo,'config','user.email','test@example.org']);
 fs.mkdirSync(path.join(repo,'content'));
 fs.writeFileSync(path.join(repo,'content','catalog.json'),'raw private research fixture');
 fs.writeFileSync(path.join(repo,'README.md'),'old public source');
 run('git',['-C',repo,'add','.']);
 run('git',['-C',repo,'commit','-m','Original public source history']);
 run('git',['init','--bare',origin]);
 run('git',['-C',repo,'remote','add','origin',origin]);
 run('git',['-C',repo,'push','-u','origin','main']);
 fs.writeFileSync(path.join(site,'index.html'),'<meta name="robots" content="noindex,follow"><h1>Beta</h1>');
 fs.writeFileSync(path.join(site,'catalog.json'),JSON.stringify({champions:[]}));
 fs.writeFileSync(path.join(site,'robots.txt'),'User-agent: *\nAllow: /\n');
 fs.writeFileSync(path.join(site,'sitemap.xml'),'<urlset></urlset>');
 fs.writeFileSync(path.join(site,'.nojekyll'),'');
 return {base,repo,site,origin};
}
test('builds an orphan publication branch without changing public main or pushing automatically',()=>{
 const {base,repo,site}=fixture();
 try{
  const oldMain=run('git',['-C',repo,'rev-parse','main']);
  const output=run('bash',[script,site,repo]);
  assert.match(output,/Dry run only/);
  assert.equal(run('git',['-C',repo,'rev-parse','main']),oldMain);
  assert.equal(run('git',['-C',repo,'rev-parse','--abbrev-ref','HEAD']),'site-publish');
  const branchRoot=run('git',['-C',repo,'rev-list','--max-parents=0','HEAD']);
  assert.equal(run('git',['-C',repo,'rev-list','--parents','-n','1',branchRoot]).split(' ').length,1);
  assert.equal(run('git',['-C',repo,'show','-s','--format=%s',branchRoot]),'Initialize Summoner Index noindex website-only branch');
  assert.throws(()=>run('git',['-C',repo,'show','HEAD:content/catalog.json']));
  assert.equal(run('git',['-C',repo,'show','HEAD:index.html']).includes('noindex,follow'),true);
  assert.throws(()=>run('git',['-C',repo,'ls-remote','--exit-code','--heads','origin','site-publish']));
  run('git',['-C',repo,'push','origin','site-publish']);
  fs.writeFileSync(path.join(site,'index.html'),'<meta name="robots" content="noindex,follow"><h1>Updated beta</h1>');
  run('bash',[script,site,repo]);
  assert.equal(run('git',['-C',repo,'rev-list','--max-parents=0','HEAD']),branchRoot);
  assert.equal(run('git',['-C',repo,'rev-parse','main']),oldMain);
 }finally{fs.rmSync(base,{recursive:true,force:true});}
});
test('rejects pages with indexing enabled before modifying the checkout',()=>{
 const {base,repo,site}=fixture();
 try{
  fs.writeFileSync(path.join(site,'index.html'),'<meta name="robots" content="index,follow">');
  assert.throws(()=>run('bash',[script,site,repo]));
  assert.equal(run('git',['-C',repo,'rev-parse','--abbrev-ref','HEAD']),'main');
 }finally{fs.rmSync(base,{recursive:true,force:true});}
});
