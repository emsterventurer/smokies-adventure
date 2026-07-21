const assert=require('assert');const w=require('./weather-service.js');
const payload={timezone:'America/New_York',daily:{time:['2026-08-07','2026-08-08'],weather_code:[1,61],temperature_2m_max:[88.4,82.2],temperature_2m_min:[68.4,66.1],precipitation_probability_max:[20,70]}};
const n=w.normalizeTripForecast(payload,{},Date.parse('2026-07-20T12:00:00Z'));
assert.strictEqual(n.days['2026-08-07'].high,88);assert.strictEqual(n.days['2026-08-08'].rainChance,70);assert(w.buildTripUrl().includes('forecast_days=16'));
console.log('daily weather tests passed');