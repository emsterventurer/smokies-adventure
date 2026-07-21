const assert=require('assert');
const p=require('./packing.js');
function storage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}}
const LEGACY_SIGNATURES=[
  "m3041-1|emily|clothing|Everyday outfits",
  "m3041-2|emily|clothing|Light layer or cardigan",
  "m3041-3|emily|clothing|Dinner outfit",
  "m3041-4|emily|clothing|Swimsuit and cover-up",
  "m3041-5|emily|toiletries|Personal toiletries",
  "m3041-6|emily|electronics|Phone charger",
  "m3041-7|emily|medications|Daily medications",
  "m3041-8|emily|gear|Comfortable walking shoes",
  "m3041-9|emily|gear|Small crossbody or day bag",
  "m3041-10|emily|gear|Sunscreen and sunglasses",
  "m3041-11|jake|clothing|Everyday outfits",
  "m3041-12|jake|clothing|Athletic clothes",
  "m3041-13|jake|clothing|Light layer",
  "m3041-14|jake|clothing|Swimsuit",
  "m3041-15|jake|toiletries|Personal toiletries",
  "m3041-16|jake|electronics|Phone charger",
  "m3041-17|jake|gear|Closed-toe secure shoes",
  "m3041-18|jake|gear|Comfortable walking shoes",
  "m3041-19|jake|gear|Sunglasses or hat",
  "m3041-20|kaseryn|clothing|Everyday outfits",
  "m3041-21|kaseryn|clothing|Athletic clothes",
  "m3041-22|kaseryn|clothing|Light hoodie",
  "m3041-23|kaseryn|clothing|Swimsuit and cover-up",
  "m3041-24|kaseryn|toiletries|Personal toiletries",
  "m3041-25|kaseryn|electronics|Phone charger",
  "m3041-26|kaseryn|gear|Closed-toe secure shoes",
  "m3042-27|kaseryn|gear|Comfortable walking shoes",
  "m3042-28|kaseryn|gear|Small comfort item or headphones",
  "m3042-29|bubbe|clothing|Everyday outfits",
  "m3042-30|bubbe|clothing|Light layer",
  "m3042-31|bubbe|clothing|Dinner outfit",
  "m3042-32|bubbe|clothing|Swimsuit",
  "m3042-33|bubbe|toiletries|Personal toiletries",
  "m3042-34|bubbe|medications|Daily medications",
  "m3042-35|bubbe|gear|Supportive walking shoes",
  "m3042-36|bubbe|gear|Sun hat and sunglasses",
  "m3042-37|papa|clothing|Everyday outfits",
  "m3042-38|papa|clothing|Light layer",
  "m3042-39|papa|clothing|Dinner outfit",
  "m3042-40|papa|clothing|Swimsuit",
  "m3042-41|papa|toiletries|Personal toiletries",
  "m3042-42|papa|medications|Daily medications",
  "m3042-43|papa|gear|Supportive walking shoes",
  "m3042-44|papa|gear|Sun hat and sunglasses",
  "m3042-45|shared|documents|Lodging confirmation",
  "m3042-46|shared|documents|Tickets and reservation details",
  "m3042-47|shared|documents|Photo IDs and insurance cards",
  "m3042-48|shared|electronics|Shared charging cables and power bank",
  "m3042-49|shared|medications|Family first-aid kit",
  "m3042-50|shared|snacks|Road-trip snacks",
  "m3042-51|shared|snacks|Refillable water bottles",
  "m3042-52|shared|gear|Compact umbrellas or ponchos",
  "m3042-53|shared|gear|Waterproof phone pouch",
  "m3042-54|shared|gear|Small cooler",
  "m3042-55|shared|misc|Laundry bag",
  "m3042-56|shared|misc|Car trash bags and wipes",
  "m3042-57|shared|misc|Aquarium tickets ready on phone",
  "m3042-58|shared|misc|Zipline confirmation and waivers",
  "m3042-59|shared|misc|Cave-friendly light layers",
  "m3042-60|shared|misc|Coaster-ready secure pockets"
];
assert.deepStrictEqual(p.TRAVELERS.map(t=>t.name),['Emily','Jake','Kaseryn','Bubbe','Papa','Shared']);
assert.strictEqual(p.BASE_ITEMS.length,67,'M3-04.3 should contain 60 legacy items plus 7 additions');
assert.deepStrictEqual(p.BASE_ITEMS.slice(0,60).map(i=>`${i.id}|${i.traveler}|${i.category}|${i.label}`),LEGACY_SIGNATURES,'legacy packing IDs or ordering changed');
const additions=p.BASE_ITEMS.slice(60);
assert.deepStrictEqual(additions.map(i=>i.id),['m3043-1','m3043-2','m3043-3','m3043-4','m3043-5','m3043-6','m3043-7']);
assert.strictEqual(new Set(p.BASE_ITEMS.map(i=>i.id)).size,p.BASE_ITEMS.length,'packing IDs must be unique');
for(const traveler of ['jake','kaseryn']) assert(p.BASE_ITEMS.some(i=>i.traveler===traveler&&i.category==='medications'&&i.label==='Daily medications'&&i.priority==='essential'),`${traveler} medication reminder missing`);
for(const traveler of ['emily','jake','kaseryn','bubbe','papa']) assert(p.BASE_ITEMS.some(i=>i.traveler===traveler&&i.label==='Rain jacket or lightweight waterproof shell'&&i.priority==='essential'),`${traveler} rain jacket missing`);
assert(p.BASE_ITEMS.some(i=>i.activity==='zipline'&&i.traveler==='jake'));
assert(p.BASE_ITEMS.some(i=>i.activity==='zipline'&&i.traveler==='kaseryn'));
assert(p.BASE_ITEMS.every(i=>['essential','recommended','optional'].includes(i.priority)));
assert(p.BASE_ITEMS.every(i=>i.reason));
const s=storage(),legacyId='m3041-1';s.setItem(p.STORAGE_KEY,JSON.stringify({[legacyId]:true}));assert.strictEqual(p.readState(s)[legacyId],true,'legacy saved progress must remain readable');
assert.strictEqual(p.toggle(legacyId,s),false);assert.strictEqual(p.toggle(legacyId,s),true);
assert.strictEqual(p.progress([],{}).milestone,'Getting Started');
console.log('packing tests passed');
