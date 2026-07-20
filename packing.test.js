const assert=require('assert');const p=require('./packing.js');
function storage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}}
assert.deepStrictEqual(p.TRAVELERS.map(t=>t.name),['Emily','Jake','Kaseryn','Bubbe','Papa','Shared']);
assert(p.BASE_ITEMS.length>=55,'trip-specific packing list should be substantial');
assert(p.BASE_ITEMS.some(i=>i.activity==='zipline'&&i.traveler==='jake'));
assert(p.BASE_ITEMS.some(i=>i.activity==='zipline'&&i.traveler==='kaseryn'));
assert(p.BASE_ITEMS.some(i=>i.activity==='dollywood'));
assert(p.BASE_ITEMS.every(i=>['essential','recommended','optional'].includes(i.priority)));
assert(p.BASE_ITEMS.every(i=>i.reason));
const s=storage(),id=p.BASE_ITEMS[0].id;assert.strictEqual(p.toggle(id,s),true);assert.strictEqual(p.readState(s)[id],true);assert.strictEqual(p.toggle(id,s),false);
assert.strictEqual(p.progress([],{}).milestone,'Getting Started');
console.log('packing tests passed');