const assert=require('assert');
const config=require('./config.js');

assert(Object.isFrozen(config),'Core configuration should be frozen');
assert(Object.isFrozen(config.trip),'Trip configuration should be frozen');

assert.strictEqual(config.trip.start,'2026-08-07T00:00:00');
assert.strictEqual(config.trip.end,'2026-08-15T00:00:00');
assert.strictEqual(config.trip.timezone,'America/New_York');
assert.strictEqual(config.trip.locationLabel,'Sevierville / Smoky Mountains');

assert.deepStrictEqual(
  config.trip.coordinates,
  {latitude:35.8681,longitude:-83.5618}
);

assert.strictEqual(config.weather.freshMs,60*60*1000);
assert.strictEqual(config.weather.staleMs,6*60*60*1000);
assert.strictEqual(config.weather.maxMs,24*60*60*1000);

assert.strictEqual(config.reliability.startupTimeoutMs,3500);
assert.strictEqual(config.reliability.smartStopsGraceMs,2200);
assert.strictEqual(config.reliability.buttonResetMs,1600);

assert.strictEqual(config.features.diagnostics,true);
assert.strictEqual(config.features.weather,true);
assert.strictEqual(config.features.packingCelebrations,true);

console.log('configuration-foundation.test.js passed');
