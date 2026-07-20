const assert=require('assert');
const packing=require('./packing.js');

class MemoryStorage{
  constructor(){this.map=new Map();}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.map.set(key,String(value));}
  removeItem(key){this.map.delete(key);}
}

const storage=new MemoryStorage();
assert.equal(packing.TRAVELERS.length,6);
assert.deepEqual(packing.TRAVELERS.map(t=>t.name),['Emily','Jake','Kaseryn','Bubbe','Papa','Shared']);
assert.equal(packing.progress(packing.BASE_ITEMS,{}).milestone,'Getting Started');
const first=packing.BASE_ITEMS[0];
assert.equal(packing.toggle(first.id,storage),true);
assert.equal(packing.readState(storage)[first.id],true);
const complete=Object.fromEntries(packing.BASE_ITEMS.map(item=>[item.id,true]));
assert.equal(packing.progress(packing.BASE_ITEMS,complete).milestone,'Adventure Ready');
packing.reset(storage);
assert.deepEqual(packing.readState(storage),{});
console.log('packing tests passed');
