export function feedbackPage(value,origin,base='') {
 try {
  const url=new URL(value||base+'/',origin);
  if(url.origin!==origin || (base && url.pathname!==base && !url.pathname.startsWith(base+'/')))throw Error();
  return origin+url.pathname;
 } catch {return origin+base+'/';}
}
export function feedbackText(kind,page,details) {
 return `Fieldguide feedback: ${kind}\nPage: ${page}\n\n${details.trim()}`;
}
if(typeof document!=='undefined') {
 const form=document.querySelector('#feedback-form');
 if(form) {
  const field=id=>document.getElementById(id);
  field('feedback-page').value=feedbackPage(new URLSearchParams(location.search).get('path'),location.origin,document.body.dataset.base||'');
  const prepare=()=>field('feedback-draft').value=feedbackText(field('feedback-kind').value,field('feedback-page').value,field('feedback-details').value);
  form.addEventListener('input',prepare);prepare();
  form.addEventListener('submit',event=>{
   event.preventDefault();const text=prepare();
   field('feedback-status').textContent='Opening an email draft. Nothing has been sent by this website. If no email app opens, copy the text below and email mcoc1all1@proton.me.';
   location.href='mailto:mcoc1all1@proton.me?subject='+encodeURIComponent('Fieldguide: '+field('feedback-kind').value)+'&body='+encodeURIComponent(text);
  });
  field('feedback-copy').addEventListener('click',async()=>{
   const text=prepare();
   try {await navigator.clipboard.writeText(text);field('feedback-status').textContent='Copied. Paste into an email to mcoc1all1@proton.me.';}
   catch {field('feedback-draft').focus();field('feedback-draft').select();field('feedback-status').textContent='Copy the selected text manually and email mcoc1all1@proton.me.';}
  });
 }
}
