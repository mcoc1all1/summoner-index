export function validDate(value) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+'T00:00:00Z');
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function readField(row,path){return path.split('.').reduce((value,key)=>value?.[key],row);}
export function writeField(row,path,value){const keys=path.split('.');let target=row;for(const key of keys.slice(0,-1)){target[key]={...(target[key]||{})};target=target[key];}target[keys.at(-1)]=value;}
export function reviewQueue(db){return db.counters.map(c=>{
 const issues=[];
 if(c.review?.status!=='tested')issues.push('Gameplay test pending');
 if(!validDate(c.review?.reviewedAt))issues.push('Review date missing');
 if(!c.review?.gameVersion)issues.push('Game version missing');
 if(typeof c.requirements?.awakened!=='boolean'||!Number.isInteger(c.requirements?.minSignature))issues.push('Roster requirements unreviewed');
 return {id:c.id,name:`${db.champions.find(x=>x.id===c.attackerId)?.name||c.attackerId} → ${[...db.champions,...db.bosses].find(x=>x.id===c.defenderId)?.name||c.defenderId}`,issues};
}).filter(row=>row.issues.length);}
