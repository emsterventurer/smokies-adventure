(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.AdventurePacking=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const STORAGE_KEY='adventureCompanionPackingM3041';
  const TRAVELERS=[
    {id:'emily',name:'Emily',icon:'👩'},
    {id:'jake',name:'Jake',icon:'👦'},
    {id:'kaseryn',name:'Kaseryn',icon:'👧'},
    {id:'bubbe',name:'Bubbe',icon:'👵'},
    {id:'papa',name:'Papa',icon:'👴'},
    {id:'shared',name:'Shared',icon:'👨‍👩‍👧‍👦'}
  ];
  const CATEGORIES=[
    {id:'clothing',name:'Clothing',icon:'👕'},
    {id:'toiletries',name:'Toiletries',icon:'🧴'},
    {id:'electronics',name:'Electronics',icon:'🔌'},
    {id:'medications',name:'Medications',icon:'💊'},
    {id:'documents',name:'Documents',icon:'📄'},
    {id:'gear',name:'Adventure Gear',icon:'🥾'},
    {id:'snacks',name:'Snacks',icon:'🥨'},
    {id:'misc',name:'Miscellaneous',icon:'✨'}
  ];

  const BASE_ITEMS=[
    ['emily','clothing','Everyday outfits'],['emily','toiletries','Personal toiletries'],['emily','electronics','Phone charger'],['emily','medications','Daily medications'],
    ['jake','clothing','Everyday outfits'],['jake','toiletries','Personal toiletries'],['jake','electronics','Phone charger'],['jake','gear','Comfortable walking shoes'],
    ['kaseryn','clothing','Everyday outfits'],['kaseryn','toiletries','Personal toiletries'],['kaseryn','electronics','Phone charger'],['kaseryn','gear','Comfortable walking shoes'],
    ['bubbe','clothing','Everyday outfits'],['bubbe','toiletries','Personal toiletries'],['bubbe','medications','Daily medications'],['bubbe','gear','Comfortable walking shoes'],
    ['papa','clothing','Everyday outfits'],['papa','toiletries','Personal toiletries'],['papa','medications','Daily medications'],['papa','gear','Comfortable walking shoes'],
    ['shared','documents','Lodging confirmation'],['shared','documents','Tickets and reservation details'],['shared','electronics','Shared charging cables'],['shared','medications','Family first-aid kit'],['shared','snacks','Road-trip snacks'],['shared','misc','Reusable water bottles']
  ].map((item,index)=>({id:`m3041-${index+1}`,traveler:item[0],category:item[1],label:item[2]}));

  function getStorage(storage){return storage||root.localStorage;}
  function readState(storage){
    try{
      const value=JSON.parse(getStorage(storage)?.getItem(STORAGE_KEY)||'{}');
      return value&&typeof value==='object'?value:{};
    }catch(error){return {};}
  }
  function writeState(state,storage){
    try{getStorage(storage)?.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch(error){return false;}
  }
  function isDone(id,state){return Boolean((state||{})[id]);}
  function toggle(id,storage){const state=readState(storage);state[id]=!state[id];writeState(state,storage);return state[id];}
  function reset(storage){try{getStorage(storage)?.removeItem(STORAGE_KEY);return true;}catch(error){return false;}}
  function progress(items,state){
    const list=items||BASE_ITEMS,total=list.length,done=list.filter(item=>isDone(item.id,state)).length;
    const ratio=total?done/total:0;
    const milestone=ratio===1?'Adventure Ready':ratio>=.7?'Almost Ready':ratio>0?'Taking Shape':'Getting Started';
    const icon=ratio===1?'💚':ratio>=.7?'🏔️':ratio>0?'🌿':'🌱';
    return {done,total,ratio,milestone,icon};
  }
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

  function render(host){
    if(!host)return;
    const state=readState();
    const overall=progress(BASE_ITEMS,state);
    host.innerHTML=`<div class="packingHead"><div><span class="eyebrow">M3-04.1 · PACKING FOUNDATION</span><h3>🎒 Family Packing</h3><p>Start with the essentials. Trip-specific and weather-aware suggestions arrive in the next packing milestones.</p></div><button id="resetPacking" class="packingReset" type="button">Reset</button></div>
      <section class="packingProgress" aria-label="Packing progress"><div class="packingMilestone"><span>${overall.icon}</span><div><small>${overall.done} of ${overall.total} packed</small><strong>${overall.milestone}</strong></div></div><div class="packingBar"><i style="width:${Math.round(overall.ratio*100)}%"></i></div></section>
      <div class="travelerTabs" role="tablist">${TRAVELERS.map((traveler,index)=>`<button type="button" role="tab" aria-selected="${index===0}" class="${index===0?'active':''}" data-packing-traveler="${traveler.id}"><span>${traveler.icon}</span>${traveler.name}</button>`).join('')}</div>
      <div id="packingLists"></div>`;

    function showTraveler(travelerId){
      const traveler=TRAVELERS.find(item=>item.id===travelerId)||TRAVELERS[0];
      const items=BASE_ITEMS.filter(item=>item.traveler===traveler.id);
      const current=readState();
      const travelerProgress=progress(items,current);
      const listHost=host.querySelector('#packingLists');
      listHost.innerHTML=`<div class="travelerSummary"><div><span>${traveler.icon}</span><div><small>${travelerProgress.done} of ${travelerProgress.total} packed</small><strong>${traveler.name}</strong></div></div><em>${travelerProgress.icon} ${travelerProgress.milestone}</em></div>
      ${CATEGORIES.map(category=>{
        const categoryItems=items.filter(item=>item.category===category.id);
        if(!categoryItems.length)return '';
        return `<section class="packingCategory"><h4>${category.icon} ${category.name}</h4>${categoryItems.map(item=>`<label class="packingItem ${isDone(item.id,current)?'done':''}"><input type="checkbox" data-packing-id="${item.id}" ${isDone(item.id,current)?'checked':''}><span>${escapeHtml(item.label)}</span></label>`).join('')}</section>`;
      }).join('')}`;
      listHost.querySelectorAll('[data-packing-id]').forEach(input=>input.addEventListener('change',()=>{
        toggle(input.dataset.packingId);
        render(host);
        const active=host.querySelector(`[data-packing-traveler="${traveler.id}"]`);
        active?.click();
      }));
    }

    host.querySelectorAll('[data-packing-traveler]').forEach(button=>button.addEventListener('click',()=>{
      host.querySelectorAll('[data-packing-traveler]').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-selected',String(item===button));});
      showTraveler(button.dataset.packingTraveler);
    }));
    host.querySelector('#resetPacking')?.addEventListener('click',()=>{if(root.confirm?.('Reset every packing checkbox?')){reset();render(host);}});
    showTraveler('emily');
  }

  return {STORAGE_KEY,TRAVELERS,CATEGORIES,BASE_ITEMS,readState,writeState,toggle,reset,progress,render};
});
