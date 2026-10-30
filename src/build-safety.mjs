import {escapeHtml as e} from './domain.mjs';

export function siteOrigin(value){
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('SITE_ORIGIN must be a bare HTTPS origin, without credentials, a path, query or fragment.');
 return url.origin;
}
export const heading=(eyebrow,title,description)=>`<div class="hero"><div><span class="eyebrow">${e(eyebrow)}</span><h1>${e(title)}</h1><p>${e(description)}</p></div></div>`;
