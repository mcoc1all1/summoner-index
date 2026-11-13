const base=document.body.dataset.base||'';
const route=document.body.dataset.page;
// Runtime cards, counter results and search results are inserted after the
// static HTML build. Keep their internal links in the current Pages base path.
function pageLink(href){
 if(!base||!href?.startsWith('/')||href.startsWith('//')||
    href===base||href.startsWith(base+'/')||href.startsWith(base+'?')||href.startsWith(base+'#'))return href;
 return base+href;
}
function prefixRuntimeLinks(root){
 if(root.nodeType!==1)return;
 const fix=el=>{
  const href=el.getAttribute('href');
  const next=pageLink(href);
  if(next!==href)el.setAttribute('href',next);
 };
 if(root.matches('a[href^="/"]'))fix(root);
 root.querySelectorAll('a[href^="/"]').forEach(fix);
}
if(base){
 prefixRuntimeLinks(document.body);
 new MutationObserver(records=>{
  for(const record of records)
   for(const node of record.addedNodes)prefixRuntimeLinks(node);
 }).observe(document.body,{childList:true,subtree:true});
}
// Keep the original full navigation as a no-JavaScript fallback and on desktop.
// On phones, present four common destinations plus one reversible More drawer.
function setupMobileNavigation(){
 const bar=document.querySelector('.sidebar nav');
 if(!bar)return;
 const original=[...bar.querySelectorAll(':scope > a')];
 const routeOf=a=>{
  const pathname=new URL(a.href,location.origin).pathname;
  const local=base&&pathname.startsWith(base+'/')?pathname.slice(base.length):pathname;
  return local.replace(/\/$/,'')||'/';
 };
 const primaryRoutes=['/','/counters','/champions','/live'];
 const primary=primaryRoutes.map(path=>{
  const existing=original.find(a=>routeOf(a)===path);
  if(existing||path!=='/live')return existing;
  // The Events link is injected by the publishing build after the base build.
  // Keep the mobile destination available even in a local preview build.
  const fallback=document.createElement('a');
  fallback.href=pageLink('/live');
  fallback.innerHTML='<i aria-hidden="true">●</i>Events &amp; News';
  if(route==='/live'||route==='/events'){fallback.className='active';fallback.setAttribute('aria-current','page');}
  return fallback;
 });
 if(primary.some(a=>!a))return;
 const more=document.createElement('button');
 more.type='button';
 more.id='mobile-more-toggle';
 more.className='mobile-more-toggle';
 more.setAttribute('aria-controls','mobile-more-panel');
 more.setAttribute('aria-expanded','false');
 more.setAttribute('aria-label','More site sections');
 more.innerHTML='<i aria-hidden="true">☷</i><span>More</span>';
 const panel=document.createElement('div');
 panel.id='mobile-more-panel';
 panel.className='mobile-more-panel';
 panel.hidden=true;
 panel.innerHTML='<strong class="mobile-more-heading">More from Summoner Index</strong>';
 const links=document.createElement('nav');
 links.className='mobile-more-links';
 links.setAttribute('aria-label','Additional site sections');
 const extras=[
  ['/guides','Guides'],['/roster','My Roster'],['/tools','Tools'],
  ['/loadouts','Relics & Stat Focus'],['/compare','Compare champions'],
  ['/saved','Saved champions'],['/masteries','Masteries'],
  ['/search','Search all'],['/feedback','Report an issue']
 ];
 const localPath=location.pathname.startsWith(base+'/')?location.pathname.slice(base.length):location.pathname;
 const currentPath=localPath.replace(/\/$/,'')||'/';
 for(const [href,label] of extras){
  const link=document.createElement('a');
  link.href=pageLink(href);
  link.textContent=label;
  if(currentPath===href||(href==='/guides'&&['/quests','/bosses','/challenges'].some(p=>currentPath.startsWith(p)))
   ||(href==='/tools'&&currentPath==='/content-workbench'))link.setAttribute('aria-current','page');
  links.append(link);
 }
 panel.append(links);
 const shade=document.createElement('button');
 shade.type='button';
 shade.className='mobile-more-shade';
 shade.hidden=true;
 shade.setAttribute('aria-label','Close More menu');
 bar.parentElement.append(shade,panel);
 const mobile=window.matchMedia('(max-width:800px)');
 const close=(restoreFocus=false)=>{
  more.setAttribute('aria-expanded','false');
  panel.hidden=true;
  shade.hidden=true;
  document.body.classList.remove('mobile-more-open');
  if(restoreFocus&&mobile.matches)more.focus();
 };
 const open=()=>{
  more.setAttribute('aria-expanded','true');
  panel.hidden=false;
  shade.hidden=false;
  document.body.classList.add('mobile-more-open');
  const destination=links.querySelector('[aria-current="page"]')||links.querySelector('a');
  destination?.focus();
 };
 const arrange=()=>{
  close();
  if(mobile.matches){
   bar.replaceChildren(...primary,more);
   const moreActive=!primary.some(a=>a.hasAttribute('aria-current'));
   more.classList.toggle('active',moreActive);
   document.body.classList.add('mobile-nav-ready');
  }else{
   document.body.classList.remove('mobile-nav-ready');
   bar.replaceChildren(...original);
  }
 };
 more.addEventListener('click',()=>panel.hidden?open():close(true));
 shade.addEventListener('click',()=>close(true));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close(true);});
 links.addEventListener('click',event=>{if(event.target.closest('a'))close();});
 mobile.addEventListener('change',arrange);
 arrange();
}
setupMobileNavigation();
// Counter cards are server-rendered on boss guides and re-rendered when mode
// or roster filters change. Keep their evidence expanded on desktop and
// collapsible on phones, without removing the cited limitations or risk text.
const counterEvidenceScreen=window.matchMedia('(max-width:800px)');
const syncCounterEvidence=root=>{
 if(root?.nodeType!==1&&root!==document)return;
 if(root.matches?.('details.counter-evidence-mobile'))root.open=!counterEvidenceScreen.matches;
 root.querySelectorAll('details.counter-evidence-mobile').forEach(item=>item.open=!counterEvidenceScreen.matches);
};
syncCounterEvidence(document);
new MutationObserver(records=>{
 for(const record of records)for(const node of record.addedNodes)syncCounterEvidence(node);
}).observe(document.body,{childList:true,subtree:true});
counterEvidenceScreen.addEventListener('change',()=>syncCounterEvidence(document));

