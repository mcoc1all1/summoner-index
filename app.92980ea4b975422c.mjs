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
 // Phone labels are deliberately short and the symbols come from one coherent
 // 24px outline family. Original desktop link text and glyphs remain intact,
 // and screen readers keep each destination's complete accessible name.
 const mobileNavIcons={
  '/':'<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/>',
  '/counters':'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
  '/champions':'<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  '/live':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/><path d="M8 14h3m-3 3h3"/>'
 };
 const mobileMoreIcon='<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>';
 const navSvg=paths=>'<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>';
 const mobileTitles={'/':'Home','/counters':'Counters','/champions':'Champions','/live':'Events'};
 for(let i=0;i<primary.length;i++){
  const link=primary[i],path=primaryRoutes[i];
  const textNodes=[...link.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());
  const originalName=textNodes.map(n=>n.textContent.trim()).join(' ')||mobileTitles[path];
  const desktop=document.createElement('span');
  desktop.className='desktop-nav-label';
  desktop.textContent=originalName;
  textNodes[0]?.replaceWith(desktop);
  for(const extra of textNodes.slice(1))extra.remove();
  const glyph=document.createElement('span');
  glyph.className='mobile-nav-icon';
  glyph.setAttribute('aria-hidden','true');
  glyph.innerHTML=navSvg(mobileNavIcons[path]);
  const label=document.createElement('span');
  label.className='mobile-nav-short-label';
  label.setAttribute('aria-hidden','true');
  label.textContent=mobileTitles[path];
  link.setAttribute('aria-label',originalName);
  link.append(glyph,label);
 }
 const more=document.createElement('button');
 more.type='button';
 more.id='mobile-more-toggle';
 more.className='mobile-more-toggle';
 more.setAttribute('aria-controls','mobile-more-panel');
 more.setAttribute('aria-expanded','false');
 more.setAttribute('aria-label','More site sections');
 more.innerHTML='<span class="mobile-nav-icon" aria-hidden="true">'+navSvg(mobileMoreIcon)+'</span><span class="mobile-nav-short-label" aria-hidden="true">More</span>';
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
  ['/twitch-drops','Twitch Drops guide'],
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

// Mobile task-first flow: preserve DOM/tab order while exposing the finder first.
// Restore the original desktop order when the viewport grows.
function setupMobileHomePriority(){
 const main=document.querySelector('body[data-page="/"] main#main');
 const proof=main?.querySelector(':scope > .home-proof');
 const eventCard=main?.querySelector(':scope > .live-home-callout');
 const workspace=main?.querySelector(':scope > .workspace-grid');
 const finder=workspace?.querySelector(':scope > .finder-panel');
 const shortcuts=workspace?.querySelector(':scope > .panel:not(.finder-panel)');
 if(!proof||!eventCard||!workspace||!finder||!shortcuts)return;
 const phone=window.matchMedia('(max-width:800px)');
 const arrange=()=>{
  if(phone.matches){
   main.insertBefore(finder,proof);
   main.insertBefore(eventCard,proof);
   document.body.classList.add('mobile-home-task-first');
  }else{
   workspace.insertBefore(finder,shortcuts);
   main.insertBefore(proof,eventCard);
   document.body.classList.remove('mobile-home-task-first');
  }
 };
 phone.addEventListener('change',arrange);
 arrange();
}
setupMobileHomePriority();

// Keep a single-row search affordance in the phone header. The full search
// form remains in the HTML as the no-JavaScript fallback.
function setupMobileHeaderSearch(){
 const header=document.querySelector('.topbar');
 if(!header||!header.querySelector('.search-form'))return;
 const link=document.createElement('a');
 link.className='mobile-header-search';
 link.href=pageLink('/search');
 link.setAttribute('aria-label','Search all champions and guides');
 link.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="6.4"/><path d="m16 16 5 5"/></svg><span>Search</span>';
 header.querySelector('.theme-switch-mobile')?.before(link);
 document.body.classList.add('mobile-header-search-ready');
}
setupMobileHeaderSearch();

// Optional game mode never blocks the main opponent search on phones.
function setupMobileHomeMode(){
 const mode=document.querySelector('body[data-page="/"] #mode');
 const field=mode?.closest('.field');
 if(!field)return;
 const details=document.createElement('details');
 details.className='home-mode-options';
 details.open=true;
 const summary=document.createElement('summary');
 summary.textContent='Game mode (optional)';
 field.before(details);
 details.append(summary,field);
 const phone=window.matchMedia('(max-width:800px)');
 const sync=()=>{details.open=!phone.matches||Boolean(mode.value)||new URLSearchParams(location.search).has('mode');};
 phone.addEventListener('change',sync);
 sync();
}
setupMobileHomeMode();

