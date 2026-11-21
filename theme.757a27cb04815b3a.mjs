import './boss-prep.757a27cb04815b3a.mjs';

/* Accessible, persistent theme choice. Dark is the explicit first-visit default. */
const STORAGE_KEY='summonerindex:theme:v1';
const buttons=[...document.querySelectorAll('[data-theme-toggle]')];
const root=document.documentElement;
const readChoice=()=>{
 try{return localStorage.getItem(STORAGE_KEY)==='light'?'light':'dark';}
 catch{return root.dataset.theme==='light'?'light':'dark';}
};
const setTheme=(mode,persist=false)=>{
 const light=mode==='light';
 root.dataset.theme=light?'light':'dark';
 const meta=document.querySelector('meta[name="theme-color"]');
 meta?.setAttribute('content',light?'#F7F3FC':'#120D22');
 for(const button of buttons){
  const next=light?'Switch to Violet Realm dark mode':'Switch to Lilac Dawn light mode';
  button.setAttribute('aria-label',next);
  button.setAttribute('title',next);
  button.setAttribute('aria-pressed',String(light));
  const icon=button.querySelector('.theme-switch-icon');
  const label=button.querySelector('.theme-switch-label');
  if(icon)icon.textContent=light?'☾':'☀';
  if(label)label.textContent=light?'Dark mode':'Light mode';
 }
 if(persist){
  try{localStorage.setItem(STORAGE_KEY,light?'light':'dark');}
  catch{/* Theme remains usable for this page if storage is unavailable. */}
 }
};
setTheme(readChoice());
buttons.forEach(button=>button.addEventListener('click',()=>{
 setTheme(root.dataset.theme==='light'?'dark':'light',true);
}));
window.addEventListener('storage',event=>{
 if(event.key===STORAGE_KEY||event.key===null)setTheme(readChoice());
});
