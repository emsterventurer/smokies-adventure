(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.AdventureWeather=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const CONFIG={
    latitude:35.8681,
    longitude:-83.5618,
    locationLabel:'Sevierville / Smoky Mountains',
    timezone:'America/New_York',
    freshMs:60*60*1000,
    staleMs:6*60*60*1000,
    maxMs:24*60*60*1000,
    cacheKey:'adventureCompanionWeatherM3031',
    tripCacheKey:'adventureCompanionTripWeatherM3042'
  };

  const WEATHER_CODES={
    0:['Clear sky','☀️'],1:['Mainly clear','🌤️'],2:['Partly cloudy','⛅'],3:['Overcast','☁️'],
    45:['Foggy','🌫️'],48:['Rime fog','🌫️'],51:['Light drizzle','🌦️'],53:['Drizzle','🌦️'],55:['Heavy drizzle','🌧️'],
    56:['Light freezing drizzle','🌧️'],57:['Freezing drizzle','🌧️'],61:['Light rain','🌦️'],63:['Rain','🌧️'],65:['Heavy rain','🌧️'],
    66:['Light freezing rain','🌧️'],67:['Freezing rain','🌧️'],71:['Light snow','🌨️'],73:['Snow','🌨️'],75:['Heavy snow','❄️'],77:['Snow grains','🌨️'],
    80:['Light showers','🌦️'],81:['Rain showers','🌧️'],82:['Heavy showers','⛈️'],85:['Light snow showers','🌨️'],86:['Heavy snow showers','❄️'],
    95:['Thunderstorms','⛈️'],96:['Thunderstorms with hail','⛈️'],99:['Severe thunderstorms with hail','⛈️']
  };

  function describeCode(code){
    const pair=WEATHER_CODES[Number(code)]||['Weather update','🌤️'];
    return {label:pair[0],icon:pair[1]};
  }

  function round(value){return Number.isFinite(Number(value))?Math.round(Number(value)):null;}

  function buildUrl(config){
    const c=Object.assign({},CONFIG,config||{});
    const params=new URLSearchParams({
      latitude:String(c.latitude),longitude:String(c.longitude),timezone:c.timezone,
      temperature_unit:'fahrenheit',precipitation_unit:'inch',wind_speed_unit:'mph',
      current:'temperature_2m,apparent_temperature,weather_code,is_day',
      hourly:'precipitation_probability',
      daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      forecast_days:'2'
    });
    return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  }

  function normalize(payload,config,now){
    const c=Object.assign({},CONFIG,config||{});
    if(!payload||!payload.current||!payload.daily||!Array.isArray(payload.daily.time)||!payload.daily.time.length){
      throw new Error('Weather provider returned incomplete data.');
    }
    const current=payload.current,daily=payload.daily;
    const currentTime=current.time||new Date(now||Date.now()).toISOString();
    const dateKey=String(currentTime).slice(0,10);
    let dailyIndex=daily.time.indexOf(dateKey);
    if(dailyIndex<0)dailyIndex=0;
    let rainChance=Array.isArray(daily.precipitation_probability_max)?round(daily.precipitation_probability_max[dailyIndex]):null;
    if(rainChance===null&&payload.hourly&&Array.isArray(payload.hourly.time)&&Array.isArray(payload.hourly.precipitation_probability)){
      const future=payload.hourly.time.map((time,i)=>({time,value:payload.hourly.precipitation_probability[i]}))
        .filter(item=>String(item.time).slice(0,10)===dateKey&&String(item.time)>=String(currentTime));
      if(future.length)rainChance=Math.max(...future.map(item=>Number(item.value)||0));
    }
    const condition=describeCode(current.weather_code);
    return {
      schema:1,provider:'Open-Meteo',location:c.locationLabel,timezone:payload.timezone||c.timezone,
      observedAt:currentTime,fetchedAt:new Date(now||Date.now()).toISOString(),
      temperature:round(current.temperature_2m),feelsLike:round(current.apparent_temperature),
      high:round(daily.temperature_2m_max?.[dailyIndex]),low:round(daily.temperature_2m_min?.[dailyIndex]),
      rainChance,weatherCode:Number(current.weather_code),condition:condition.label,icon:condition.icon,
      isDay:Boolean(current.is_day),sourceUrl:'https://open-meteo.com/'
    };
  }

  function getStorage(storage){return storage||root.localStorage;}
  function readCache(storage){
    try{
      const raw=getStorage(storage)?.getItem(CONFIG.cacheKey);
      if(!raw)return null;
      const parsed=JSON.parse(raw);
      return parsed&&parsed.data&&parsed.savedAt?parsed:null;
    }catch(e){return null;}
  }
  function writeCache(data,storage,now){
    try{getStorage(storage)?.setItem(CONFIG.cacheKey,JSON.stringify({savedAt:now||Date.now(),data}));return true;}catch(e){return false;}
  }
  function cacheState(cache,now){
    if(!cache)return 'missing';
    const age=Math.max(0,(now||Date.now())-Number(cache.savedAt||0));
    if(age<CONFIG.freshMs)return 'fresh';
    if(age<CONFIG.staleMs)return 'cached';
    if(age<CONFIG.maxMs)return 'stale';
    return 'expired';
  }

  async function fetchWeather(options){
    const opts=options||{},fetcher=opts.fetcher||root.fetch;
    if(typeof fetcher!=='function')throw new Error('Weather service requires network access.');
    const response=await fetcher(buildUrl(opts.config),{headers:{Accept:'application/json'}});
    if(!response||!response.ok)throw new Error(`Weather request failed${response?` (${response.status})`:''}.`);
    return normalize(await response.json(),opts.config,opts.now);
  }

  async function loadWeather(options){
    const opts=options||{},now=opts.now||Date.now(),cache=readCache(opts.storage),state=cacheState(cache,now);
    if(!opts.force&&state==='fresh')return {data:cache.data,status:'fresh',fromCache:true};
    try{
      const data=await fetchWeather(opts);
      writeCache(data,opts.storage,now);
      return {data,status:'live',fromCache:false,previous:cache?.data||null};
    }catch(error){
      if(cache&&state!=='expired')return {data:cache.data,status:state,fromCache:true,error};
      if(cache&&opts.allowExpired)return {data:cache.data,status:'expired',fromCache:true,error};
      throw error;
    }
  }


  function buildTripUrl(config){
    const c=Object.assign({},CONFIG,config||{});
    const params=new URLSearchParams({
      latitude:String(c.latitude),longitude:String(c.longitude),timezone:c.timezone,
      temperature_unit:'fahrenheit',precipitation_unit:'inch',wind_speed_unit:'mph',
      daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      forecast_days:'16'
    });
    return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  }

  function normalizeTripForecast(payload,config,now){
    const c=Object.assign({},CONFIG,config||{}),daily=payload&&payload.daily;
    if(!daily||!Array.isArray(daily.time))throw new Error('Weather provider returned incomplete trip data.');
    const days={};
    daily.time.forEach((date,index)=>{
      const condition=describeCode(daily.weather_code?.[index]);
      days[date]={date,high:round(daily.temperature_2m_max?.[index]),low:round(daily.temperature_2m_min?.[index]),rainChance:round(daily.precipitation_probability_max?.[index]),weatherCode:Number(daily.weather_code?.[index]),condition:condition.label,icon:condition.icon};
    });
    return {schema:1,provider:'Open-Meteo',location:c.locationLabel,timezone:payload.timezone||c.timezone,fetchedAt:new Date(now||Date.now()).toISOString(),days};
  }

  function readTripCache(storage){
    try{const raw=getStorage(storage)?.getItem(CONFIG.tripCacheKey);if(!raw)return null;const parsed=JSON.parse(raw);return parsed&&parsed.data&&parsed.savedAt?parsed:null;}catch(e){return null;}
  }
  function writeTripCache(data,storage,now){
    try{getStorage(storage)?.setItem(CONFIG.tripCacheKey,JSON.stringify({savedAt:now||Date.now(),data}));return true;}catch(e){return false;}
  }
  async function fetchTripForecast(options){
    const opts=options||{},fetcher=opts.fetcher||root.fetch;
    if(typeof fetcher!=='function')throw new Error('Weather service requires network access.');
    const response=await fetcher(buildTripUrl(opts.config),{headers:{Accept:'application/json'}});
    if(!response||!response.ok)throw new Error(`Trip weather request failed${response?` (${response.status})`:''}.`);
    return normalizeTripForecast(await response.json(),opts.config,opts.now);
  }
  async function loadTripForecast(options){
    const opts=options||{},now=opts.now||Date.now(),cache=readTripCache(opts.storage),state=cacheState(cache,now);
    if(!opts.force&&state==='fresh')return {data:cache.data,status:'fresh',fromCache:true};
    try{const data=await fetchTripForecast(opts);writeTripCache(data,opts.storage,now);return {data,status:'live',fromCache:false};}
    catch(error){if(cache&&state!=='expired')return {data:cache.data,status:state,fromCache:true,error};if(cache&&opts.allowExpired)return {data:cache.data,status:'expired',fromCache:true,error};throw error;}
  }

  return {CONFIG,WEATHER_CODES,describeCode,buildUrl,normalize,readCache,writeCache,cacheState,fetchWeather,loadWeather,buildTripUrl,normalizeTripForecast,readTripCache,writeTripCache,fetchTripForecast,loadTripForecast};
});
