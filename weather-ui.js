(function(){
  'use strict';
  const service=window.AdventureWeather;
  const host=()=>document.querySelector('#weatherCard');
  let busy=false;

  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function updatedLabel(iso){
    try{return new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(iso));}catch(e){return 'recently';}
  }
  function statusText(status){
    return {live:'Live forecast',fresh:'Updated recently',cached:'Cached forecast',stale:'Older cached forecast',expired:'Last known forecast'}[status]||'Weather forecast';
  }
  function renderShell(){
    const el=host();if(!el)return;
    el.innerHTML=`<div class="weatherHead"><div><span class="eyebrow">LIVE WEATHER</span><h3>Sevierville / Smoky Mountains</h3></div><button id="refreshWeather" class="weatherRefresh" type="button" aria-label="Refresh weather">↻</button></div><div id="weatherContent" class="weatherContent" aria-live="polite"><div class="weatherLoading"><span>🌤️</span><p>Checking mountain weather…</p></div></div><div class="weatherSource">Forecast by <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a></div>`;
    document.querySelector('#refreshWeather')?.addEventListener('click',()=>refresh(true));
  }
  function renderWeather(result){
    const content=document.querySelector('#weatherContent');if(!content)return;
    const d=result.data;
    const caution=result.status==='stale'||result.status==='expired'?'<p class="weatherCaution">This forecast may be out of date. Refresh when you are online.</p>':'';
    content.innerHTML=`<div class="weatherNow"><div class="weatherIcon" aria-hidden="true">${escapeHtml(d.icon)}</div><div><div class="weatherTemp">${d.temperature===null?'—':`${d.temperature}°`}</div><strong>${escapeHtml(d.condition)}</strong><small>Feels like ${d.feelsLike===null?'—':`${d.feelsLike}°`}</small></div></div><div class="weatherFacts"><div><small>High / Low</small><strong>${d.high===null?'—':`${d.high}°`} / ${d.low===null?'—':`${d.low}°`}</strong></div><div><small>Chance of rain</small><strong>${d.rainChance===null?'—':`${d.rainChance}%`}</strong></div></div><div class="weatherMeta"><span class="weatherStatus ${escapeHtml(result.status)}">${escapeHtml(statusText(result.status))}</span><small>Updated ${escapeHtml(updatedLabel(d.fetchedAt))}</small></div>${caution}`;
  }
  function renderUnavailable(){
    const content=document.querySelector('#weatherContent');if(!content)return;
    content.innerHTML='<div class="weatherUnavailable"><span aria-hidden="true">🌥️</span><div><strong>Weather is unavailable right now.</strong><p>Your adventure plan is still ready.</p></div></div>';
  }
  function setBusy(value){busy=value;const btn=document.querySelector('#refreshWeather');if(btn){btn.disabled=value;btn.classList.toggle('spinning',value);}}
  async function refresh(force){
    if(busy||!service)return;setBusy(true);
    try{renderWeather(await service.loadWeather({force,allowExpired:!navigator.onLine}));}
    catch(e){renderUnavailable();}
    finally{setBusy(false);}
  }
  function init(){renderShell();refresh(false);window.addEventListener('online',()=>refresh(true));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
