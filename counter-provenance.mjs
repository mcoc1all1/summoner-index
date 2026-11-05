// Evidence classification is a disclosure heuristic, not independent rights clearance.
// Evaluate actual citations, never infer a fight test or copyright permission from a score.
const compiledReferenceHosts=new Set([
 'mcocscout.com','mcochub.insaneskull.com','mcoc.help','auntm.ai',
 'marvel-contestofchampions.fandom.com','mcoc.mx'
]);
export function counterSourceHost(url=''){
 try{return new URL(url).hostname.toLowerCase().replace(/^www\./,'');}
 catch{return 'unresolved';}
}
export function counterSourceEvidence(db,c){
 const sources=new Map((db.sources||[]).map(s=>[s.id,s]));
 const declared=[...new Set(c.sourceIds||[])];
 const missing=declared.filter(id=>!sources.has(id));
 const linked=[...new Map(declared.map(id=>sources.get(id)).filter(Boolean).map(s=>[s.url,s])).values()];
 const reports=linked.filter(s=>s.kind==='community-report'||s.kind==='test');
 const official=linked.filter(s=>s.kind==='official');
 const kit=linked.filter(s=>s.kind==='community-reference'
   && /(?:\/champions\/|\/wiki\/|\/champion-spotlight-)/i.test(s.url||''));
 const compiled=linked.filter(s=>compiledReferenceHosts.has(counterSourceHost(s.url)));
 const onlyCompilation=linked.length>0&&compiled.length===linked.length;
 const test=c.review||{};
 const recordedTest=test.status==='tested'&&linked.some(source=>source.kind==='test')
   && test.gameplayTested===true
   && typeof test.gameVersion==='string'&&test.gameVersion.trim().length>0
   && typeof test.testedAt==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(test.testedAt)
   && typeof test.testEvidence==='string'&&test.testEvidence.trim().length>0;
 return {count:linked.length,missing,kindCounts:{communityReports:reports.length,official:official.length,kitReferences:kit.length,compilationReferences:compiled.length},onlyCompilation,recordedTest,
   sourceHosts:[...new Set(linked.map(s=>counterSourceHost(s.url)))].sort(),sourceURLs:linked.map(s=>s.url)};
}
export function counterEvidenceLabel(c,db){
 const ev=counterSourceEvidence(db,c);
 if(ev.recordedTest&&c.score>=5&&Number.isInteger(c.review.testCount)&&c.review.testCount>=2)
   return {label:'Repeatedly tested',className:'confidence-tested'};
 if(ev.recordedTest&&c.score>=4)
   return {label:'Tested on documented nodes',className:'confidence-tested'};
 if(!ev.count||ev.missing.length)return {label:'Evidence incomplete · untested',className:'confidence-limited'};
 if(ev.count===1)return {label:'One cited source · untested',className:'confidence-community'};
 if(ev.kindCounts.communityReports>=2)return {label:'Multiple linked reports · untested',className:'confidence-community'};
 if(ev.kindCounts.communityReports>0&&ev.kindCounts.kitReferences>0)
   return {label:'Player report + kit reference',className:'confidence-community'};
 if(ev.kindCounts.communityReports>0)return {label:'Player report · untested',className:'confidence-community'};
 if(ev.kindCounts.official>0)return {label:'Official source · matchup untested',className:'confidence-community'};
 return {label:'Source-linked option · untested',className:'confidence-limited'};
}
