// Reviewed scope/activation records override source-listed labels for the same effect.
const reviewedAvailability=new Set(['always','conditional']);

export function protectionRecords(c) {
 const reviewed=c.protections||[];
 return [
  ...reviewed,
  ...(c.immunityIds||[])
   .filter(id=>!reviewed.some(p=>p.effectId===id))
   .map(effectId=>({
    effectId,
    forms:[],
    availability:'unknown',
    condition:'Activation and debuff/passive scope not yet reviewed.'
   }))
 ];
}

export function protectionFilterActive(f={}) {
 // "all" is the UI default and must not hide champions until an immunity/form is chosen.
 return Boolean(f.immunity||f.form||f.activation&&f.activation!=='all');
}

export function matchingProtections(c,f={}) {
 return protectionRecords(c).filter(p=>{
  const activationMatches=!f.activation||f.activation==='all'||(f.activation==='either'?reviewedAvailability.has(p.availability):p.availability===f.activation);
  return (!f.immunity||p.effectId===f.immunity)&&(!f.form||p.forms.includes(f.form))&&activationMatches;
 });
}

export function protectionLabel(p) {
 const scope=p.forms.includes('effect')?'Effect-level interaction · not classified as a debuff or passive':p.forms.includes('debuff')&&p.forms.includes('passive')?'Debuffs and passives':p.forms[0]==='debuff'?'Debuffs · passive protection unverified':p.forms[0]==='passive'?'Passives · debuff protection unverified':'Form scope not yet reviewed';
 const activation=p.availability==='always'?'Always active':p.availability==='conditional'?'Conditional':'Activation not yet reviewed';
 return `${scope} · ${activation}`;
}

// The static HTML still supports older cached builds. Normalize the controls in-browser
// and trigger one rerender so the visible state and filtering behavior agree.
if(typeof document!=='undefined')queueMicrotask(()=>{
 const activation=document.querySelector('#immunity-activation');
 if(activation){
  const requested=new URLSearchParams(location.search).get('activation');
  activation.innerHTML='<option value="all">All known immunities</option><option value="always">Always active · reviewed</option><option value="conditional">Conditional · reviewed</option><option value="either">Reviewed only · always or conditional</option><option value="unknown">Unreviewed only</option>';
  activation.value=['all','always','conditional','either','unknown'].includes(requested)?requested:'all';
  activation.dispatchEvent(new Event('input',{bubbles:true}));
 }
 const form=document.querySelector('#immunity-form');
 if(form?.options?.length)form.options[0].textContent='Any form';
});
