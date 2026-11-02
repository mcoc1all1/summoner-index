import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Version the whole browser dependency graph together, including fetched data.
// Keep stable copies for older pages during the transition to versioned HTML.
export function versionAssets(out,base='') {
 // Remove only generated versioned files from previous local builds.
 for(const name of fs.readdirSync(out))if(/^.+\.[a-f0-9]{16}\.(?:mjs|css|json)$/.test(name))fs.unlinkSync(path.join(out,name));
 const names=fs.readdirSync(out).filter(n=>/\.(?:mjs|css|json)$/.test(n)&&n!=='asset-manifest.json'&&!/\.[a-f0-9]{16}\./.test(n)).sort();
 const originals=new Map(names.map(n=>[n,fs.readFileSync(path.join(out,n),'utf8')]));
 const hash=createHash('sha256').update(JSON.stringify([base,[...originals]])).digest('hex').slice(0,16);
 const assets=Object.fromEntries(names.map(n=>[n,n.replace(/(\.[^.]+)$/,`.${hash}$1`)]));
 for(const [name,text] of originals){
  let output=text;
  if(name.endsWith('.mjs')){
   output=output.replace(/(['"])(\.\/|\/)([^'"\s]+\.(?:mjs|json|css))\1/g,(match,quote,prefix,file)=>assets[file]?`${quote}${prefix}${assets[file]}${quote}`:match);
  }
  fs.writeFileSync(path.join(out,assets[name]),output);
 }
 function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,item.name);
  if(item.isDirectory())walk(file);
  else if(item.name.endsWith('.html')){
   const html=fs.readFileSync(file,'utf8').replace(/\b(src|href)="([^"?#]+)"/g,(match,attribute,url)=>{
    const prefix=base+'/';const name=url.startsWith(prefix)?url.slice(prefix.length):'';
    return assets[name]?`${attribute}="${prefix}${assets[name]}"`:match;
   });
   fs.writeFileSync(file,html);
  }
 }}
 walk(out);
 fs.writeFileSync(path.join(out,'asset-manifest.json'),JSON.stringify({version:hash,assets},null,2)+'\n');
 return {version:hash,assets};
}
