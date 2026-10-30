import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessPublication,fingerprint,renderPilot} from '../src/publication.mjs';
import {validate} from '../src/domain.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const db=JSON.parse(fs.readFileSync(path.join(root,'content/catalog.json')));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'content/publication-review.json')));
const errors=validate(db);if(errors.length)throw Error(errors.join('\n'));
const result=assessPublication(db,manifest);
const report={date:manifest.reviewedAt,operatorCountry:manifest.operatorCountry,permissionsObtained:manifest.permissionsObtained,
  warning:'Engineering publication gate; not legal clearance. Missing permission is not itself an infringement finding.',
  selected:manifest.selectedBossIds,eligible:result.eligible.map(x=>x.boss.id),held:result.held,
  excludedBossIds:result.excludedBossIds,fullCatalogExcluded:{champions:db.champions.length,counters:db.counters.length,relics:db.relics.length,sources:db.sources.length},
  candidateFingerprints:db.bosses.filter(b=>manifest.selectedBossIds.includes(b.id)).map(b=>({id:b.id,fingerprint:fingerprint(db,b),sourceIds:b.sourceIds}))};
fs.writeFileSync(path.join(root,'docs/publication-status.json'),JSON.stringify(report,null,2)+'\n');
if(result.held.length||!result.eligible.length){
  console.error(`Public build withheld: ${result.eligible.length} eligible, ${result.held.length} selected guides awaiting review. Full research dist is not a release artifact.`);
  process.exitCode=1;
}else if(!process.argv.includes('--check')){
  // Fresh directory prevents obsolete/held files surviving a later build.
  const out=fs.mkdtempSync(path.join(root,'public-candidate-'));
  for(const [name,body] of Object.entries(renderPilot(result.eligible))){const target=path.join(out,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);}
  console.log(`Created limited beta candidate: ${out}. Host, privacy, identity and deployment checks remain separate.`);
}else console.log(`Content gate passed for ${result.eligible.length} guides. This is not deployment approval.`);
