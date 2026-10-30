import {bossGuidance} from './boss-guidance.mjs';
import {contentPolicy} from './content-policy.mjs';
import {createHash} from 'node:crypto';
import {escapeHtml as e} from './domain.mjs';
import {validDate} from './review.mjs';

export function fingerprint(db,boss){
  return createHash('sha256').update(JSON.stringify({boss,sources:boss.sourceIds.map(id=>db.sources.find(s=>s.id===id))})).digest('hex');
}
export function assessPublication(db,manifest){
  const eligible=[],held=[];
  const ids=manifest.selectedBossIds||[];
  for(const id of new Set(ids)){
    const boss=db.bosses.find(b=>b.id===id);
    const review=manifest.reviews?.find(r=>r.id===id);
    const reasons=[];
    if(!boss){held.push({id,reasons:['Unknown boss']});continue;}
    if(!review)reasons.push('No publication review recorded');
    else {
      if(review.fingerprint!==fingerprint(db,boss))reasons.push('Content or evidence changed since review');
      if(!validDate(review.reviewedAt)||!review.reviewer?.trim())reasons.push('Dated reviewer identity missing');
      if(review.accuracy?.status!=='source-checked'||!review.accuracy.evidence?.trim())reasons.push('Accuracy evidence review missing');
      if(!['independently-authored-facts','licensed','permission','documented-exception'].includes(review.rights?.basis)||!review.rights?.evidence?.trim()||review.rights?.status!=='reviewed')reasons.push('Content reuse assessment missing');
      if(!review.limitations?.trim())reasons.push('Reader-facing limitations missing');
      if(!review.attribution?.trim())reasons.push('Attribution/change notice missing');
    }
    if(reasons.length)held.push({id,reasons});else eligible.push({boss,review});
  }
  return {eligible,held,excludedBossIds:db.bosses.filter(b=>!ids.includes(b.id)).map(b=>b.id)};
}

// Only explicitly selected, reviewed boss fields are rendered. No source catalog,
// champion database, editor, hidden JSON payload or unrelated records are copied.
export function renderPilot(eligible){
  const shell=(title,body)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)} · Fieldguide</title><meta name="robots" content="noindex,follow"><link rel="stylesheet" href="/pilot.css"></head><body><header><a href="/">Fieldguide · limited beta</a></header><main>${body}</main><footer>Independent fan project. Not affiliated with Marvel or Kabam. No accounts, advertising, analytics or external fonts are loaded. <a href="https://www.youtube.com/@mcoc1all1" rel="noopener noreferrer" target="_blank">MCOC 1ALL1 on YouTube</a> · <a href="/content-policy/">Content & advertising policy</a> · <a href="/privacy/">Privacy</a></footer></body></html>`;
  const files={'index.html':shell('Boss preparation',`<h1>Boss preparation</h1><p>A small, reviewed selection. These guides do not cover every path or game version. No independently tested solo results are claimed.</p><ul>${eligible.map(({boss:b})=>`<li><a href="/bosses/${e(b.id)}/">${e(b.name)} · ${e(b.chapter)}</a></li>`).join('')}</ul>`),
    'pilot.css':'body{margin:auto;max-width:850px;padding:24px;background:#101315;color:#edf0eb;font:17px/1.7 system-ui}a{color:#f4b45d}header,footer{padding:20px 0}footer{border-top:1px solid #465050;font-size:14px}section{margin:28px 0}h1,h2{line-height:1.3}',
    'robots.txt':'User-agent: *\nDisallow: /\n',
    '_headers':"/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  X-Robots-Tag: noindex\n  Content-Security-Policy: default-src 'none'; style-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'\n"};
  files['content-policy/index.html']=shell('Content and advertising policy',`<h1>Content and advertising policy</h1>${contentPolicy}`);
  files['privacy/index.html']=shell('Privacy', '<h1>Privacy</h1><p>This limited guide build has no accounts, forms, browser storage, advertising, analytics or external fonts. Your hosting provider may process request metadata. Opening an external reference uses that service under its own policies.</p><p>Hosting details, retention and the operator contact must be finalized before public launch.</p>');
  for(const {boss:b,review:r} of eligible)files[`bosses/${b.id}/index.html`]=shell(b.name,`<h1>${e(b.name)} · ${e(b.chapter)}</h1><p>${e(b.summary)}</p><p><strong>Review limits:</strong> ${e(r.limitations)}</p>${b.phases.map(p=>`<section><h2>${e(p.name)}</h2><p>${e(p.text)}</p></section>`).join('')}<h2>Common mistakes</h2><ul>${b.mistakes.map(m=>`<li>${e(m)}</li>`).join('')}</ul><h2>Preparation</h2><p>${e(b.avoid)}</p>${bossGuidance(b)}<h2>Evidence and attribution</h2><p>${e(r.attribution)}</p><p>Reviewed ${e(r.reviewedAt)}. ${e(r.accuracy.evidence)}</p>`);
  return files;
}
