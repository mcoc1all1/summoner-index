import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rightsReviewQueue} from './rights-review-queue.mjs';
import {validDate} from '../src/review.mjs';

const rootDefault=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const requiredCommercialChecks=[
 'third-party-expression',
 'source-repository-separation',
 'original-value-review',
 'privacy-consent-and-disclosures',
 'domain-and-seo-migration'
];

// Human review is a separate decision from automated build, gameplay, and rights-integrity tests.
// A bare "approved" flag cannot satisfy the gate without dated, scoped evidence.
export function manualCommercialFindings(register,{today=new Date().toISOString().slice(0,10)}={}){
 const issues=[];
 const checks=Array.isArray(register?.checks)?register.checks:[];
 if(register?.version!==1)issues.push({id:'register-version',severity:'blocker',detail:'Commercial approval register is missing or has an unsupported version.'});
 const ids=checks.map(c=>c.id);
 if(new Set(ids).size!==ids.length)issues.push({id:'register-duplicates',severity:'blocker',detail:'Duplicate commercial check IDs.'});
 for(const id of requiredCommercialChecks){
  const item=checks.find(c=>c.id===id);
  if(!item){issues.push({id,severity:'blocker',detail:'Required commercial approval is missing.'});continue;}
  const approved=item.status==='approved';
  const evidence=typeof item.evidence==='string'&&item.evidence.trim().length>=30;
  const reviewer=typeof item.reviewer==='string'&&item.reviewer.trim().length>=3;
  const date=validDate(item.reviewedAt)&&item.reviewedAt<=today;
  if(!approved||!evidence||!reviewer||!date)
   issues.push({id,severity:'blocker',detail:approved?'Approval lacks sufficiently specific dated reviewer evidence.':item.scope||'Manual review pending.'});
 }
 for(const item of checks)if(!requiredCommercialChecks.includes(item.id))
  issues.push({id:'unexpected-check-'+item.id,severity:'warning',detail:'Unknown commercial register check; review schema before relying on it.'});
 return issues;
}

function htmlPages(dist){
 const files=[];
 if(!fs.existsSync(dist))return files;
 function walk(folder){
  for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
   const target=path.join(folder,entry.name);
   if(entry.isDirectory())walk(target);
   else if(entry.name.endsWith('.html'))files.push(target);
  }
 }
 walk(dist);
 return files;
}
function textOfMain(html){
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'';
 return main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ').replace(/&(?:[a-z]+|#\d+);/gi,' ').replace(/\s+/g,' ').trim();
}
export function publicPageQuality(dist){
 const files=htmlPages(dist);
 const result={totalPages:files.length,indexablePages:0,noindexPages:0,missingTitle:[],missingDescription:[],missingCanonical:[],shortEditorialPages:[],possibleAdTags:[],workbenchLeaks:[]};
 for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  const relative=path.relative(dist,file).split(path.sep).join('/');
  if(!/<title>[^<]+<\/title>/i.test(html))result.missingTitle.push(relative);
  if(!/<meta name="description" content="[^"]+"/i.test(html))result.missingDescription.push(relative);
  if(!/<link rel="canonical" href="https:\/\/[^"]+"/i.test(html))result.missingCanonical.push(relative);
  const noindex=/<meta name="robots" content="[^"]*noindex/i.test(html);
  if(noindex)result.noindexPages++;else result.indexablePages++;
  // A heuristic queue, NOT a Google word-count rule or an automatic plagiarism finding.
  if(/^(champions|bosses|quests|guides)\//.test(relative)&&textOfMain(html).split(/\s+/).length<120)
   result.shortEditorialPages.push(relative);
  if(/adsbygoogle|pagead2\.googlesyndication\.com|google_ad_client/i.test(html))result.possibleAdTags.push(relative);
  if(html.includes('href="/content-workbench"')||/href="[^"]*\/content-workbench"/.test(html))
   result.workbenchLeaks.push(relative);
 }
 for(const key of ['missingTitle','missingDescription','missingCanonical','shortEditorialPages','possibleAdTags','workbenchLeaks']){
  result[key+'Count']=result[key].length;
  result[key]=result[key].slice(0,20); // examples; counts remain complete
 }
 return result;
}

