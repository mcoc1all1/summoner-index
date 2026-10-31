const base=document.body.dataset.base||'';
const route=document.body.dataset.page;
import {mountLoadouts} from './loadouts.mjs';
import {mountRoster,readRoster} from './roster.mjs';
import {search,escapeHtml as e,validate,getCounters} from './domain.mjs';
import {championCard,counterResults,compareTable,avatar} from './components.mjs';
const $=s=>document.querySelector(s);
const needsCatalog=!['/privacy','/methodology','/404','/feedback'].includes(route);
const db=needsCatalog?await fetch(base+'/catalog.json').then(r=>{if(!r.ok)throw Error('Content unavailable');return r.json();}).catch(()=>null):null;
function toast(text){const t=$('#toast');t.textContent=text;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,3500);}
function track(name,properties={}) { window.dispatchEvent(new CustomEvent('fieldguide:analytics',{detail:{name,properties}}));}
function readSaved(){try{const ids=JSON.parse(localStorage.getItem('fieldguide:saved')||'[]');return Array.isArray(ids)?ids.filter(id=>db?.champions.some(c=>c.id===id)):[];}catch{return [];}}
function syncSaved(){document.querySelectorAll('[data-save]').forEach(b=>{const saved=readSaved().includes(b.dataset.save);b.setAttribute('aria-pressed',String(saved));b.textContent=saved?'★':'☆';});}
function showSaved(){if(!$('#saved-results')||!db)return;const cs=db.champions.filter(c=>readSaved().includes(c.id));$('#saved-results').innerHTML=cs.length?cs.map(c=>championCard(db,c)).join(''):'<div class="empty"><h3>Your shortlist starts here.</h3><p>Tap the star on any champion to save them on this browser.</p><a class="text-link" href="/champions">Browse champions →</a></div>';syncSaved();}
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-save]');
 if(b){const ids=readSaved(),id=b.dataset.save;const next=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];try{localStorage.setItem('fieldguide:saved',JSON.stringify(next));toast(next.includes(id)?'Champion saved on this browser':'Champion removed');syncSaved();showSaved();}catch{toast('Browser storage is unavailable. Champion was not saved.');}}
 const v=event.target.closest('[data-video]');if(v)track('outbound_youtube',{videoId:v.dataset.video});
});
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
 const finder=$('#finder');
 if(finder){
  if(db.champions.some(c=>c.id===params.get('opponent'))||db.bosses.some(c=>c.id===params.get('opponent')))$('#opponent').value=params.get('opponent');
  if(db.gameModes.some(m=>m.id===params.get('mode')))$('#mode').value=params.get('mode');
  finder.addEventListener('submit',event=>{event.preventDefault();track('counter_search',{opponent:$('#opponent').value,mode:$('#mode').value});location.href=`${base}/counters/${$('#opponent').value}${$('#mode').value?'?mode='+$('#mode').value:''}`;});
  if(route==='/counters'&&params.has('opponent'))location.replace(`${base}/counters/${$('#opponent').value}${$('#mode').value?'?mode='+$('#mode').value:''}`);
 }
 if($('#champ-results')){
  $('#champ-query').value=params.get('q')||'';
  if(db.champions.some(c=>c.class===params.get('class')))$('#class-filter').value=params.get('class');
  if(db.immunities.some(i=>i.id===params.get('immunity')))$('#immune-filter').value=params.get('immunity');
  let shown=24;
  const more=document.createElement('button');more.id='champ-more';more.textContent='Show 24 more';more.className='primary';$('#champ-results').after(more);
  if(['curated','roster'].includes(params.get('coverage')))$('#coverage-filter').value=params.get('coverage');
  const render=()=>{const query=$('#champ-query').value,cl=$('#class-filter').value,im=$('#immune-filter').value,coverage=$('#coverage-filter').value;const cs=search(db,query,{class:cl,immunity:im,coverage}).champions.sort((a,b)=>a.name.localeCompare(b.name));$('#champ-count').textContent=`${cs.length} of ${db.champions.length} champions · showing ${Math.min(shown,cs.length)}`;$('#champ-results').innerHTML=cs.length?cs.slice(0,shown).map(c=>championCard(db,c)).join(''):'<div class="empty"><h3>No champions match these filters.</h3><p>Try another class or clear the immunity and coverage filters. Unreviewed entries have no catalogued immunities.</p></div>';more.hidden=shown>=cs.length;const p=new URLSearchParams();if(query)p.set('q',query);if(cl)p.set('class',cl);if(im)p.set('immunity',im);if(coverage)p.set('coverage',coverage);history.replaceState(null,'','/champions'+(p.size?'?'+p:''));syncSaved();};
  more.onclick=()=>{shown+=24;render();};
  ['#champ-query','#class-filter','#immune-filter','#coverage-filter'].forEach(id=>$(id).addEventListener('input',()=>{shown=24;render();}));render();
 }
 if($('#counter-results')){
  if(db.gameModes.some(m=>m.id===params.get('mode')))$('#counter-mode').value=params.get('mode');
  const render=()=>{const target=$('#counter-results').dataset.target,mode=$('#counter-mode').value;$('#counter-results').innerHTML=counterResults(db,target,mode,$('#roster-only').checked?readRoster(db).champions:null);history.replaceState(null,'',location.pathname+(mode?'?mode='+mode:''));track('counter_tool',{target,mode,count:getCounters(db,target,mode).length});};$('#counter-mode').addEventListener('change',render);$('#roster-only').addEventListener('change',render);render();
 }
 if($('#compare-controls')){
  if(params.has('ids')){const ids=[...new Set(params.get('ids').split(','))].filter(id=>db.champions.some(c=>c.id===id)).slice(0,3);if(ids.length){$('#compare-0').value=ids[0];$('#compare-1').value=ids[1]||db.champions.find(c=>c.id!==ids[0]).id;$('#compare-2').value=ids[2]||'';}}
  const render=()=>{const all=[...document.querySelectorAll('[data-compare]')].map(s=>s.value).filter(Boolean),ids=[...new Set(all)];$('#compare-status').textContent=ids.length<all.length?'Duplicate selections are shown once. Choose distinct champions for a comparison.':`${ids.length} champions selected. Share this page URL to keep the comparison.`;$('#compare-table').innerHTML=compareTable(db,ids);history.replaceState(null,'','/compare?ids='+ids.join(','));track('compare',{ids});};document.querySelectorAll('[data-compare]').forEach(s=>s.addEventListener('change',render));render();
 }
 if($('#global-query')){
  const input=$('#global-query');input.value=params.get('q')||'';
  const render=()=>{const q=input.value.trim();if(!q){$('#search-results').innerHTML='<p class="notice">Search for a champion, boss, ability or immunity.</p>';return;}const {champions,bosses}=search(db,q);const wantsCounter=/counter/i.test(q),count=champions.length+bosses.length;$('#search-results').innerHTML=`<p class="result-count">${count} results for “${e(q)}”${/best/i.test(q)?' · Matching profiles, not a ranked tier list':''}</p>`+champions.map(c=>`<a class="search-result" href="/${wantsCounter?'counters':'champions'}/${c.id}">${avatar(c)}<div><h3>${e(c.name)}${wantsCounter?' counters':''}</h3><p>${e(c.class)} · ${e(c.summary)}</p></div><span>→</span></a>`).join('')+bosses.map(b=>`<a class="search-result" href="/${wantsCounter?'counters':'bosses'}/${b.id}"><div><h3>${e(b.name)}${wantsCounter?' counters':''}</h3><p>Boss guide · ${b.chapter}</p></div><span>→</span></a>`).join('')+(count?'':'<div class="empty"><h3>No match in this starter collection.</h3><p>Try a shorter name or browse all champions.</p><a class="text-link" href="/champions">Open database →</a></div>');};
  input.addEventListener('input',render);input.form.addEventListener('submit',event=>{event.preventDefault();history.replaceState(null,'','/search?q='+encodeURIComponent(input.value));render();track('search',{query:input.value.slice(0,120),resultCount:search(db,input.value).champions.length+search(db,input.value).bosses.length});});render();
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

