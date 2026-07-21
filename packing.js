(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.AdventurePacking=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const STORAGE_KEY='adventureCompanionPackingM3041';
  const CELEBRATION_KEY='adventureCompanionPackingCelebratedM3044B';
  const CAMPFIRE_KEY='adventureCompanionCampfireUnlocked';
  const TRAVELERS=[
    {id:'emily',name:'Emily',icon:'👩'},{id:'jake',name:'Jake',icon:'👦'},{id:'kaseryn',name:'Kaseryn',icon:'👧'},
    {id:'bubbe',name:'Bubbe',icon:'👵'},{id:'papa',name:'Papa',icon:'👴'},{id:'shared',name:'Shared',icon:'👨‍👩‍👧‍👦'}
  ];
  const CATEGORIES=[
    {id:'clothing',name:'Clothing',icon:'👕'},{id:'toiletries',name:'Toiletries',icon:'🧴'},{id:'electronics',name:'Electronics',icon:'🔌'},
    {id:'medications',name:'Medications',icon:'💊'},{id:'documents',name:'Documents',icon:'📄'},{id:'gear',name:'Adventure Gear',icon:'🥾'},
    {id:'snacks',name:'Snacks',icon:'🥨'},{id:'misc',name:'Miscellaneous',icon:'✨'}
  ];
  const ACTIVITIES={all:'All activities',travel:'Travel days',dollywood:'Dollywood',aquarium:'Aquarium',zipline:'Zipline',caverns:'Forbidden Caverns',coaster:'Mountain coaster',pool:'Pool time',dinner:'Dinner evenings'};
  const PRIORITY_LABELS={essential:'Essential',recommended:'Recommended',optional:'Optional'};
  const raw=[
    ['emily','clothing','Everyday outfits','essential','travel','Eight-day trip basics.'],['emily','clothing','Light layer or cardigan','recommended','caverns','The cavern and mountain evenings can feel cool.'],['emily','clothing','Dinner outfit','recommended','dinner','For Local Goat, Seasons 101, and The Greenbrier.'],['emily','clothing','Swimsuit and cover-up','recommended','pool','The resort has pool time built in.'],['emily','toiletries','Personal toiletries','essential','travel','Daily personal care.'],['emily','electronics','Phone charger','essential','travel','Navigation, tickets, photos, and family contact.'],['emily','medications','Daily medications','essential','travel','Keep in your personal bag.'],['emily','gear','Comfortable walking shoes','essential','dollywood','Long walking days at Dollywood and downtown stops.'],['emily','gear','Small crossbody or day bag','recommended','dollywood','Keeps essentials secure and hands free.'],['emily','gear','Sunscreen and sunglasses','essential','dollywood','Extended outdoor time in August.'],
    ['jake','clothing','Everyday outfits','essential','travel','Eight-day trip basics.'],['jake','clothing','Athletic clothes','essential','zipline','Secure, comfortable clothing for ziplining.'],['jake','clothing','Light layer','recommended','caverns','Forbidden Caverns stays cooler than outside.'],['jake','clothing','Swimsuit','recommended','pool','For resort pool time.'],['jake','toiletries','Personal toiletries','essential','travel','Daily personal care.'],['jake','electronics','Phone charger','essential','travel','Navigation, photos, and family contact.'],['jake','gear','Closed-toe secure shoes','essential','zipline','Required for safe ziplining.'],['jake','gear','Comfortable walking shoes','essential','dollywood','For a full park day.'],['jake','gear','Sunglasses or hat','recommended','dollywood','Sun protection outdoors.'],
    ['kaseryn','clothing','Everyday outfits','essential','travel','Eight-day trip basics.'],['kaseryn','clothing','Athletic clothes','essential','zipline','Secure and comfortable for ziplining.'],['kaseryn','clothing','Light hoodie','recommended','caverns','Useful inside the cavern and on cooler evenings.'],['kaseryn','clothing','Swimsuit and cover-up','recommended','pool','For resort pool time.'],['kaseryn','toiletries','Personal toiletries','essential','travel','Daily personal care.'],['kaseryn','electronics','Phone charger','essential','travel','Photos and family contact.'],['kaseryn','gear','Closed-toe secure shoes','essential','zipline','Required for safe ziplining.'],['kaseryn','gear','Comfortable walking shoes','essential','dollywood','For a full park day.'],['kaseryn','gear','Small comfort item or headphones','optional','travel','Helpful during the drive or busy moments.'],
    ['bubbe','clothing','Everyday outfits','essential','travel','Eight-day trip basics.'],['bubbe','clothing','Light layer','recommended','caverns','The cavern and evenings can be cool.'],['bubbe','clothing','Dinner outfit','recommended','dinner','For the planned restaurant evenings.'],['bubbe','clothing','Swimsuit','optional','pool','For resort pool time if desired.'],['bubbe','toiletries','Personal toiletries','essential','travel','Daily personal care.'],['bubbe','medications','Daily medications','essential','travel','Pack enough plus a small buffer.'],['bubbe','gear','Supportive walking shoes','essential','dollywood','Comfort for long attraction days.'],['bubbe','gear','Sun hat and sunglasses','recommended','dollywood','Sun protection during outdoor activities.'],
    ['papa','clothing','Everyday outfits','essential','travel','Eight-day trip basics.'],['papa','clothing','Light layer','recommended','caverns','The cavern and evenings can be cool.'],['papa','clothing','Dinner outfit','recommended','dinner','For the planned restaurant evenings.'],['papa','clothing','Swimsuit','optional','pool','For resort pool time if desired.'],['papa','toiletries','Personal toiletries','essential','travel','Daily personal care.'],['papa','medications','Daily medications','essential','travel','Pack enough plus a small buffer.'],['papa','gear','Supportive walking shoes','essential','dollywood','Comfort for long attraction days.'],['papa','gear','Sun hat and sunglasses','recommended','dollywood','Sun protection during outdoor activities.'],
    ['shared','documents','Lodging confirmation','essential','travel','Needed for check-in.'],['shared','documents','Tickets and reservation details','essential','travel','Dollywood, zipline, aquarium, and dining plans.'],['shared','documents','Photo IDs and insurance cards','essential','travel','Travel and emergency essentials.'],['shared','electronics','Shared charging cables and power bank','recommended','travel','Keeps navigation and ticket phones powered.'],['shared','medications','Family first-aid kit','essential','travel','For minor scrapes, headaches, or blisters.'],['shared','snacks','Road-trip snacks','recommended','travel','Makes the drive easier.'],['shared','snacks','Refillable water bottles','essential','dollywood','Hydration for outdoor attraction days.'],['shared','gear','Compact umbrellas or ponchos','recommended','dollywood','Useful for summer showers.'],['shared','gear','Waterproof phone pouch','optional','pool','Protects phones near water or in rain.'],['shared','gear','Small cooler','optional','travel','Useful for drinks and travel snacks.'],['shared','misc','Laundry bag','recommended','travel','Keeps worn clothes organized.'],['shared','misc','Car trash bags and wipes','recommended','travel','Keeps the vehicle comfortable during the trip.'],['shared','misc','Aquarium tickets ready on phone','essential','aquarium','Avoid delays at arrival.'],['shared','misc','Zipline confirmation and waivers','essential','zipline','Needed for the Aug. 12 booking.'],['shared','misc','Cave-friendly light layers','recommended','caverns','Forbidden Caverns is cooler and damp.'],['shared','misc','Coaster-ready secure pockets','recommended','coaster','Loose items should be secured before riding.']
  ];
  const LEGACY_ITEMS=raw.map((x,i)=>({id:i<26?`m3041-${i+1}`:`m3042-${i+1}`,traveler:x[0],category:x[1],label:x[2],priority:x[3],activity:x[4],reason:x[5]}));
  const M3043_ITEMS=[
    {id:'m3043-1',traveler:'jake',category:'medications',label:'Daily medications',priority:'essential',activity:'travel',reason:'Keep in your personal bag and pack enough for the full trip.'},
    {id:'m3043-2',traveler:'kaseryn',category:'medications',label:'Daily medications',priority:'essential',activity:'travel',reason:'Keep in your personal bag and pack enough for the full trip.'},
    {id:'m3043-3',traveler:'emily',category:'gear',label:'Rain jacket or lightweight waterproof shell',priority:'essential',activity:'travel',reason:'Summer mountain showers can arrive quickly.'},
    {id:'m3043-4',traveler:'jake',category:'gear',label:'Rain jacket or lightweight waterproof shell',priority:'essential',activity:'travel',reason:'Summer mountain showers can arrive quickly.'},
    {id:'m3043-5',traveler:'kaseryn',category:'gear',label:'Rain jacket or lightweight waterproof shell',priority:'essential',activity:'travel',reason:'Summer mountain showers can arrive quickly.'},
    {id:'m3043-6',traveler:'bubbe',category:'gear',label:'Rain jacket or lightweight waterproof shell',priority:'essential',activity:'travel',reason:'Summer mountain showers can arrive quickly.'},
    {id:'m3043-7',traveler:'papa',category:'gear',label:'Rain jacket or lightweight waterproof shell',priority:'essential',activity:'travel',reason:'Summer mountain showers can arrive quickly.'}
  ];
  const BASE_ITEMS=[...LEGACY_ITEMS,...M3043_ITEMS];
  function getStorage(storage){return storage||root.localStorage;}
  function readState(storage){try{const value=JSON.parse(getStorage(storage)?.getItem(STORAGE_KEY)||'{}');return value&&typeof value==='object'?value:{};}catch(e){return {};}}
  function writeState(state,storage){try{getStorage(storage)?.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch(e){return false;}}
  function isDone(id,state){return Boolean((state||{})[id]);}
  function toggle(id,storage){const state=readState(storage);state[id]=!state[id];writeState(state,storage);return state[id];}
  function reset(storage){try{getStorage(storage)?.removeItem(STORAGE_KEY);return true;}catch(e){return false;}}
  function progress(items,state){const list=items||BASE_ITEMS,total=list.length,done=list.filter(i=>isDone(i.id,state)).length,ratio=total?done/total:0;return {done,total,ratio,milestone:ratio===1?'Adventure Ready':ratio>=.7?'Almost Ready':ratio>0?'Taking Shape':'Getting Started',icon:ratio===1?'💚':ratio>=.7?'🏔️':ratio>0?'🌿':'🌱'};}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  const PARTICIPANTS=TRAVELERS.filter(t=>t.id!=='shared').map(t=>({...t,active:true}));
  const INDIVIDUAL_CELEBRATIONS_KEY='adventureCompanionIndividualCelebrationsM3044C';
  const FAMILY_CELEBRATION_KEY='adventureCompanionFamilyCelebrationM3044C';
  function itemsForTraveler(id){return BASE_ITEMS.filter(i=>i.traveler===id);}
  function travelerProgress(id,state){return progress(itemsForTraveler(id),state||readState());}
  function readiness(state){const current=state||readState();return PARTICIPANTS.map(t=>({...t,progress:travelerProgress(t.id,current),ready:travelerProgress(t.id,current).ratio===1}));}
  function familyReady(state){const rows=readiness(state);return rows.length>0&&rows.every(row=>row.ready);}
  function readCelebrations(storage){try{return JSON.parse(getStorage(storage)?.getItem(INDIVIDUAL_CELEBRATIONS_KEY)||'{}')||{};}catch(e){return {};}}
  function writeCelebrations(value,storage){try{getStorage(storage)?.setItem(INDIVIDUAL_CELEBRATIONS_KEY,JSON.stringify(value));}catch(e){}}
  function dispatchProgress(){try{root.dispatchEvent?.(new CustomEvent('adventure:packing-progress',{detail:{readiness:readiness(),familyReady:familyReady()}}));}catch(e){}}
  function render(host){
    if(!host)return;let activeTraveler='emily',activeActivity='all';
    function paint(){
      const state=readState(),overall=progress(BASE_ITEMS,state);
      host.innerHTML=`<div class="packingHead"><div><span class="eyebrow">M3-04.4C · EXPERIENCE COMPLETION</span><h3>🎒 Smoky Mountains Packing</h3><p>Each adventurer earns an individual Adventure Ready celebration.</p></div><button id="resetPacking" class="packingReset" type="button">Reset</button></div>
      <section class="packingProgress"><div class="packingMilestone"><span class="packingIcon" aria-hidden="true">${familyReady(state)?"🎒":overall.icon}</span><div><small>${overall.done} of ${overall.total} packed</small><strong>${familyReady(state)?"🎒 Everyone Adventure Ready":overall.milestone}</strong></div></div><div class="packingBar"><i style="width:${Math.round(overall.ratio*100)}%"></i></div></section>
      <section class="packingReadinessMini" aria-label="Adventure readiness">${readiness(state).map(t=>`<span class="${t.ready?'ready':''}">${t.icon} ${t.name} ${t.ready?'✓':'· '+t.progress.done+'/'+t.progress.total}</span>`).join('')}</section>
      <div class="activityFilter"><label for="packingActivity">Show items for</label><select id="packingActivity">${Object.entries(ACTIVITIES).map(([id,name])=>`<option value="${id}" ${id===activeActivity?'selected':''}>${name}</option>`).join('')}</select></div>
      <div class="travelerTabs" role="tablist">${TRAVELERS.map(t=>`<button type="button" role="tab" aria-selected="${t.id===activeTraveler}" class="${t.id===activeTraveler?'active':''}" data-packing-traveler="${t.id}"><span>${t.icon}</span>${t.name}</button>`).join('')}</div><div id="packingLists"></div>`;
      showTraveler();
      host.querySelectorAll('[data-packing-traveler]').forEach(b=>b.addEventListener('click',()=>{activeTraveler=b.dataset.packingTraveler;paint();}));
      host.querySelector('#packingActivity')?.addEventListener('change',e=>{activeActivity=e.target.value;paint();});
      host.querySelector('#resetPacking')?.addEventListener('click',()=>{if(root.confirm?.('Reset every packing checkbox and celebration?')){reset();try{localStorage.removeItem(INDIVIDUAL_CELEBRATIONS_KEY);localStorage.removeItem(FAMILY_CELEBRATION_KEY);localStorage.removeItem(CAMPFIRE_KEY);}catch(e){}paint();dispatchProgress();}});
    }
    function showTraveler(){
      const traveler=TRAVELERS.find(t=>t.id===activeTraveler)||TRAVELERS[0],all=itemsForTraveler(traveler.id),items=all.filter(i=>activeActivity==='all'||i.activity===activeActivity),state=readState(),p=progress(all,state),listHost=host.querySelector('#packingLists');
      listHost.innerHTML=`<div class="travelerSummary"><div><span>${traveler.icon}</span><div><small>${p.done} of ${p.total} packed</small><strong>${traveler.name}</strong></div></div><em>${p.ratio===1?'🎉 Adventure Ready':p.icon+' '+p.milestone}</em></div>${items.length?'':`<p class="packingEmpty">No ${traveler.name} items are assigned to this activity. Check Shared or choose All activities.</p>`}${CATEGORIES.map(c=>{const ci=items.filter(i=>i.category===c.id);if(!ci.length)return'';return `<section class="packingCategory"><h4>${c.icon} ${c.name}</h4>${ci.map(i=>`<label class="packingItem ${isDone(i.id,state)?'done':''}"><input type="checkbox" data-packing-id="${i.id}" ${isDone(i.id,state)?'checked':''}><span class="packingItemBody"><span class="packingItemTop"><b>${escapeHtml(i.label)}</b><em class="priority ${i.priority}">${PRIORITY_LABELS[i.priority]}</em></span><small>${escapeHtml(i.reason)}</small></span></label>`).join('')}</section>`;}).join('')}`;
      listHost.querySelectorAll('[data-packing-id]').forEach(input=>input.addEventListener('change',()=>{
        const before=travelerProgress(activeTraveler).ratio===1;toggle(input.dataset.packingId);const after=travelerProgress(activeTraveler).ratio===1;paint();dispatchProgress();
        if(activeTraveler!=='shared'&&!before&&after)celebrateTraveler(activeTraveler);
        if(familyReady()&&localStorage.getItem(FAMILY_CELEBRATION_KEY)!=='true')setTimeout(celebrateFamily,500);
      }));
    }
    paint();dispatchProgress();
  }
  function confetti(count=38,big=false){
    if(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)return;
    const layer=root.document.createElement('div');layer.className='confettiLayer'+(big?' familyConfetti':'');layer.setAttribute('aria-hidden','true');
    const symbols=['🎉','✨','🌿','🏔️','💚'];layer.innerHTML=Array.from({length:count},(_,i)=>`<i style="--x:${(i*37)%100};--delay:${(i%9)*.08}s;--spin:${(i%2?1:-1)*(180+(i%5)*90)}deg">${symbols[i%symbols.length]}</i>`).join('');
    root.document.body.appendChild(layer);setTimeout(()=>layer.remove(),big?5000:4200);
  }
  function modal(title,body,buttonText='Continue',onClose){
    root.document?.querySelector('.packingCelebration')?.remove();const el=root.document.createElement('section');el.className='packingCelebration';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','packingCelebrationTitle');
    el.innerHTML=`<div class="packingCelebrationCard"><div class="celebrationPack" aria-hidden="true">🎒</div><span class="eyebrow">ADVENTURE READY MILESTONE</span><h2 id="packingCelebrationTitle">${title}</h2>${body}<button type="button">${buttonText}</button></div>`;root.document.body.appendChild(el);const btn=el.querySelector('button');btn?.focus();btn?.addEventListener('click',()=>{el.remove();onClose?.();});
  }
  function celebrateTraveler(id){const traveler=PARTICIPANTS.find(t=>t.id===id);if(!traveler)return;const seen=readCelebrations();if(seen[id])return;seen[id]=true;writeCelebrations(seen);confetti();modal(`${traveler.name}, you’re Adventure Ready!`,`<p>Your personal packing list is complete.</p><strong>You did it. The mountains are waiting.</strong><div class="celebrationPromise">${traveler.icon} ${traveler.name} · ✅ Adventure Ready</div>`,'Celebrate!');}
  function celebrateFamily(){if(!familyReady()||localStorage.getItem(FAMILY_CELEBRATION_KEY)==='true')return;try{localStorage.setItem(FAMILY_CELEBRATION_KEY,'true');localStorage.setItem(CAMPFIRE_KEY,'true');}catch(e){}confetti(70,true);modal('Everyone is Adventure Ready!',`<p>Emily, Jake, Kaseryn, Bubbe, and Papa are packed.</p><strong>The planning is complete. Now let’s make new traditions.</strong><div class="celebrationPromise">🏔️🌿💚</div><p class="campfireNotice">🔥 The Journey Begins has unlocked in Remy’s Corner.</p>`,'Open Remy’s Corner',()=>root.document.querySelector('[data-view="companion"]')?.click());dispatchProgress();}
  function celebrate(){celebrateFamily();}
  return {STORAGE_KEY,TRAVELERS,PARTICIPANTS,CATEGORIES,ACTIVITIES,BASE_ITEMS,readState,writeState,toggle,reset,progress,travelerProgress,readiness,familyReady,render,celebrate,celebrateTraveler,celebrateFamily};
});
