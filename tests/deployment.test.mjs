import test from 'node:test';
import assert from 'node:assert/strict';
import {basePath,localAttributes,betaNoindex} from '../src/deployment.mjs';
import {feedbackPage,feedbackText} from '../src/feedback.mjs';
test('deployment paths reject traversal and preserve external URLs',()=>{
 assert.equal(basePath('/summoner-index/'),'/summoner-index');
 for(const bad of ['/../x','//evil.test','/x?y','/x"','/x%2fy'])assert.throws(()=>basePath(bad));
 assert.equal(localAttributes('<a href="/champions?a=b">A</a><a href="https://example.org">B</a><a href="#x">C</a>','/summoner-index'),'<a href="/summoner-index/champions?a=b">A</a><a href="https://example.org">B</a><a href="#x">C</a>');
});
test('beta never indexes provisional gameplay pages or overrides existing exclusions',()=>{
 assert.equal(betaNoindex('/champions/doctor-doom',false,true),true);
 assert.equal(betaNoindex('/',false,true),false);
 assert.equal(betaNoindex('/methodology',true,true),true);
});
test('feedback strips query secrets and rejects external or outside-project pages',()=>{
 const origin='https://mcoc1all1.github.io',base='/summoner-index';
 assert.equal(feedbackPage(base+'/quests?token=secret#part',origin,base),origin+base+'/quests');
 for(const bad of ['https://evil.test/a','//evil.test/a','/another-project',base+'/../other'])assert.equal(feedbackPage(bad,origin,base),origin+base+'/');
 assert.match(feedbackText('Bug report',origin+base,'  Broken filter  '),/Broken filter$/);
});
