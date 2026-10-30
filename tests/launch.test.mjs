import test from 'node:test';
import assert from 'node:assert/strict';
import {heading,siteOrigin} from '../src/build-safety.mjs';
import {bossCard} from '../src/components.mjs';

test('build headings and boss chapters render imported markup as text',()=>{
 const attack='<img src=x onerror=alert(1)>';
 const hero=heading(attack,attack,attack);
 assert(!hero.includes('<img'));assert.equal(hero.match(/&lt;img/g).length,3);
 const card=bossCard({id:'sample',name:'Example',chapter:attack,summary:'Test'});
 assert(!card.includes('<img'));assert.match(card,/&lt;img/);
});
test('deployment origin rejects credentials and injected URL components',()=>{
 assert.equal(siteOrigin('https://example.com/'),'https://example.com');
 for(const value of ['http://example.com','https://user:pass@example.com','https://example.com/path','https://example.com/?q=x','https://example.com/#fragment','javascript:alert(1)','https://example.com/\"><script>'])assert.throws(()=>siteOrigin(value));
});
