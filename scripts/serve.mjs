import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const base=process.env.SITE_BASE_PATH||'';
http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 if(base){if(url===base)url='/';else if(url.startsWith(base+'/'))url=url.slice(base.length);else {res.writeHead(404);res.end('Outside preview base path');return;}}
 const file=path.resolve(root,'.'+url);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 let target=file;
 if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
 let status=200;if(!fs.existsSync(target)){target=path.join(root,'404.html');status=404;}
 const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
 res.writeHead(status,{'Content-Type':(types[path.extname(target)]||'application/octet-stream')+'; charset=utf-8'});
 fs.createReadStream(target).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'+base+'/'));
