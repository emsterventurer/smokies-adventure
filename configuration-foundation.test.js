const assert=require('assert');
const fs=require('fs');
const path=require('path');

const root=__dirname;
const config=require('./config.js');
const weather=require('./weather-service.js');

assert(Object.isFrozen(config),'Core configuration should be frozen');
assert(Object.isFrozen(config.trip),'Trip configuration should be frozen');
assert.strictEqual(config.trip.locationLabel,'Sevierville / Smoky Mountains');
assert.strictEqual(config.trip.timezone,'America/New_York');
assert.deepStrictEqual(config.trip.coordinates,{latitude:35.8681,longitude:-83.5618});
assert.strictEqual(weather.CONFIG.latitude,config.trip.coordinates.latitude);
assert.strictEqual(weather.CONFIG.longitude,config.trip.coordinates.longitude);
assert.strictEqual(weather.CONFIG.freshMs,config.weather.freshMs);
assert.strictEqual(weather.CONFIG.cacheKey,config.weather.cacheKey);

const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const configLine=index.split('\n').findIndex(line=>line.includes('src="config.js"'));
const versionLine=index.split('\n').findIndex(line=>line.includes('src="version.js"'));
const reliabilityLine=index.split('\n').findIndex(line=>line.includes('src="reliability.js"'));
assert(configLine>=0,'index.html should load config.js');
assert(configLine<=versionLine,'config.js should load before version.js');
assert(configLine<reliabilityLine,'config.js should load before reliability.js');

const serviceWorker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
assert(serviceWorker.includes('importScripts("./config.js","./version.js")'));
assert(serviceWorker.includes('"./config.js"'));

const version=require('./version.js');
assert.strictEqual(version.build,'Build 2');
assert.strictEqual(version.cache,'adventure-companion-m3-05-0b-build-2');

console.log('configuration-foundation.test.js passed');