import {mountLoadouts} from './loadouts.mjs';
import {mountRoster,readRoster} from './roster.mjs';
import {search,escapeHtml as e,validate,getCounters} from './domain.mjs';
import {championCard,counterResults,groupedCounterResults,compareTable,avatar} from './components.mjs';
const $=s=>document.querySelector(s);
const catalogSelectors=['#research-rows','#finder','#champ-results','[data-boss-counters]','#counter-results','#compare-controls','#global-query','#content-editor','#roster-manager','#loadout-query','#saved-results'];
const needsCatalog=catalogSelectors.some(selector=>document.querySelector(selector));
// These literal URLs are rewritten to content-hashed assets at build time.
const catalogs={
 finder:'/catalog-finder.json',roster:'/catalog-roster.json',champions:'/catalog-champions.json',
 search:'/catalog-search.json',counters:'/catalog-counters.json',
 compare:'/catalog-compare.json',loadouts:'/catalog-loadouts.json',full:'/catalog.json'
};
function catalogForPage(){
 if(route==='/'||route==='/counters')return 'finder';
 if(route.startsWith('/counters/')||document.querySelector('[data-boss-counters]'))return 'counters';
 if(route==='/champions'||route==='/saved'||route==='/coverage')return 'champions';
 if(route==='/search')return 'search';
 if(route==='/roster')return 'roster';
 if(route==='/compare')return 'compare';
 if(route==='/loadouts')return 'loadouts';
 return 'full';
}
const db=needsCatalog?await fetch(base+catalogs[catalogForPage()]).then(r=>{if(!r.ok)throw Error('Content unavailable');return r.json();}).catch(()=>null):null;
function toast(text){const t=$('#toast');if(!t)return;t.textContent=text;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,3500);}
function track(name,properties={}) { window.dispatchEvent(new CustomEvent('fieldguide:analytics',{detail:{name,properties}}));}
function readSaved(){try{const ids=JSON.parse(localStorage.getItem('fieldguide:saved')||'[]');return Array.isArray(ids)?(db?ids.filter(id=>db.champions.some(c=>c.id===id)):ids):[];}catch{return [];}}
function syncSaved(){document.querySelectorAll('[data-save]').forEach(b=>{const saved=readSaved().includes(b.dataset.save);b.setAttribute('aria-pressed',String(saved));b.textContent=saved?'★':'☆';});}
function showSaved(){if(!$('#saved-results')||!db)return;const cs=db.champions.filter(c=>readSaved().includes(c.id));$('#saved-results').innerHTML=cs.length?cs.map(c=>championCard(db,c)).join(''):'<div class="empty"><h3>Your shortlist starts here.</h3><p>Tap the star on any champion to save them on this browser.</p><a class="text-link" href="/champions">Browse champions →</a></div>';syncSaved();}
document.addEventListener('click',event=>{
 const compareButton=event.target.closest('[data-compare-toggle]');
 if(compareButton){
  const panel=compareButton.closest('#compare-table');
  if(panel){
   const onlyDifferences=panel.classList.toggle('compare-only-differences');
   compareButton.setAttribute('aria-pressed',String(onlyDifferences));
   compareButton.textContent=onlyDifferences?'Show all attributes':'Show differences only';
  }
 }
 const b=event.target.closest('[data-save]');
 if(b){const ids=readSaved(),id=b.dataset.save;const next=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];try{localStorage.setItem('fieldguide:saved',JSON.stringify(next));toast(next.includes(id)?'Champion saved on this browser':'Champion removed');syncSaved();showSaved();}catch{toast('Browser storage is unavailable. Champion was not saved.');}}
 const v=event.target.closest('[data-video]');if(v)track('outbound_youtube',{videoId:v.dataset.video});
});
// Sync saved stars even on individual profiles that do not fetch a full catalog.
syncSaved();
// Expose interaction readiness for reliable browser QA after module hydration.
document.body.dataset.appReady='true';
track('pageview',{path:location.pathname});
const params=new URLSearchParams(location.search);
if(db){
 if($('#research-rows')){
  const rows=[...document.querySelectorAll('#research-rows tr')];
  const render=()=>{
   const query=$('#research-query').value.trim().toLowerCase(),status=$('#research-status').value;
   let count=0;
   for(const row of rows){
    row.hidden=!(row.dataset.name.includes(query)&&(!status||row.getAttribute('data-'+status)==='true'));
    if(!row.hidden)count++;
   }
   $('#research-count').textContent=`${count} of ${rows.length} champion records`;
   $('#research-empty').hidden=count!==0;
  };
  $('#research-query').addEventListener('input',render);
  $('#research-status').addEventListener('change',render);
  render();
 }
 syncSaved();showSaved();mountRoster(db,toast);mountLoadouts(db);
 for(const host of document.querySelectorAll('[data-boss-counters]'))host.innerHTML=groupedCounterResults(db,host.dataset.bossCounters,'questing',readRoster(db).champions);
 const finder=$('#finder');
 if(finder){
  const choices=[...$('#opponent').options].map(o=>({id:o.value,label:o.textContent}));
  $('#opponent-query')?.addEventListener('input',event=>{const q=event.target.value.toLowerCase(),previous=$('#opponent').value,matched=choices.filter(o=>o.label.toLowerCase().includes(q));$('#opponent').innerHTML=matched.map(o=>'<option value="'+e(o.id)+'">'+e(o.label)+'</option>').join('');if(matched.some(o=>o.id===previous))$('#opponent').value=previous;finder.querySelector('button').disabled=!matched.length;$('#opponent-status').textContent=matched.length+' opponents match';});
  if(db.champions.some(c=>c.id===params.get('opponent'))||db.bosses.some(c=>c.id===params.get('opponent')))$('#opponent').value=params.get('opponent');
  if(db.gameModes.some(m=>m.id===params.get('mode')))$('#mode').value=params.get('mode');
  finder.addEventListener('submit',event=>{event.preventDefault();track('counter_search',{opponent:$('#opponent').value,mode:$('#mode').value});location.href=`${base}/counters/${$('#opponent').value}${$('#mode').value?'?mode='+$('#mode').value:''}`;});
  if(route==='/counters'&&params.has('opponent'))location.replace(`${base}/counters/${$('#opponent').value}${$('#mode').value?'?mode='+$('#mode').value:''}`);
 }
 if($('#champ-results')){
  $('#champ-query').value=params.get('q')||'';
  if(db.champions.some(c=>c.class===params.get('class')))$('#class-filter').value=params.get('class');
  if(db.immunities.some(i=>i.id===params.get('immunity')))$('#immune-filter').value=params.get('immunity');
  if(['debuff','passive'].includes(params.get('form')))$('#immunity-form').value=params.get('form');
  if(['always','conditional','either'].includes(params.get('activation')))$('#immunity-activation').value=params.get('activation');
  const rarityWrap=document.createElement('div');rarityWrap.className='field';rarityWrap.innerHTML='<label for="rarity-filter">7★ availability</label><select id="rarity-filter"><option value="">All champions</option><option value="7">7★ available</option><option value="not-7">Not listed as 7★</option></select>';$('#coverage-filter').closest('.field')?.after(rarityWrap);
  if(['7','not-7'].includes(params.get('rarity')))$('#rarity-filter').value=params.get('rarity');
  // Compact phone-only champion filters: keep the live results immediately below
  // the champion search field. The same controls remain visible on desktop.
  const mobileFilterButton=document.createElement('button');
  mobileFilterButton.type='button';
  mobileFilterButton.id='champ-mobile-filters';
  mobileFilterButton.className='champ-mobile-filters';
  mobileFilterButton.setAttribute('aria-controls','class-filter immune-filter immunity-form immunity-activation coverage-filter rarity-filter');
  mobileFilterButton.setAttribute('aria-expanded','false');
  $('#champ-query').closest('.toolbar').append(mobileFilterButton);
  let mobileFiltersOpen=false;
  const syncMobileFilters=()=>{
   const active=[
    $('#class-filter').value,$('#immune-filter').value,
    $('#immunity-form').value,$('#immunity-activation').value!=='always'?'activation':'',
    $('#coverage-filter').value,$('#rarity-filter').value
   ].filter(Boolean).length;
   mobileFilterButton.textContent=(mobileFiltersOpen?'Hide filters':'More filters')+(active?' · '+active+' active':'');
   mobileFilterButton.setAttribute('aria-expanded',String(mobileFiltersOpen));
   document.body.classList.toggle('champions-filters-open',mobileFiltersOpen);
  };
  mobileFilterButton.addEventListener('click',()=>{
   mobileFiltersOpen=!mobileFiltersOpen;
   syncMobileFilters();
  });
  // Compact champion rows are the default only for phones. Keep the original
  // full card markup available for Detailed mode and for every desktop width.
  const viewStorageKey='summonerindex:champions-view:v1';
  const viewSwitch=document.createElement('div');
  viewSwitch.id='champ-view-switch';
  viewSwitch.className='champ-view-switch';
  viewSwitch.setAttribute('role','group');
  viewSwitch.setAttribute('aria-label','Champion directory display');
  const viewButtons={};
  for(const [mode,label] of [['compact','Compact'],['detailed','Detailed']]){
   const button=document.createElement('button');
   button.type='button';
   button.className='champ-view-option';
   button.dataset.champView=mode;
   button.textContent=label;
   button.setAttribute('aria-controls','champ-results');
   viewSwitch.append(button);
   viewButtons[mode]=button;
  }
  $('#champ-count').after(viewSwitch);
  let chosenView='compact';
  try{if(localStorage.getItem(viewStorageKey)==='detailed')chosenView='detailed';}catch{}
  const syncChampionView=()=>{
   document.body.classList.toggle('champions-view-compact',chosenView==='compact');
   document.body.classList.toggle('champions-view-detailed',chosenView==='detailed');
   for(const [mode,button] of Object.entries(viewButtons)){
    button.classList.toggle('active',mode===chosenView);
    button.setAttribute('aria-pressed',String(mode===chosenView));
   }
  };
  for(const [mode,button] of Object.entries(viewButtons))button.addEventListener('click',()=>{
   chosenView=mode;
   try{localStorage.setItem(viewStorageKey,mode);}catch{}
   syncChampionView();
  });
  syncChampionView();
  document.body.classList.add('champions-mobile-ready');
  let shown=24;
  const more=document.createElement('button');more.id='champ-more';more.textContent='Show 24 more';more.className='primary';$('#champ-results').after(more);
  if(['authored','curated','held'].includes(params.get('guide')))$('#coverage-filter').value=params.get('guide');
  const render=()=>{const query=$('#champ-query').value,cl=$('#class-filter').value,im=$('#immune-filter').value,coverage=$('#coverage-filter').value,rarity=$('#rarity-filter').value,form=$('#immunity-form').value,activation=$('#immunity-activation').value;const immunityFilters={immunity:im,form,activation};let cs=search(db,query,{class:cl,...immunityFilters,guideStatus:coverage}).champions;if(rarity==='7')cs=cs.filter(c=>c.rarityAvailability?.status==='verified'&&c.rarityAvailability.sevenStarAvailable===true);if(rarity==='not-7')cs=cs.filter(c=>c.rarityAvailability?.status==='verified'&&c.rarityAvailability.sevenStarAvailable===false);cs.sort((a,b)=>a.name.localeCompare(b.name));$('#champ-count').textContent=`${cs.length} of ${db.champions.length} champions · showing ${Math.min(shown,cs.length)}`;$('#champ-results').innerHTML=cs.length?cs.slice(0,shown).map(c=>championCard(db,c,immunityFilters)).join(''):'<div class="empty"><h3>No champions match these filters.</h3><p>Try another effect, form or activation setting, or clear other filters. Reviewed coverage is incomplete; no result does not mean no immunity exists.</p></div>';more.hidden=shown>=cs.length;const p=new URLSearchParams();if(query)p.set('q',query);if(cl)p.set('class',cl);if(im)p.set('immunity',im);if(form)p.set('form',form);if(activation!=='always')p.set('activation',activation);if(coverage)p.set('guide',coverage);if(rarity)p.set('rarity',rarity);history.replaceState(null,'',base+'/champions'+(p.size?'?'+p:''));syncSaved();syncMobileFilters();};
  more.onclick=()=>{shown+=24;render();};
  ['#champ-query','#class-filter','#immune-filter','#immunity-form','#immunity-activation','#coverage-filter','#rarity-filter'].forEach(id=>$(id).addEventListener('input',()=>{shown=24;render();}));render();
 }
 if($('#counter-results')){
  if(db.gameModes.some(m=>m.id===params.get('mode')))$('#counter-mode').value=params.get('mode');
  const render=()=>{const target=$('#counter-results').dataset.target,mode=$('#counter-mode').value;$('#counter-results').innerHTML=($('#roster-only').checked?counterResults(db,target,mode,readRoster(db).champions):groupedCounterResults(db,target,mode,readRoster(db).champions));history.replaceState(null,'',location.pathname+(mode?'?mode='+mode:''));track('counter_tool',{target,mode,count:getCounters(db,target,mode).length});};$('#counter-mode').addEventListener('change',render);$('#roster-only').addEventListener('change',render);render();
 }
 if($('#compare-controls')){
  if(params.has('ids')){const ids=[...new Set(params.get('ids').split(','))].filter(id=>db.champions.some(c=>c.id===id)).slice(0,3);if(ids.length){$('#compare-0').value=ids[0];if(ids.length===1){if(!$('#compare-1').querySelector('option[value=""]'))$('#compare-1').insertAdjacentHTML('afterbegin','<option value="">Choose a champion</option>');$('#compare-1').value='';}else $('#compare-1').value=ids[1];$('#compare-2').value=ids[2]||'';}}
  const render=()=>{const all=[...document.querySelectorAll('[data-compare]')].map(s=>s.value).filter(Boolean),ids=[...new Set(all)];$('#compare-status').textContent=ids.length<all.length?'Duplicate selections are shown once. Choose distinct champions for a comparison.':`${ids.length} champions selected. Share this page URL to keep the comparison.`;$('#compare-table').innerHTML=compareTable(db,ids);history.replaceState(null,'',base+'/compare?ids='+ids.join(','));track('compare',{ids});};document.querySelectorAll('[data-compare]').forEach(s=>s.addEventListener('change',render));render();
 }
 if($('#global-query')){
  const input=$('#global-query');input.value=params.get('q')||'';
  const guideLinks=[...document.querySelectorAll('[data-challenge-search]')];
  const filterGuides=q=>{let count=0;const words=q.toLowerCase().replace(/[’']/g,'').split(/\s+/).filter(Boolean);for(const link of guideLinks){link.hidden=!words.length||!words.every(w=>link.dataset.challengeSearch.replace(/[’']/g,'').includes(w));if(!link.hidden)count++;}if($('#challenge-search-results'))$('#challenge-search-results').hidden=!count;return count;};
  const render=()=>{const q=input.value.trim(),guideCount=filterGuides(q);if(!q){$('#search-results').innerHTML='<p class="notice">Search for a champion, boss, ability or immunity.</p>';return;}const {champions,bosses}=search(db,q);const wantsCounter=/counter/i.test(q),count=champions.length+bosses.length+guideCount;$('#search-results').innerHTML=`<p class="result-count">${count} results for “${e(q)}”${/best/i.test(q)?' · Matching profiles, not a ranked tier list':''}</p>`+champions.map(c=>`<a class="search-result" href="/${wantsCounter?'counters':'champions'}/${c.id}">${avatar(c)}<div><h3>${e(c.name)}${wantsCounter?' counters':''}</h3><p>${e(c.class)} · ${e(c.summary)}</p></div><span>→</span></a>`).join('')+bosses.map(b=>`<a class="search-result" href="/${wantsCounter?'counters':'bosses'}/${b.id}"><div><h3>${e(b.name)}${wantsCounter?' counters':''}</h3><p>Boss guide · ${b.chapter}</p></div><span>→</span></a>`).join('')+(count?'':'<div class="empty"><h3>No match in this starter collection.</h3><p>Try a shorter name or browse all champions.</p><a class="text-link" href="/champions">Open database →</a></div>');};
  input.addEventListener('input',render);input.form.addEventListener('submit',event=>{event.preventDefault();history.replaceState(null,'',base+'/search?q='+encodeURIComponent(input.value));render();track('search',{query:input.value.slice(0,120),resultCount:search(db,input.value).champions.length+search(db,input.value).bosses.length});});render();
 }
 if($('#content-editor')){
  const editor=$('#content-editor');editor.value=JSON.stringify(db,null,2);
  const check=()=>{try{const candidate=JSON.parse(editor.value),errors=validate(candidate);$('#validation-results').innerHTML=errors.length?`<div class="notice"><strong>Fix ${errors.length} validation errors</strong><ul>${errors.map(x=>`<li>${e(x)}</li>`).join('')}</ul></div>`:'<div class="notice">Content structure and references passed. Gameplay accuracy still needs human review. Nothing has been published.</div>';return errors.length?null:candidate;}catch(error){$('#validation-results').textContent='Invalid content: '+error.message;return null;}};
  $('#validate-content').onclick=check;$('#reset-content').onclick=()=>{editor.value=JSON.stringify(db,null,2);$('#validation-results').textContent='Published content reloaded.';};
  $('#download-content').onclick=()=>{const data=check();if(!data)return;const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='catalog.candidate.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 }
 if($('#content-editor')){try{const {mountEditor}=await import('./editor.mjs');mountEditor(db,toast);}catch{toast('The editor could not load. Refresh to retry.');}}
}else if(needsCatalog)toast('Interactive content could not load. Refresh to retry; reference pages remain readable.');
if($('#clear-storage'))$('#clear-storage').onclick=()=>{try{localStorage.removeItem('fieldguide:saved');toast('Saved champions cleared');}catch{toast('Browser storage could not be cleared');}};

for(const [id,key,label] of [['#clear-roster','fieldguide:roster:v1','roster'],['#clear-drafts','fieldguide:content-draft:v1','editorial draft']]){
 const button=$(id);if(button)button.onclick=()=>{if(!window.confirm('Clear the local '+label+'? Export a backup first; this cannot be undone here.'))return;try{localStorage.removeItem(key);toast('Local '+label+' cleared');}catch{toast('Browser storage could not be cleared');}};
}
