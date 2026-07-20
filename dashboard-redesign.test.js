const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
function assert(ok,msg){if(!ok)throw new Error(msg)}
assert(app.includes('class="adventureSummary"'),'dashboard summary missing');
assert(app.includes('class="adventureWeather"'),'Adventure Intelligence card missing');
assert(app.includes('View Adaptive Adventure'),'Adaptive Adventure control missing');
assert(app.includes('${smartStopsMarkup(d)}'),'Smart Stop Cards missing from day view');
const show=app.slice(app.indexOf('function showDay(date)'),app.indexOf('DATA = ',app.indexOf('function showDay(date)')));
assert(!show.includes('class=timeline'),'separate timeline still rendered');
assert(!show.includes('Route, driving & parking'),'duplicate route section still rendered');
assert(!show.includes('Foodie callout'),'duplicate foodie section still rendered');
assert(!show.includes('Photos & Plan B'),'duplicate photo/Plan B section still rendered');
assert(css.includes('.adventureSummary'),'dashboard redesign CSS missing');
assert(css.includes('.adaptiveAdventure'),'Adaptive Adventure CSS missing');
console.log('dashboard redesign tests passed');
