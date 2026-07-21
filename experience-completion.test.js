const assert=require('assert');
const packing=require('./packing.js');
const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const styles=fs.readFileSync('styles.css','utf8');
function storage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}}
assert.deepStrictEqual(packing.PARTICIPANTS.map(x=>x.name),['Emily','Jake','Kaseryn','Bubbe','Papa']);
const s=storage();let state={};for(const t of packing.PARTICIPANTS){for(const item of packing.BASE_ITEMS.filter(i=>i.traveler===t.id))state[item.id]=true;}packing.writeState(state,s);
assert(packing.PARTICIPANTS.every(t=>packing.travelerProgress(t.id,packing.readState(s)).ratio===1));
assert.strictEqual(packing.familyReady(packing.readState(s)),true);
assert(app.includes('FAMILY ADVENTURE READINESS'));
assert(app.includes('Campfire Stories'));
assert(styles.includes('experienceDashboardGrid'));
assert(styles.includes('packingReadinessMini'));
console.log('experience completion tests passed');