// Homepage: preserve the full source/coverage caveat but keep the first
// mobile screen focused on finding a counter. No-JS markup remains readable.
function setupMobileHomeCoverage(){
 const panel=document.querySelector('body[data-page="/"] .finder-panel');
 const coverage=panel?.querySelector('.home-counter-coverage');
 const finder=panel?.querySelector('#finder');
 if(!coverage||!finder)return;
 const disclosure=document.createElement('details');
 disclosure.className='home-coverage-disclosure';
 disclosure.open=true;
 const summary=document.createElement('summary');
 const count=document.createElement('strong');
 count.textContent=coverage.querySelector('strong')?.textContent.trim()||'Some opponents';
 summary.append(count,document.createTextNode(' have named counter suggestions'));
 disclosure.append(summary);
 coverage.before(disclosure);
 disclosure.append(coverage);
 const phone=window.matchMedia('(max-width:800px)');
 const arrange=()=>{
  if(phone.matches){
   finder.after(disclosure);
   disclosure.open=false;
  }else{
   finder.before(disclosure);
   disclosure.open=true;
  }
 };
 phone.addEventListener('change',arrange);
 arrange();
}
setupMobileHomeCoverage();

// The quick loop is enough for a phone's initial scan. All numbered steps
// remain available, and desktop retains the fully expanded instructions.
function setupMobileFightSteps(){
 const details=[...document.querySelectorAll('.play-plan .fight-step-details')];
 if(!details.length)return;
 const phone=window.matchMedia('(max-width:800px)');
 const sync=()=>{for(const item of details)item.open=!phone.matches;};
 phone.addEventListener('change',sync);
 sync();
}
setupMobileFightSteps();

// 2026-11-16 mobile visual-density audit. Keep complete, accessible source
// content in the document and restore the original desktop order on resize.
function setupMobileAuditDensity(){
 const phone=window.matchMedia('(max-width:800px)');
 const syncCallbacks=[];
 const register=sync=>{
  phone.addEventListener('change',sync);
  syncCallbacks.push(sync);
 };
 const page=document.body.dataset.page;
 if(page==='/'){
  const main=document.querySelector('main#main');
  const disclaimer=main?.querySelector(':scope > .home-beta-note');
  if(main&&disclaimer){
   register(()=>{
    if(phone.matches)main.append(disclaimer);
    else main.prepend(disclaimer);
   });
  }
  const form=main?.querySelector('#finder');
  const select=form?.querySelector('#opponent');
  const label=form?.querySelector('label[for="opponent"]');
  const query=form?.querySelector('#opponent-query');
  if(select&&label&&query){
   const details=document.createElement('details');
   details.className='home-opponent-options';
   details.open=true;
   const summary=document.createElement('summary');
   summary.textContent='Browse opponents';
   label.before(details);
   details.append(summary,label,select);
   const update=()=>{
    const count=select.options.length;
    const selected=select.selectedOptions[0]?.textContent?.trim()||'None';
    summary.textContent=query.value.trim()?
     count===0?'No opponent matches':
      count===1?'Match: '+selected:count+' matches · choose opponent':
     'Opponent: '+selected+' · change';
   };
   register(()=>{details.open=!phone.matches;update();});
   query.addEventListener('input',()=>{
    // Run after the existing catalog filter handles the same input event.
    Promise.resolve().then(()=>{
     update();
     if(phone.matches)details.open=select.options.length>1&&select.options.length<=8;
    });
   });
   select.addEventListener('change',()=>{
    update();
    if(phone.matches)details.open=false;
   });
  }
 }
 if(page==='/champions'){
  // The 334-link SEO directory stays in the HTML, but not above the search.
  const main=document.querySelector('main#main');
  const index=main?.querySelector(':scope > .seo-roster-index');
  if(main&&index)register(()=>main.append(index));
 }
 if(page==='/loadouts'){
  const main=document.querySelector('main#main');
  const section=main?.querySelector(':scope > #champion-loadouts');
  const intro=main?.querySelector(':scope > .loadout-intro-details');
  const links=main?.querySelector(':scope > nav.quick-row');
  if(section&&intro&&links){
   register(()=>{
    if(phone.matches)intro.before(section);
    else links.after(section);
    document.body.classList.toggle('loadouts-task-first',phone.matches);
   });
  }
 }
 if(page.startsWith('/champions/')&&page!=='/champions/'){
  const facts=document.querySelector('main#main > .profile-decision-strip');
  if(facts){
   const details=document.createElement('details');
   details.className='profile-facts-mobile';
   details.open=true;
   const summary=document.createElement('summary');
   summary.textContent='Guide facts and research status';
   facts.before(details);
   details.append(summary,facts);
   register(()=>{details.open=!phone.matches;});
  }
 }
 if(page==='/events'){
  const bar=document.querySelector('main#main .live-filter-bar');
  if(bar){
   const details=document.createElement('details');
   details.className='live-mobile-categories';
   details.open=true;
   const summary=document.createElement('summary');
   summary.textContent='Filter event category';
   bar.before(details);
   details.append(summary,bar);
   const update=()=>{
    const active=bar.querySelector('button.active');
    summary.textContent='Category: '+(active?.textContent?.trim()||'All');
   };
   register(()=>{details.open=!phone.matches;update();});
   bar.addEventListener('click',event=>{
    if(event.target.closest('button[data-live-filter]')){
     Promise.resolve().then(()=>{
      update();
      if(phone.matches)details.open=false;
     });
    }
   });
  }
 }
 if(page.startsWith('/bosses/')){
  for(const table of document.querySelectorAll('main#main .boss-cheat-sheet table')){
   const headings=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
   table.setAttribute('role','table');
   for(const row of table.querySelectorAll('tbody tr')){
    row.setAttribute('role','row');
    [...row.querySelectorAll('td')].forEach((cell,index)=>{
     cell.setAttribute('role','cell');
     cell.dataset.phaseLabel=headings[index]||'Detail';
    });
   }
  }
 }
 syncCallbacks.forEach(sync=>sync());
}
setupMobileAuditDensity();
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

