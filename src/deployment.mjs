export function basePath(value='') {
 if(value===''||value==='/')return '';
 if(!/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\/?$/.test(value))throw Error('SITE_BASE_PATH must contain only safe path segments');
 return value.replace(/\/$/,'');
}
// Apply to static HTML and HTML templates in emitted modules. External URLs and anchors stay intact.
export function localAttributes(text,base) {
 return text.replace(/\b(href|src|action)="\/(?!\/)/g,`$1="${base}/`);
}
export function betaNoindex(route,existing,beta) {
 return existing || (beta && !['/','/methodology'].includes(route));
}
