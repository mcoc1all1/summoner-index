/* Runs synchronously before stylesheets to prevent a light-mode flash. */
(function(){
  var key='summonerindex:theme:v1', light=false;
  try{light=localStorage.getItem(key)==='light';}catch(_){}
  document.documentElement.dataset.theme=light?'light':'dark';
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',light?'#F2F5F8':'#0B1422');
})();
