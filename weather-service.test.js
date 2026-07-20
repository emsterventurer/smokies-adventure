const assert=require('assert');
const weather=require('./weather-service.js');

const payload={
  timezone:'America/New_York',
  current:{time:'2026-07-20T10:00',temperature_2m:78.4,apparent_temperature:81.6,weather_code:2,is_day:1},
  hourly:{time:['2026-07-20T10:00','2026-07-20T11:00'],precipitation_probability:[20,35]},
  daily:{time:['2026-07-20','2026-07-21'],weather_code:[2,61],temperature_2m_max:[84.2,80],temperature_2m_min:[66.1,64],precipitation_probability_max:[40,70]}
};

const normalized=weather.normalize(payload,null,Date.parse('2026-07-20T14:00:00Z'));
assert.equal(normalized.temperature,78);
assert.equal(normalized.feelsLike,82);
assert.equal(normalized.high,84);
assert.equal(normalized.low,66);
assert.equal(normalized.rainChance,40);
assert.equal(normalized.condition,'Partly cloudy');
assert.equal(normalized.location,'Sevierville / Smoky Mountains');

const url=weather.buildUrl();
assert(url.includes('temperature_unit=fahrenheit'));
assert(url.includes('timezone=America%2FNew_York'));
assert(url.includes('precipitation_probability_max'));

const now=Date.now();
assert.equal(weather.cacheState({savedAt:now-30*60*1000},now),'fresh');
assert.equal(weather.cacheState({savedAt:now-2*60*60*1000},now),'cached');
assert.equal(weather.cacheState({savedAt:now-8*60*60*1000},now),'stale');
assert.equal(weather.cacheState({savedAt:now-25*60*60*1000},now),'expired');

const memory={value:null,getItem(){return this.value},setItem(k,v){this.value=v}};
weather.writeCache(normalized,memory,now-2*60*60*1000);
weather.loadWeather({storage:memory,now,fetcher:async()=>{throw new Error('offline')}}).then(result=>{
  assert.equal(result.status,'cached');
  assert.equal(result.data.temperature,78);
  console.log('weather-service tests passed');
}).catch(error=>{console.error(error);process.exit(1)});
