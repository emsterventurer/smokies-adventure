
window.addEventListener("load",()=>{
  const splash=$("#brandSplash");
  setTimeout(()=>splash?.classList.add("hide"),900);
  setTimeout(()=>splash?.remove(),1600);
});

let DATA;
const start=new Date("2026-08-07T00:00:00"), end=new Date("2026-08-15T00:00:00"), planning=new Date("2026-07-01T00:00:00");
const phases=["dreaming","planning","experiencing","remembering"];
const meta={dreaming:["🌱","Dreaming"],planning:["🌿","Planning"],experiencing:["🏔️🌿","Experiencing"],remembering:["🌳","Remembering"]};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const localISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function phase(d){d=new Date(d.getFullYear(),d.getMonth(),d.getDate());return d<planning?"dreaming":d<start?"planning":d<end?"experiencing":"remembering"}

const DAY_DASH={
  "2026-08-07":{icon:"🧳",leave:"5:35 PM",first:"Check in at Club Wyndham",reservation:"Local Goat · 6:00 PM",sunset:"8:30 PM",pace:"Easy arrival evening",focus:"Arrive, settle in, and celebrate"},
  "2026-08-08":{icon:"🏞️",leave:"9:05 AM",first:"Five Oaks Farm Kitchen",reservation:"Wild Plum · 1:30 PM",sunset:"8:29 PM",pace:"Full but flexible",focus:"Waterfall, artisans, and local flavor"},
  "2026-08-09":{icon:"🌿",leave:"9:20 AM",first:"Relaxed breakfast",reservation:"Seasons 101 · 6:00 PM",sunset:"8:28 PM",pace:"Restorative",focus:"Slow down and enjoy the resort"},
  "2026-08-10":{icon:"🎢",leave:"8:05 AM",first:"Dollywood",reservation:"Tickets ready",sunset:"8:27 PM",pace:"Big adventure day",focus:"Arrive before opening and pace the park"},
  "2026-08-11":{icon:"🪨",leave:"10:20 AM",first:"Forbidden Caverns",reservation:"Walk-up cave tour",sunset:"8:26 PM",pace:"Adventure + protected rest",focus:"Caves, barbecue, and a night coaster"},
  "2026-08-12":{icon:"🦜",leave:"8:25 AM",first:"Lil Black Bear Café",reservation:"Zipline · 10:30 AM",sunset:"8:25 PM",pace:"Active with a meaningful finish",focus:"Zipline, animals, history, and sunset"},
  "2026-08-13":{icon:"🐧",leave:"8:55 AM",first:"Pancake Pantry",reservation:"Greenbrier · 6:15 PM",sunset:"8:24 PM",pace:"Grand finale",focus:"Aquarium and farewell dinner"},
  "2026-08-14":{icon:"🏡",leave:"Checkout plan",first:"Relaxed breakfast",reservation:"None",sunset:"8:23 PM",pace:"Gentle departure",focus:"Pack calmly and choose a final memory"}
};
const COMPLETE_KEY="acCompletedDays008";
function completedDays(){try{return JSON.parse(localStorage.getItem(COMPLETE_KEY)||"[]")}catch(e){return[]}}
function isComplete(date){return completedDays().includes(date)}
function setComplete(date,value){
  const set=new Set(completedDays());
  value?set.add(date):set.delete(date);
  localStorage.setItem(COMPLETE_KEY,JSON.stringify([...set]));
  renderJourney(new Date($("#previewDate")?.value+"T12:00:00"||Date.now()));
}
function dayNumber(date){return DATA.days.findIndex(d=>d.date===date)+1}
function dateLabel(date){return new Date(date+"T12:00:00").toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}
function dashboardMarkup(d){
  const x=DAY_DASH[d.date]||{};
  const complete=isComplete(d.date);
  return `<section class="dailyDashboard">
    <div class="dashboardLead">
      <span class="dashboardIcon">${x.icon||"🏔️"}</span>
      <div><span class="eyebrow">DAY ${dayNumber(d.date)} DASHBOARD</span><h3>${dateLabel(d.date)}</h3><p>${x.focus||d.theme}</p></div>
      <button class="completeDay ${complete?"done":""}" data-complete="${d.date}" type="button" aria-pressed="${complete}">${complete?"✓ Complete":"Mark complete"}</button>
    </div>
    <div class="dashboardGrid">
      <article><small>⏰ LEAVE BY</small><strong>${x.leave||"See timeline"}</strong></article>
      <article><small>📍 FIRST STOP</small><strong>${x.first||d.schedule[0][1]}</strong></article>
      <article><small>🎟️ KEY BOOKING</small><strong>${x.reservation||"No timed booking"}</strong></article>
      <article><small>🚗 DRIVE</small><strong>${d.drive}</strong></article>
      <article><small>💵 DAY BUDGET</small><strong>${d.budget}</strong></article>
      <article><small>🌅 SUNSET</small><strong>${x.sunset||"Check closer to trip"}</strong></article>
    </div>
    <div class="dashboardFooter"><span>🌿 ${x.pace||"Flexible pace"}</span><span class="weatherSoon">Weather connects in Milestone 3</span></div>
  </section>`;
}