export function auditCommercialReadiness(root=rootDefault,{today=new Date().toISOString().slice(0,10)}={}){
 const content=path.join(root,'content');
 const db=JSON.parse(fs.readFileSync(path.join(content,'catalog.json'),'utf8'));
 const guideManifest=JSON.parse(fs.readFileSync(path.join(content,'publication-review.json'),'utf8'));
 const register=JSON.parse(fs.readFileSync(path.join(content,'commercial-launch-register.json'),'utf8'));
 const rights=rightsReviewQueue(db,guideManifest);
 const quality=publicPageQuality(path.join(root,'dist'));
 const pilotFile=path.join(content,'boss-commercial-review-casefiles.json');
 const pilotCases=fs.existsSync(pilotFile)?JSON.parse(fs.readFileSync(pilotFile,'utf8')).cases||[]:[];
 const pilotSourceComparisons={
  count:pilotCases.length,
  pending:pilotCases.filter(item=>item.status!=='cleared').length,
  examples:pilotCases.map(item=>({id:item.id,status:item.status,comparedSources:(item.sources||[]).filter(src=>src.access==='text-compared').length,unresolved:(item.openIssues||[]).length}))
 };
 const findings=manualCommercialFindings(register,{today});
 if(rights.pending)findings.push({id:'boss-guide-expression',severity:'blocker',detail:`${rights.pending} of ${rights.total} boss guides do not have current individually documented expression/rights assessments.`});
 if(!quality.totalPages)findings.push({id:'missing-build',severity:'blocker',detail:'Run the public-beta build before auditing generated pages.'});
 if(quality.indexablePages===0)findings.push({id:'owner-indexing-hold',severity:'blocker',detail:'All published pages are intentionally noindex by owner instruction. Do not lift this hold until commercial rights, content-quality, domain and advertising reviews are complete and the owner authorizes launch.'});
 else if(quality.indexablePages<=2)findings.push({id:'site-wide-noindex',severity:'blocker',detail:`Only ${quality.indexablePages} generated pages are indexable; an authorized launch indexing plan is still required.`});
 if(quality.missingTitleCount||quality.missingDescriptionCount||quality.missingCanonicalCount)
  findings.push({id:'page-metadata',severity:'blocker',detail:'Generated pages lack essential title, description or canonical metadata. See quality examples.'});
 if(quality.possibleAdTagsCount)
  findings.push({id:'premature-ad-tags',severity:'blocker',detail:'Unexpected advertising tags exist before commercial approval.'});
 if(quality.workbenchLeaksCount)
  findings.push({id:'public-editor-link',severity:'blocker',detail:'Visitor HTML still links to unpublished content workbench.'});
 if(quality.shortEditorialPagesCount)
  findings.push({id:'short-editorial-candidates',severity:'warning',detail:`${quality.shortEditorialPagesCount} editorial pages have under 120 words in extracted main text. Review value manually; this is not an AdSense word-count threshold.`});
 const blockers=findings.filter(f=>f.severity==='blocker');
 return {
  asOf:today,disposition:blockers.length?'PUBLIC_BETA_ONLY':'CANDIDATE_FOR_FINAL_HUMAN_REVIEW',
  readyForAds:false, // Google must approve the site; this audit never activates ads.
  readyToApplyForAdSense:blockers.length===0,
  scope:'Automated pre-application checklist; no rights/license verdict, Google approval or independent gameplay testing.',
  site:{champions:db.champions.length,bossGuides:rights.total,relics:db.relics.length},
  bossRights:{reviewed:rights.reviewed,pending:rights.pending,pendingExamples:rights.items.filter(i=>i.status==='pending').slice(0,12).map(i=>({id:i.id,reason:i.reason}))},
  pilotSourceComparisons,
  publicQuality:quality,findings,blockers:blockers.length
 };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=auditCommercialReadiness();
 const output=JSON.stringify(report,null,2)+'\n';
 if(process.argv.includes('--write')){
  const target=path.join(rootDefault,'docs','commercial-readiness-current.json');
  fs.writeFileSync(target,output);
  console.log(`Written ${path.relative(rootDefault,target)}`);
 }else console.log(output);
 if(process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
   `## Commercial-readiness audit (advisory)\n\n- Disposition: **${report.disposition}**\n- Outstanding blockers: **${report.blockers}**\n- Boss guide rights reviews pending: **${report.bossRights.pending}/${report.bossRights.reviewed+report.bossRights.pending}**\n- Generated pages indexable: **${report.publicQuality.indexablePages}/${report.publicQuality.totalPages}**\n- Ads: **disabled**\n\nHuman review and Google approval remain required.\n`);
 if(process.argv.includes('--enforce')&&!report.readyToApplyForAdSense)process.exitCode=1;
}