import {mountLoadouts} from './loadouts.92980ea4b975422c.mjs';
import {mountRoster,readRoster} from './roster.92980ea4b975422c.mjs';
import {search,escapeHtml as e,validate,getCounters} from './domain.92980ea4b975422c.mjs';
import {championCard,counterResults,groupedCounterResults,compareTable,avatar} from './components.92980ea4b975422c.mjs';
const $=s=>document.querySelector(s);
const catalogSelectors=['#research-rows','#finder','#champ-results','[data-boss-counters]','#counter-results','#compare-controls','#global-query','#content-editor','#roster-manager','#loadout-query','#saved-results'];
const needsCatalog=catalogSelectors.some(selector=>document.querySelector(selector));
// These literal URLs are rewritten to content-hashed assets at build time.
const catalogs={
 finder:'/catalog-finder.92980ea4b975422c.json',roster:'/catalog-roster.92980ea4b975422c.json',champions:'/catalog-champions.92980ea4b975422c.json',
 search:'/catalog-search.92980ea4b975422c.json',counters:'/catalog-counters.92980ea4b975422c.json',
 compare:'/catalog-compare.92980ea4b975422c.json',loadouts:'/catalog-loadouts.92980ea4b975422c.json',full:'/catalog.92980ea4b975422c.json'
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
  // Align filters and display mode in one row on phones; keep both controls
  // independent and fully accessible without changing desktop layout.
  const mobileControls=document.createElement('div');
  mobileControls.className='champ-mobile-controls';
  mobileFilterButton.before(mobileControls);
  mobileControls.append(mobileFilterButton,viewSwitch);
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
  // Keep the existing desktop paging and no-JavaScript HTML. On mobile,
  // group every matching champion once so the alphabet can jump to any letter
  // without an extra "Show 24 more" action.
  const results=$('#champ-results');
  const indexLayout=document.createElement('div');
  indexLayout.className='champ-index-layout';
  results.before(indexLayout);
  indexLayout.append(results);
  const alphabet=document.createElement('nav');
  alphabet.className='champ-alpha-rail';
  alphabet.setAttribute('aria-label','Jump to champions by first letter');
  alphabet.hidden=true;
  indexLayout.append(alphabet);
  const phoneDirectory=window.matchMedia('(max-width:800px)');
  const az='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const startingLetter=name=>{
   const first=(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toUpperCase();
   return az.includes(first)?first:'#';
  };
  let shown=24;
  const more=document.createElement('button');more.id='champ-more';more.textContent='Show 24 more';more.className='primary';indexLayout.after(more);
  const syncActiveLetter=()=>{
   if(!phoneDirectory.matches||alphabet.hidden)return;
   const headings=results.querySelectorAll('.champ-letter-heading');
   let current=headings[0]?.textContent.trim();
   for(const heading of headings){
    if(heading.getBoundingClientRect().top<=90)current=heading.textContent.trim();
    else break;
   }
   for(const button of alphabet.querySelectorAll('button:not(:disabled)')){
    if(button.dataset.champLetter===current)button.setAttribute('aria-current','location');
    else button.removeAttribute('aria-current');
   }
  };
  let pendingScrollFrame=0;
  window.addEventListener('scroll',()=>{
   if(!phoneDirectory.matches||alphabet.hidden||pendingScrollFrame)return;
   pendingScrollFrame=requestAnimationFrame(()=>{pendingScrollFrame=0;syncActiveLetter();});
  },{passive:true});
  alphabet.addEventListener('click',event=>{
   const button=event.target.closest('button[data-champ-letter]:not(:disabled)');
   if(!button)return;
   const heading=document.getElementById('champ-letter-'+button.dataset.champLetter.toLowerCase());
   if(!heading)return;
   heading.focus({preventScroll:true});
   heading.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
   for(const other of alphabet.querySelectorAll('button[aria-current]'))other.removeAttribute('aria-current');
   button.setAttribute('aria-current','location');
  });
  if(['authored','curated','held'].includes(params.get('guide')))$('#coverage-filter').value=params.get('guide');
  const render=()=>{
   const query=$('#champ-query').value,cl=$('#class-filter').value,im=$('#immune-filter').value,coverage=$('#coverage-filter').value,rarity=$('#rarity-filter').value,form=$('#immunity-form').value,activation=$('#immunity-activation').value;
   const immunityFilters={immunity:im,form,activation};
   let cs=search(db,query,{class:cl,...immunityFilters,guideStatus:coverage}).champions;
   if(rarity==='7')cs=cs.filter(c=>c.rarityAvailability?.status==='verified'&&c.rarityAvailability.sevenStarAvailable===true);
   if(rarity==='not-7')cs=cs.filter(c=>c.rarityAvailability?.status==='verified'&&c.rarityAvailability.sevenStarAvailable===false);
   cs.sort((a,b)=>a.name.localeCompare(b.name));
   const onPhone=phoneDirectory.matches;
   $('#champ-count').textContent=`${cs.length} of ${db.champions.length} champions`+(onPhone?'':` · showing ${Math.min(shown,cs.length)}`);
   if(!cs.length){
    results.innerHTML='<div class="empty"><h3>No champions match these filters.</h3><p>Try another effect, form or activation setting, or clear other filters. Reviewed coverage is incomplete; no result does not mean no immunity exists.</p></div>';
    alphabet.hidden=true;
    alphabet.replaceChildren();
   }else if(onPhone){
    const groups=new Map();
    for(const champion of cs){
     const letter=startingLetter(champion.name);
     if(!groups.has(letter))groups.set(letter,[]);
     groups.get(letter).push(champion);
    }
    results.innerHTML=[...groups].map(([letter,champions])=>{
     const id=letter==='#'?'champ-letter-other':'champ-letter-'+letter.toLowerCase();
     return `<section class="champ-letter-section" aria-labelledby="${id}"><h2 class="champ-letter-heading" id="${id}" tabindex="-1">${letter}</h2><div class="champ-letter-grid">${champions.map(c=>championCard(db,c,immunityFilters)).join('')}</div></section>`;
    }).join('');
    // The alphabet always reflects active search/filters; letters without
    // matches are disabled instead of pretending they have a destination.
    alphabet.hidden=groups.size<2;
    alphabet.innerHTML=az.split('').map(letter=>{
     const enabled=groups.has(letter);
     return `<button type="button" data-champ-letter="${letter}" aria-label="${enabled?'Jump to':'No matching'} champions starting with ${letter}" ${enabled?'':'disabled'}>${letter}</button>`;
    }).join('');
   }else{
    alphabet.hidden=true;
    alphabet.replaceChildren();
    results.innerHTML=cs.slice(0,shown).map(c=>championCard(db,c,immunityFilters)).join('');
   }
   more.hidden=onPhone||shown>=cs.length;
   const p=new URLSearchParams();
   if(query)p.set('q',query);if(cl)p.set('class',cl);if(im)p.set('immunity',im);if(form)p.set('form',form);
   if(activation!=='always')p.set('activation',activation);if(coverage)p.set('guide',coverage);if(rarity)p.set('rarity',rarity);
   history.replaceState(null,'',base+'/champions'+(p.size?'?'+p:''));
   syncSaved();syncMobileFilters();syncActiveLetter();
  };
  more.onclick=()=>{shown+=24;render();};
  phoneDirectory.addEventListener('change',render);
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
 if($('#content-editor')){try{const {mountEditor}=await import('./editor.92980ea4b975422c.mjs');mountEditor(db,toast);}catch{toast('The editor could not load. Refresh to retry.');}}
}else if(needsCatalog)toast('Interactive content could not load. Refresh to retry; reference pages remain readable.');
if($('#clear-storage'))$('#clear-storage').onclick=()=>{try{localStorage.removeItem('fieldguide:saved');toast('Saved champions cleared');}catch{toast('Browser storage could not be cleared');}};

for(const [id,key,label] of [['#clear-roster','fieldguide:roster:v1','roster'],['#clear-drafts','fieldguide:content-draft:v1','editorial draft']]){
 const button=$(id);if(button)button.onclick=()=>{if(!window.confirm('Clear the local '+label+'? Export a backup first; this cannot be undone here.'))return;try{localStorage.removeItem(key);toast('Local '+label+' cleared');}catch{toast('Browser storage could not be cleared');}};
}