function drawPhase(d){const p=phase(d),i=phases.indexOf(p);$("#phaseBadge").textContent=meta[p][1];$$(".phases div").forEach((e,n)=>{e.className=n===i?"active":n<i?"done":""});$$(".phases i").forEach((e,n)=>e.className=n<i?"done":"");drawHome(d,p)}
function drawHome(d,p){let h="";
if(p==="dreaming")h=`<div class=big>🌱</div><h3>Let the idea take root.</h3><p>Capture possibilities and what would make this adventure meaningful.</p>`;
if(p==="planning"){
  const days=Math.ceil((start-new Date(d.getFullYear(),d.getMonth(),d.getDate()))/86400000);
  const first=DATA.days[0],x=DAY_DASH[first.date];
  h=`<div class=countdownSplit><div><div class=big>${days}</div><h3>${days===1?"day":"days"} until the Smokies</h3><p>The itinerary is connected. Your first Daily Dashboard is ready.</p></div>
  <div class=nextAdventure><span class=eyebrow>FIRST ADVENTURE</span><b>${x.icon} ${first.title}</b><small>${x.leave} · ${x.reservation}</small></div></div>
  <button class=primary data-day="${first.date}">Preview Day 1 Dashboard</button>`
}
if(p==="experiencing"){
  const day=DATA.days.find(x=>x.date===localISO(d))||DATA.days[0];
  h=`${dashboardMarkup(day)}<button class=primary data-day="${day.date}">Open today's full timeline</button>`
}
if(p==="remembering")h=`<div class=big>🌳</div><h3>This adventure is part of your story.</h3><p>Gather the photos, laughter, favorite meals, and lessons you want to carry forward.</p><button class=primary id=next>🏔️ Plan Your Next Adventure</button>`;
$("#homeCard").innerHTML=h;bindDynamic();bindCompletion()}
function bindDynamic(){$$("[data-go]").forEach(b=>b.onclick=()=>view(b.dataset.go));$$("[data-day]").forEach(b=>b.onclick=()=>showDay(b.dataset.day));$("#next")?.addEventListener("click",()=>$("#homeCard").insertAdjacentHTML("beforeend","<p><b>New Adventure seed planted. 🌱</b></p>"))}
function bindCompletion(){
  $$("[data-complete]").forEach(b=>b.onclick=()=>{
    const date=b.dataset.complete;
    setComplete(date,!isComplete(date));
    showDay(date);
  });
}
function view(v){$$("nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===v));if(v==="home"){$("#screen").hidden=true;scrollTo({top:0,behavior:"smooth"});return}const s=$("#screen");s.hidden=false;
if(v==="week")s.innerHTML=`<div class=weekHeading><div><span class=eyebrow>MILESTONE 2</span><h3>🗓️ Our Adventure Week</h3></div><span class=weekProgress>${completedDays().length}/8 complete</span></div><p class=info>Each day now opens to a dashboard with leave time, first stop, key booking, drive estimate, budget, sunset, and the full plan.</p><div class=familyDayGrid>${DATA.days.map(d=>{const dt=new Date(d.date+"T12:00:00"),x=DAY_DASH[d.date],done=isComplete(d.date);return `<div class="familyDayCard ${done?"completed":""}"><button data-open="${d.date}"><span class=datePill><small>${dt.toLocaleDateString(undefined,{weekday:"short"})}</small><b>${dt.getDate()}</b></span><span class=summary><strong>${done?"✓ ":""}${d.title}</strong><small>${x.icon} ${x.leave} · ${x.reservation}</small><em>${x.focus}</em></span><span class=chev>›</span></button></div>`}).join("")}</div>`;
if(v==="reservations")s.innerHTML=`<h3>🍽️ Reservations</h3>${DATA.reservations.map(r=>`<div class=res><span><b>${r.name}</b><small>${r.date} · ${r.time}</small></span><strong class="${r.status==="Confirmed"?"confirmed":"pending"}">${r.status}</strong></div>`).join("")}`;
if(v==="traditions")s.innerHTML=`<h3>💚 Moments to Protect</h3><ul class=info>${DATA.traditions.map(t=>`<li>${t}</li>`).join("")}</ul>`;
if(v==="trip")s.innerHTML=`<h3>🎒 Trip Snapshot</h3><p><b>Dates:</b> August 7–14, 2026</p><p><b>Home base:</b> ${DATA.trip.homeBase}</p><p><b>Travel party:</b> ${DATA.trip.party}</p><p><b>Priorities:</b> Stay together, place busy attractions on weekdays, eat well, minimize unnecessary driving, and preserve rest.</p>`;
if(v==="companion")s.innerHTML=`<h3>🌿 Remy's Corner</h3><div class="brandStamp"><img src="icon-192.png" alt=""><span><strong>Adventure Companion</strong><small>Making New Traditions</small></span></div><div class=remy>The itinerary supports the experience; it does not have to control it.</div><p class=info>During the trip, each daily page keeps route, parking, food, photos, Plan B, budget, and the reason the day matters together in one place. Family members can use the same shared link.</p>`;
$$("[data-open]").forEach(b=>b.onclick=()=>showDay(b.dataset.open));s.scrollIntoView({behavior:"smooth",block:"start"})}
function showDay(date){const d=DATA.days.find(x=>x.date===date);if(!d)return;const s=$("#screen");s.hidden=false;s.innerHTML=`<div class=dayHead><button class=back data-back>← Week</button><span class=dayPosition>Day ${dayNumber(date)} of ${DATA.days.length}</span></div>\n${dashboardMarkup(d)}\n<div class=dayHero><small>${d.short} · ${d.theme}</small><h3>${d.title}</h3><p>${d.why}</p><div class=dayChips><span>🚗 ${d.drive}</span><span>💵 ${d.budget}</span><span>📸 Photo moments</span></div></div>
<div class=reservationSummary><span><b>🍽️ Food plan</b><small>${d.food}</small></span><strong>›</strong></div><div class=why><b>◆ Why this day matters</b><br>${d.why}</div><div class=timeline>${d.schedule.map(e=>`<div class=event><time>${e[0]}</time><span>${e[1]}</span></div>`).join("")}</div>
<details open><summary>Route, driving & parking</summary><p class=info><b>Route:</b> ${d.route}<br><b>Driving:</b> ${d.drive}<br><b>Parking:</b> ${d.parking}<br><b>Crowd strategy:</b> ${d.crowds}</p></details>
<details><summary>Foodie callout</summary><p class=info><b>Restaurant:</b> ${d.food}<br><b>Signature dishes:</b> ${d.dishes}<br><b>Dessert:</b> ${d.dessert}</p></details>
<details><summary>Photos, Plan B & budget</summary><p class=info><b>Photos:</b> ${d.photos}<br><b>Plan B:</b> ${d.planB}<br><b>Estimated family budget:</b> ${d.budget}</p></details>
<div class=remy><b>★ Remy's recommendation</b><br>${d.remy}</div>
<div class=familyQuestion><b>💚 Family question</b><br>${familyQuestionFor(d.date)}</div>`;
$("[data-back]").onclick=()=>view("week");bindCompletion();s.scrollIntoView({behavior:"smooth",block:"start"})}
DATA = {"trip": {"name": "Smoky Mountains 2026", "start": "2026-08-07", "end": "2026-08-14", "homeBase": "Club Wyndham Smoky Mountains", "party": "Grandma, Grandpa, Emily, son (22), and daughter (13)"}, "days": [{"date": "2026-08-07", "short": "Fri 8/7", "title": "Welcome to Tennessee", "theme": "Welcome", "why": "Ease into the vacation without overplanning. The first evening is celebratory but flexible after the drive.", "budget": "$250–$325", "drive": "About 20–30 minutes total", "route": "Club Wyndham → Local Goat → The Island → Club Wyndham", "parking": "Local Goat has on-site parking. The Island has a large free lot with tram service.", "crowds": "If arrival runs late, preserve dinner and shorten or skip The Island.", "food": "Local Goat · 6:00 PM", "dishes": "Fried green tomatoes, bison burger, bistro steak, seasonal fish, peanut butter pie.", "dessert": "The Island Creamery", "photos": "Resort arrival; The Island fountain at dusk.", "planB": "Dinner only, followed by a quiet resort evening.", "remy": "Do not rush the fountains. Let this evening feel like the official start of the trip.", "schedule": [["Afternoon", "Arrive, check in, unpack, and make a quick grocery stop."], ["5:35 PM", "Leave the resort for dinner."], ["6:00 PM", "Local Goat reservation."], ["7:45 PM", "The Island fountain show, strolling, and first family photo."], ["Afterward", "Dessert at The Island Creamery, then return to the resort."]]}, {"date": "2026-08-08", "short": "Sat 8/8", "title": "Mountains, Arts & Local Flavor", "theme": "Mountains", "why": "A gentle Smokies introduction with one easy waterfall walk, local art, and a memorable dinner.", "budget": "$350–$450", "drive": "About 75–100 minutes total, depending on traffic", "route": "Club Wyndham → Five Oaks → Sugarlands → Cataract Falls → Wild Plum → Arts & Crafts → Park Grill → Donut Friar → Resort", "parking": "Sugarlands and artisan stops have free parking. Park once near Park Grill and The Village.", "crowds": "Saturday is busy, so avoid major ticketed attractions and keep the day flexible.", "food": "Wild Plum Tea Room · 1:30 PM; Park Grill pending", "dishes": "At Park Grill: mountain trout, hickory-grilled ribeye, cedar-plank salmon, salad bar, blackberry cobbler.", "dessert": "The Donut Friar after dinner", "photos": "National Park sign; Cataract Falls bridge; artisan studio; The Village at night.", "planB": "If weather limits the waterfall, spend more time at Sugarlands and the Arts & Crafts Community.", "remy": "Sit quietly by the creek for ten minutes. No phones; just listen to the water.", "schedule": [["9:30 AM", "Breakfast at Five Oaks Farm Kitchen."], ["10:45 AM", "Drive toward Great Smoky Mountains National Park."], ["11:15 AM", "Sugarlands Visitor Center and family photo at the park sign."], ["12:05 PM", "Walk to Cataract Falls and pause by the creek."], ["1:30 PM", "Wild Plum Tea Room reservation."], ["3:00 PM", "Great Smoky Arts & Crafts Community; select a few studios."], ["6:00 PM", "Park Grill target time — reservation still pending."], ["After dinner", "Walk to The Village and visit The Donut Friar."]]}, {"date": "2026-08-09", "short": "Sun 8/9", "title": "Relax, Wine & Appalachia", "theme": "Recharge", "why": "A deliberately slower day before Dollywood, built around Apple Barn flavors, wine tasting, and protected resort time.", "budget": "$325–$425", "drive": "Mostly 5–15 minute drives; roughly 35–50 minutes total", "route": "Club Wyndham → Apple Barn Village & Winery → Club Wyndham → Seasons 101 → Club Wyndham", "parking": "Large free lots at Apple Barn. Confirm downtown parking for Seasons 101.", "crowds": "Sunday is intentionally low-pressure. Stay longer only where everyone is enjoying themselves.", "food": "Seasons 101 · 6:00 PM", "dishes": "Choose from the seasonal menu and keep dinner relaxed after the tasting.", "dessert": "Apple Barn Bakery after lunch and wine tasting", "photos": "Apple Barn wagon; winery tasting; family bottle selection.", "planB": "Rain does not materially affect this day; extend indoor Apple Barn time and resort downtime.", "remy": "Let the wine tasting be leisurely. This is a vacation day, not a checklist.", "schedule": [["9:30 AM", "Breakfast at Applewood Farmhouse."], ["10:45 AM", "Explore Apple Barn Village: bakery, cider mill, shops, and creamery."], ["12:30 PM", "Light lunch in the village or nearby."], ["After lunch", "Apple Barn Winery tasting and select the Wine of the Trip."], ["After tasting", "Apple Barn Bakery dessert destination."], ["2:30–5:00 PM", "Choose Your Own Adventure afternoon at the resort."], ["6:00 PM", "Seasons 101 reservation."]]}, {"date": "2026-08-10", "short": "Mon 8/10", "title": "Dollywood Classics", "theme": "Dollywood", "why": "The busiest attraction is placed on Monday to reduce crowds and maximize rides, shows, crafts, and food.", "budget": "$750–$950", "drive": "About 10–15 minutes each way, plus parking traffic", "route": "Club Wyndham → Dollywood → Club Wyndham", "parking": "Standard parking is adequate; preferred parking may be worth it for shorter walking.", "crowds": "Arrive before opening, prioritize top rides early, and avoid overcommitting to closing time.", "food": "Flexible dining inside Dollywood", "dishes": "Cinnamon bread, barbecue, skillet meals, fresh lemonade, and one family-shared snack.", "dessert": "Dollywood cinnamon bread", "photos": "Dollywood entrance; Dollywood Express; Big Bear Mountain sign; Craftsman's Valley.", "planB": "Use indoor shows, shops, and restaurants during storms; revisit rides when weather clears.", "remy": "Leave while everyone is still smiling, not after everyone is exhausted.", "schedule": [["7:15 AM", "Quick breakfast at the condo or nearby."], ["8:30–8:45 AM", "Arrive before opening; allow time for parking and security."], ["Opening", "Big Bear Mountain first, then FireChaser Express and other priorities."], ["Late morning", "Dollywood Express, Craftsman's Valley, eagle area, and shows."], ["Lunch", "Choose based on where the family is at that moment."], ["Afternoon", "Mix rides with shows and shaded breaks."], ["Dinner", "Eat inside Dollywood or leave while everyone is still happy."], ["After meal", "Share Dollywood cinnamon bread."]]}, {"date": "2026-08-11", "short": "Tue 8/11", "title": "Hidden Wonders & Adventure Night", "theme": "Hidden Wonders", "why": "A cave, local barbecue, protected downtime, and a playful nighttime coaster make this one of the most varied days.", "budget": "$550–$700", "drive": "About 75–95 minutes total", "route": "Club Wyndham → Forbidden Caverns → Delauder's BBQ → Resort → Blue Moose → Rocky Top Coaster → Ice cream → Resort", "parking": "Free parking at Forbidden Caverns, Delauder's, Blue Moose, and the coaster.", "crowds": "Forbidden Caverns is walk-up. Arrive close to opening and keep the evening flexible.", "food": "Delauder's BBQ lunch; Blue Moose · 6:15 PM target", "dishes": "Brisket, pulled pork, smoked turkey, mac and cheese, beans, banana pudding; later wings, burgers, and salads.", "dessert": "Ice cream only after the mountain coaster", "photos": "Forbidden Caverns entrance; barbecue spread; illuminated coaster.", "planB": "If storms affect the coaster, move it to another clear evening.", "remy": "Do not feel guilty about doing nothing during the afternoon. The rest is intentional.", "schedule": [["9:30 AM", "Breakfast at a nearby café or the condo."], ["10:30 AM", "Drive to Forbidden Caverns."], ["11:00 AM–12:15 PM", "Guided cave tour."], ["12:45 PM", "Lunch at Delauder's BBQ."], ["2:15–5:00 PM", "Completely unscheduled resort afternoon."], ["6:15 PM", "Blue Moose Burgers & Wings target."], ["8:15 PM", "Rocky Top Mountain Coaster after dark."], ["After coaster", "Ice cream dessert destination."]]}, {"date": "2026-08-12", "short": "Wed 8/12", "title": "Adventure, Animals & History", "theme": "Adventure", "why": "Ziplining, animals, Smokies history, a heritage meal, and an unplugged sunset balance excitement and connection.", "budget": "$650–$825", "drive": "About 45–70 minutes total", "route": "Club Wyndham → Lil Black Bear Café → Legacy Mountain Zipline → Lunch → Parrot Mountain → Old Mill → Resort", "parking": "Use attraction lots. At Old Mill, park once and walk the district.", "crowds": "Keep Arts & Crafts off this day; Saturday already covers local artisans.", "food": "Casual lunch; Old Mill Restaurant target", "dishes": "Pot roast, chicken and dumplings or pot pie, corn chowder, fritters, and blackberry cobbler.", "dessert": "Old Mill Creamery", "photos": "Zipline launch; holding parrots; Old Mill water wheel; golden-hour river photo.", "planB": "If ziplining is weather-cancelled, expand Parrot Mountain and Old Mill time and reschedule if possible.", "remy": "Protect the sunset. It may become the most meaningful memory of the week.", "schedule": [["9:00 AM", "Breakfast at Lil Black Bear Café."], ["10:30 AM", "Legacy Mountain Zipline reservation for the kids; Emily joins only if cleared and comfortable."], ["After zipline", "Casual lunch together."], ["Early afternoon", "Parrot Mountain & Gardens."], ["Late afternoon", "Browse the Old Mill district at a relaxed pace."], ["Dinner", "Old Mill Restaurant target."], ["After dinner", "Old Mill Creamery."], ["Sunset", "Sit by the river, put phones away, and share favorite memories so far."]]}, {"date": "2026-08-13", "short": "Thu 8/13", "title": "Grand Finale", "theme": "Grand Finale", "why": "The aquarium is correctly placed on the final full weekday, followed by relaxed Gatlinburg time and a special farewell dinner.", "budget": "$700–$850", "drive": "About 55–75 minutes total, depending on Gatlinburg traffic", "route": "Club Wyndham → Gatlinburg parking → Pancake Pantry → Aquarium → optional Anakeesta/downtown → Greenbrier → Resort", "parking": "Park once downtown for breakfast, aquarium, and optional downtown time. Drive separately to The Greenbrier.", "crowds": "Arrive at the aquarium earlier in the day. Keep the afternoon relaxed and avoid height-anxiety activities.", "food": "The Greenbrier · 6:15 PM", "dishes": "Crab cakes, filet, prime rib if offered, seafood entrée, and a signature dessert.", "dessert": "Dessert at The Greenbrier", "photos": "Aquarium shark tunnel; penguins; gardens or downtown; farewell dinner photo.", "planB": "If weather affects outdoor plans, stay longer at the aquarium and enjoy downtown shops before dinner.", "remy": "At dinner, each person answers: What should become a family tradition from this trip?", "schedule": [["9:30 AM", "Breakfast at Pancake Pantry."], ["10:45 AM", "Ripley's Aquarium of the Smokies."], ["1:00 PM", "Lunch in downtown Gatlinburg."], ["2:15 PM", "Optional relaxed Anakeesta gardens/shops or downtown time; skip height-intensive attractions."], ["Late afternoon", "Return to the car and freshen up if needed."], ["6:15 PM", "The Greenbrier farewell dinner reservation."], ["After dinner", "Dessert at The Greenbrier and family tradition reflection."]]}, {"date": "2026-08-14", "short": "Fri 8/14", "title": "Heading Home", "theme": "Home", "why": "End without rushing: one last meal, one final photo, and time to begin imagining the next adventure.", "budget": "$100–$175", "drive": "Dependent on the drive home", "route": "Club Wyndham → Breakfast if needed → Home", "parking": "No special considerations.", "crowds": "Allow extra departure time for Friday traffic.", "food": "Flexible farewell breakfast", "dishes": "Choose a favorite from earlier in the trip or keep breakfast simple.", "dessert": "None scheduled", "photos": "Final family photo at the resort.", "planB": "Keep the morning light.", "remy": "Start talking about where Making New Traditions should go in 2027.", "schedule": [["Morning", "Relaxed breakfast at the condo or a favorite nearby spot."], ["Before checkout", "Pack, complete a final room check, and take one last family photo."], ["Checkout", "Depart Club Wyndham and head home already discussing the next adventure."]]}], "reservations": [{"name": "Local Goat", "date": "Fri Aug 7", "time": "6:00 PM", "status": "Confirmed"}, {"name": "Wild Plum Tea Room", "date": "Sat Aug 8", "time": "1:30 PM", "status": "Confirmed"}, {"name": "Park Grill", "date": "Sat Aug 8", "time": "6:00 PM target", "status": "Pending"}, {"name": "Seasons 101", "date": "Sun Aug 9", "time": "6:00 PM", "status": "Confirmed"}, {"name": "Legacy Mountain Zipline", "date": "Wed Aug 12", "time": "10:30 AM", "status": "Confirmed"}, {"name": "The Greenbrier", "date": "Thu Aug 13", "time": "6:15 PM", "status": "Confirmed"}], "traditions": ["Take one group photo every day.", "Sit beside the water at Cataract Falls without phones.", "Choose a local Wine of the Trip.", "Share Dollywood cinnamon bread.", "Ride the mountain coaster after dark.", "Take a photo with a parrot.", "Protect Wednesday's sunset.", "Choose one Christmas ornament that represents the trip.", "At farewell dinner, decide which tradition continues next year."]};
const now=new Date(), inp=$("#previewDate");
inp.value=localISO(now);
drawPhase(now);
inp.onchange=()=>{const d=new Date(inp.value+"T12:00:00");drawPhase(d);renderJourney(d)};
$("#today").onclick=()=>{const n=new Date();inp.value=localISO(n);drawPhase(n);renderJourney(n)};

$$("[data-view]").forEach(b=>b.onclick=()=>view(b.dataset.view));
setupWelcome();
renderJourney(new Date());
function setupWelcome(){
  const modal=$("#welcomeModal");
  const skipped=localStorage.getItem("acSkipWelcome")==="1";
  if(!skipped) modal.hidden=false;
  $("#enterAdventure").onclick=()=>modal.hidden=true;
  $("#skipWelcome").onclick=()=>{localStorage.setItem("acSkipWelcome","1");modal.hidden=true};
}
function renderJourney(date){
  const current=localISO(date),done=completedDays();
  const trail=$("#journeyTrail");
  if(!trail||!DATA)return;
  $("#journeyCount").textContent=`${done.length} of ${DATA.days.length} complete`;
  trail.innerHTML=DATA.days.map((d,i)=>{
    const state=isComplete(d.date)?"complete":d.date===current?"active":d.date<current?"past":"";
    return `<button class="trailStop ${state}" data-day="${d.date}" title="${d.title}" type="button"><span class=trailDot>${isComplete(d.date)?"✓":i+1}</span><small>${new Date(d.date+"T12:00:00").toLocaleDateString(undefined,{weekday:"short"})}</small></button>`
  }).join("");
  $$("[data-day]").forEach(b=>b.onclick=()=>showDay(b.dataset.day));
}

const shareBtn=$("#shareTrip");
if(shareBtn) shareBtn.onclick=async()=>{const payload={title:"Smoky Mountains 2026",text:"Take a look at our family Adventure Companion!",url:location.href};try{if(navigator.share){await navigator.share(payload)}else{await navigator.clipboard.writeText(location.href);showToast("Link copied for sharing")}}catch(e){}};
function showToast(msg){const t=document.createElement("div");t.className="shareToast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
function familyQuestionFor(date){
  const questions={
    "2026-08-07":"What are you most excited to experience together this week?",
    "2026-08-08":"What was the most beautiful thing you noticed today?",
    "2026-08-09":"What helped today feel restful?",
    "2026-08-10":"Which Dollywood moment should become part of the family story?",
    "2026-08-11":"What surprised you most today?",
    "2026-08-12":"When did you feel most connected to everyone today?",
    "2026-08-13":"What should become a tradition on our next adventure?",
    "2026-08-14":"What is the one memory you want to keep forever?"
  };
  return questions[date]||"What moment from today do you want to remember?";
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));
}
