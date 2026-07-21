// Build M3-04.4C · Experience Completion

const APP_BUILD={
  version:"M3-04.4C",
  label:"Reliability & Diagnostics",
  date:"July 21, 2026"
};

const FEEDBACK_KEY="adventureCompanionFeedback";
let selectedFeedbackKind="";
let selectedFeedbackRating=0;

function openPanel(panel){
  if(!panel)return;
  panel.hidden=false;
  requestAnimationFrame(()=>panel.classList.add("open"));
}

function closePanel(panel){
  if(!panel)return;
  panel.classList.remove("open");
  setTimeout(()=>panel.hidden=true,220);
}

function showUpdateToast(){
  const toast=document.querySelector("#updateToast");
  if(!toast)return;
  toast.hidden=false;
  requestAnimationFrame(()=>toast.classList.add("show"));
}

function hideUpdateToast(){
  const toast=document.querySelector("#updateToast");
  if(!toast)return;
  toast.classList.remove("show");
  setTimeout(()=>toast.hidden=true,250);
}

function activateWaitingWorker(reg){
  if(reg?.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});
}

function currentScreenLabel(){
  const activeDay=document.querySelector(".dayDetail:not([hidden]) h1, .dayDetail:not([hidden]) h2");
  if(activeDay?.textContent)return activeDay.textContent.trim();
  const heading=document.querySelector("main h1, main h2, .screen.active h1, .screen.active h2");
  return heading?.textContent?.trim()||document.title||"Adventure Companion";
}

function readFeedback(){
  try{return JSON.parse(localStorage.getItem(FEEDBACK_KEY)||"[]")}catch(e){return []}
}

function writeFeedback(items){
  localStorage.setItem(FEEDBACK_KEY,JSON.stringify(items));
}

function renderSavedFeedback(){
  const host=document.querySelector("#feedbackSaved");
  if(!host)return;
  const notes=readFeedback();
  host.hidden=false;
  if(!notes.length){
    host.innerHTML="<p>No feedback saved yet.</p>";
    return;
  }
  host.innerHTML=`<div class="savedFeedbackHead"><strong>Saved feedback</strong><button id="clearFeedback" type="button">Clear all</button></div>
    <div class="savedFeedbackList">${notes.slice().reverse().map(n=>`
      <article>
        <small>${n.kind||"note"} · ${n.rating?`${n.rating}/5`:"not rated"} · ${n.date}</small>
        <strong>${n.screen}</strong>
        <p>${String(n.note).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}</p>
      </article>`).join("")}</div>`;
  document.querySelector("#clearFeedback")?.addEventListener("click",()=>{
    if(confirm("Clear all saved feedback notes?")){
      writeFeedback([]);
      renderSavedFeedback();
    }
  });
}

function resetFeedbackForm(){
  selectedFeedbackKind="";
  selectedFeedbackRating=0;
  document.querySelectorAll(".feedbackKinds button").forEach(b=>b.classList.remove("selected"));
  document.querySelectorAll(".feedbackStars button").forEach(b=>{
    b.classList.remove("selected");
    b.textContent="☆";
  });
  const note=document.querySelector("#feedbackNote");
  if(note)note.value="";
  const screen=document.querySelector("#feedbackScreen");
  if(screen)screen.value=currentScreenLabel();
}

function wireBuildTools(){
  const buildPanel=document.querySelector("#buildPanel");
  const feedbackPanel=document.querySelector("#feedbackPanel");

  document.querySelector("#devBadge")?.addEventListener("click",()=>openPanel(buildPanel));
  document.querySelector("#closeBuildPanel")?.addEventListener("click",()=>closePanel(buildPanel));

  document.querySelector("#feedbackButton")?.addEventListener("click",()=>{
    resetFeedbackForm();
    openPanel(feedbackPanel);
  });
  document.querySelector("#closeFeedbackPanel")?.addEventListener("click",()=>closePanel(feedbackPanel));

  document.querySelectorAll(".feedbackKinds button").forEach(button=>{
    button.addEventListener("click",()=>{
      selectedFeedbackKind=button.dataset.kind||"";
      document.querySelectorAll(".feedbackKinds button").forEach(b=>b.classList.toggle("selected",b===button));
    });
  });

  document.querySelectorAll(".feedbackStars button").forEach(button=>{
    button.addEventListener("click",()=>{
      selectedFeedbackRating=Number(button.dataset.rating||0);
      document.querySelectorAll(".feedbackStars button").forEach(b=>{
        const active=Number(b.dataset.rating)<=selectedFeedbackRating;
        b.classList.toggle("selected",active);
        b.textContent=active?"★":"☆";
      });
    });
  });

  document.querySelector("#saveFeedback")?.addEventListener("click",()=>{
    const screen=document.querySelector("#feedbackScreen")?.value.trim()||currentScreenLabel();
    const note=document.querySelector("#feedbackNote")?.value.trim();
    if(!note){
      document.querySelector("#feedbackNote")?.focus();
      return;
    }
    const items=readFeedback();
    items.push({
      kind:selectedFeedbackKind||"note",
      rating:selectedFeedbackRating,
      screen,
      note,
      build:APP_BUILD.version,
      date:new Date().toLocaleString()
    });
    writeFeedback(items);
    const saved=document.querySelector("#feedbackSaved");
    if(saved){
      saved.hidden=false;
      saved.innerHTML='<p class="savedConfirmation">✓ Feedback saved on this device.</p>';
    }
    setTimeout(()=>closePanel(feedbackPanel),800);
  });

  document.querySelector("#viewFeedback")?.addEventListener("click",renderSavedFeedback);
  document.querySelector("#dismissUpdate")?.addEventListener("click",hideUpdateToast);
  document.querySelector("#refreshApp")?.addEventListener("click",async()=>{
    try{
      const reg=await navigator.serviceWorker?.getRegistration();
      activateWaitingWorker(reg);
    }catch(e){}
    window.location.reload();
  });
}




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


const NEXT_DRIVE_TIMES={
  "2026-08-07":["~10 min","~8 min","~2 min","~12 min"],
  "2026-08-08":["~35 min","~3 min","~20 min","~10 min","~15 min","~3 min","~25 min"],
  "2026-08-09":["~2 min","~2 min","~2 min","~8 min","~12 min","~12 min"],
  "2026-08-10":["~15 min"],
  "2026-08-11":["~30 min","~25 min","~20 min","~5 min","~5 min","~10 min"],
  "2026-08-12":["~25 min","~20 min","~15 min","~5 min","~2 min","~10 min"],
  "2026-08-13":["~3 min","~5 min","~2 min","~15 min","~20 min","~25 min"],
  "2026-08-14":["Varies"]
};

const HOME_ADDRESS="1817 Turning Leaf Lane, Durham, NC";
const RESORT_QUERY="Club Wyndham Smoky Mountains, 308 Collier Dr, Sevierville, TN";
const START_DATA={
  "2026-08-07":{time:"Trip departure",icon:"🏡",name:"Home",query:HOME_ADDRESS,type:"Start",duration:"Final car check",tip:"Load the car, confirm tickets and chargers, then begin the family adventure.",drive:"~4 hr 45 min"},
  "2026-08-08":{time:"Morning",icon:"🏨",name:"Club Wyndham Smoky Mountains",query:RESORT_QUERY,type:"Start",duration:"Leave by 9:05 AM",tip:"Water bottles, walking shoes, and the Wild Plum reservation details.",drive:"~5 min"},
  "2026-08-09":{time:"Morning",icon:"🏨",name:"Club Wyndham Smoky Mountains",query:RESORT_QUERY,type:"Start",duration:"Leave by 9:20 AM",tip:"A relaxed start for the Apple Barn and downtown Sevierville.",drive:"~5 min"},
  "2026-08-10":{time:"Early morning",icon:"🏨",name:"Club Wyndham Smoky Mountains",query:RESORT_QUERY,type:"Start",duration:"Leave by 8:05 AM",tip:"Tickets, sunscreen, refillable bottles, and comfortable shoes.",drive:"~15 min"},
  "2026-08-11":{time:"Morning",icon:"🏨",name:"Club Wyndham Smoky Mountains",query:RESORT_QUERY,type:"Start",duration:"Leave by 10:20 AM",tip:"Bring a light layer for the cave and save energy for the night coaster.",drive:"~35 min"},
  "2026-08-12":{time:"Morning",icon:"🏨",name:"Club Wyndham Smoky Mountains",query:RESORT_QUERY,type:"Start",duration:"Leave by 8:25 AM",tip:"Wear zipline-ready clothing and bring the reservation details.",drive:"~10 min"},
  "2026-08-13":{time:"Morning",icon:"🏨",name:"Club Wyndham Smoky Mountains",query:RESORT_QUERY,type:"Start",duration:"Leave by 8:55 AM",tip:"Aquarium tickets, comfortable shoes, and farewell-dinner clothes.",drive:"~25 min"},
  "2026-08-14":{time:"Checkout day",icon:"🏨",name:"Club Wyndham Smoky Mountains",query:RESORT_QUERY,type:"Start",duration:"Final room check",tip:"Pack calmly, photograph the room after the final sweep, and begin the drive home.",drive:"~4 hr 45 min"}
};

const STOP_DATA={"2026-08-07":[{"time":"Arrival","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Home base","duration":"Check-in and settle in","tip":"Unload only what you need before dinner."},{"time":"6:00 PM","icon":"🍽️","name":"Local Goat","query":"Local Goat Pigeon Forge TN","type":"Dinner reservation","duration":"About 90 minutes","tip":"Arrive a few minutes early; parking is on site."},{"time":"7:45 PM","icon":"⛲","name":"The Island in Pigeon Forge","query":"The Island in Pigeon Forge TN","type":"Evening stroll","duration":"45–75 minutes","tip":"Use the large free lot and tram if everyone is tired."},{"time":"Afterward","icon":"🍦","name":"The Island Creamery","query":"The Island Creamery Pigeon Forge TN","type":"Dessert","duration":"20–30 minutes","tip":"Keep this optional if arrival day runs long."},{"time":"Night","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Return to resort","duration":"End of day","tip":"Set out tomorrow’s shoes and water bottles tonight."}],"2026-08-08":[{"time":"9:30 AM","icon":"🥞","name":"Five Oaks Farm Kitchen","query":"Five Oaks Farm Kitchen Sevierville TN","type":"Breakfast","duration":"60–75 minutes","tip":"A filling breakfast before the park and waterfall walk."},{"time":"11:15 AM","icon":"🌲","name":"Sugarlands Visitor Center","query":"Sugarlands Visitor Center Gatlinburg TN","type":"National park stop","duration":"35–50 minutes","tip":"Use restrooms here before the waterfall walk."},{"time":"12:05 PM","icon":"💧","name":"Cataract Falls Trailhead","query":"Cataract Falls Trailhead Gatlinburg TN","type":"Easy waterfall walk","duration":"35–50 minutes","tip":"The trail begins near Sugarlands; keep the family together."},{"time":"1:30 PM","icon":"🫖","name":"Wild Plum Tea Room","query":"Wild Plum Tea Room Gatlinburg TN","type":"Lunch reservation","duration":"75–90 minutes","tip":"This is a timed stop—leave the waterfall with margin."},{"time":"3:00 PM","icon":"🎨","name":"Great Smoky Arts and Crafts Community","query":"Great Smoky Arts and Crafts Community Gatlinburg TN","type":"Artisan loop","duration":"2–2.5 hours","tip":"Choose a few studios rather than trying to visit every one."},{"time":"6:00 PM","icon":"🍽️","name":"The Park Grill","query":"The Park Grill Gatlinburg TN","type":"Dinner target","duration":"90 minutes","tip":"Reservation is pending; keep the backup flexible."},{"time":"After dinner","icon":"🍩","name":"The Donut Friar","query":"The Donut Friar Gatlinburg TN","type":"Dessert","duration":"20–30 minutes","tip":"Park once for dinner and The Village when practical."},{"time":"Night","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Return to resort","duration":"End of day","tip":"Expect slower Saturday traffic leaving Gatlinburg."}],"2026-08-09":[{"time":"9:30 AM","icon":"🍎","name":"Applewood Farmhouse Restaurant","query":"Applewood Farmhouse Restaurant Sevierville TN","type":"Breakfast","duration":"60–75 minutes","tip":"The Apple Barn area is close to the resort."},{"time":"10:45 AM","icon":"🛍️","name":"Apple Barn Village","query":"Apple Barn Village Sevierville TN","type":"Shops and cider mill","duration":"90 minutes","tip":"Keep purchases together so nothing is left behind."},{"time":"After lunch","icon":"🍷","name":"Apple Barn Winery","query":"Apple Barn Winery Sevierville TN","type":"Wine tasting","duration":"45–60 minutes","tip":"Choose the Wine of the Trip without rushing."},{"time":"After tasting","icon":"🥧","name":"Apple Barn Bakery","query":"Apple Barn Bakery Sevierville TN","type":"Dessert","duration":"20–30 minutes","tip":"Pick something that travels well if everyone is full."},{"time":"Afternoon","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Protected downtime","duration":"2.5 hours","tip":"This open block is intentional, not empty."},{"time":"6:00 PM","icon":"🍽️","name":"Seasons 101","query":"Seasons 101 Sevierville TN","type":"Dinner reservation","duration":"90 minutes","tip":"Allow time for downtown parking."},{"time":"Night","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Return to resort","duration":"End of day","tip":"Finish the route back at the family home base."}],"2026-08-10":[{"time":"8:30 AM","icon":"🎢","name":"Dollywood","query":"Dollywood Pigeon Forge TN","type":"Theme park","duration":"Full day","tip":"Navigate directly to parking and arrive before opening."},{"time":"Evening","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Return to resort","duration":"End of day","tip":"Leave while everyone is still smiling."}],"2026-08-11":[{"time":"11:00 AM","icon":"🪨","name":"Forbidden Caverns","query":"Forbidden Caverns Sevierville TN","type":"Guided cave tour","duration":"75 minutes","tip":"Bring a light layer; caves stay cool."},{"time":"12:45 PM","icon":"🍖","name":"Delauder's BBQ","query":"Delauder's BBQ Gatlinburg TN","type":"Lunch","duration":"60–75 minutes","tip":"Check hours before departure because local schedules can vary."},{"time":"Afternoon","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Protected downtime","duration":"2.5 hours","tip":"Do not fill this block unless the family asks."},{"time":"6:15 PM","icon":"🍔","name":"Blue Moose Burgers & Wings","query":"Blue Moose Burgers and Wings Pigeon Forge TN","type":"Dinner target","duration":"75 minutes","tip":"Keep dinner relaxed before the coaster."},{"time":"8:15 PM","icon":"🎢","name":"Rocky Top Mountain Coaster","query":"Rocky Top Mountain Coaster Pigeon Forge TN","type":"Night adventure","duration":"60–90 minutes","tip":"The illuminated ride is the point—wait until after dark."},{"time":"Night","icon":"🍦","name":"Ice cream near Rocky Top","query":"ice cream near Rocky Top Mountain Coaster Pigeon Forge TN","type":"Dessert","duration":"20–30 minutes","tip":"Choose the closest easy stop based on energy."},{"time":"Night","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Return to resort","duration":"End of day","tip":"Finish the route back at the family home base."}],"2026-08-12":[{"time":"9:00 AM","icon":"🥞","name":"Lil Black Bear Café","query":"Lil Black Bear Cafe Pigeon Forge TN","type":"Breakfast","duration":"60 minutes","tip":"Leave enough margin for the 10:30 zipline reservation."},{"time":"10:30 AM","icon":"🪂","name":"Legacy Mountain Ziplines","query":"Legacy Mountain Ziplines Sevierville TN","type":"Timed reservation","duration":"2–3 hours","tip":"Arrive at the check-in time shown in the confirmation."},{"time":"Early afternoon","icon":"🦜","name":"Parrot Mountain and Gardens","query":"Parrot Mountain and Gardens Pigeon Forge TN","type":"Animal experience","duration":"90–120 minutes","tip":"Protect time for the bird interaction and photos."},{"time":"Late afternoon","icon":"🌾","name":"The Old Mill","query":"The Old Mill Pigeon Forge TN","type":"Historic district","duration":"2–3 hours","tip":"Park once and walk the district."},{"time":"Dinner","icon":"🍽️","name":"The Old Mill Restaurant","query":"The Old Mill Restaurant Pigeon Forge TN","type":"Dinner target","duration":"90 minutes","tip":"Expect a possible wait; browse nearby while holding your place."},{"time":"After dinner","icon":"🍦","name":"Old Mill Creamery","query":"Old Mill Creamery Pigeon Forge TN","type":"Dessert","duration":"20–30 minutes","tip":"Take dessert toward the river if the evening is pleasant."},{"time":"Night","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Return to resort","duration":"End of day","tip":"Finish the route back at the family home base."}],"2026-08-13":[{"time":"9:30 AM","icon":"🥞","name":"Pancake Pantry","query":"Pancake Pantry Gatlinburg TN","type":"Breakfast","duration":"60–75 minutes","tip":"Park downtown once for breakfast and the aquarium."},{"time":"10:45 AM","icon":"🐧","name":"Ripley's Aquarium of the Smokies","query":"Ripley's Aquarium of the Smokies Gatlinburg TN","type":"Ticketed attraction","duration":"2–3 hours","tip":"Have ticket links ready before entering."},{"time":"Optional afternoon","icon":"⭐","name":"Anakeesta","query":"Anakeesta Gatlinburg TN","type":"Optional adventure","duration":"2–4 hours","tip":"Use this only if weather, energy, and timing all feel right."},{"time":"Afternoon","icon":"🏙️","name":"Downtown Gatlinburg","query":"Downtown Gatlinburg TN","type":"Flexible exploration","duration":"1–2 hours","tip":"Choose low-height activities and protect dinner timing."},{"time":"6:15 PM","icon":"🍽️","name":"The Greenbrier Restaurant","query":"The Greenbrier Restaurant Gatlinburg TN","type":"Farewell reservation","duration":"2 hours","tip":"Drive separately from downtown parking and arrive relaxed."},{"time":"Night","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Final resort return","duration":"End of day","tip":"This is the last full-night return—take it in."}],"2026-08-14":[{"time":"Morning","icon":"🏨","name":"Club Wyndham Smoky Mountains","query":"Club Wyndham Smoky Mountains Pigeon Forge TN","type":"Checkout","duration":"Final room check","tip":"Photograph the room after the final sweep if useful."},{"time":"Departure","icon":"🏡","name":"Home","query":"1817 Turning Leaf Lane, Durham, NC","type":"Drive home","duration":"Road trip","tip":"Use your preferred live navigation for traffic-aware routing."}]};
const RESERVATION_DATA={"2026-08-07":[{"name":"Club Wyndham Smoky Mountains","icon":"🏨","status":"Confirmed","time":"Aug 7–14","confirmation":"Add confirmation #","phone":"","website":"https://www.wyndhamhotels.com/","notes":"Primary lodging and daily home base."},{"name":"Local Goat","icon":"🍽️","status":"Confirmed","time":"6:00 PM","confirmation":"Reservation confirmed","phone":"","website":"https://localgoatpf.com/","notes":"Arrival-night dinner."}],"2026-08-08":[{"name":"Wild Plum Tea Room","icon":"🫖","status":"Contacted","time":"Lunch target","confirmation":"Confirm final seating","phone":"","website":"https://wildplumtearoom.com/","notes":"Hours are limited; verify before trip."},{"name":"The Park Grill","icon":"🍽️","status":"Pending","time":"6:00 PM target","confirmation":"Reservation window not yet open","phone":"","website":"https://parkgrillgatlinburg.com/","notes":"Keep a nearby dinner backup until confirmed."}],"2026-08-09":[{"name":"Seasons 101","icon":"🍽️","status":"Confirmed","time":"6:00 PM","confirmation":"Reservation confirmed","phone":"","website":"https://seasons101.com/","notes":"Downtown Sevierville dinner."}],"2026-08-10":[{"name":"Dollywood","icon":"🎢","status":"Tickets purchased","time":"All day","confirmation":"Tickets at Work — add ticket link","phone":"","website":"https://www.dollywood.com/","notes":"Any-day tickets purchased. Preferred parking decision still open."}],"2026-08-11":[{"name":"Forbidden Caverns","icon":"🪨","status":"Planned","time":"11:00 AM target","confirmation":"Check ticket policy","phone":"","website":"https://forbiddencavern.com/","notes":"Verify operating hours before departure."},{"name":"Rocky Top Mountain Coaster","icon":"🎢","status":"Planned","time":"8:15 PM target","confirmation":"Purchase onsite or add ticket","phone":"","website":"https://www.rockytopcoaster.com/","notes":"Night ride is intentional."}],"2026-08-12":[{"name":"Legacy Mountain Ziplines","icon":"🪂","status":"Confirmed","time":"10:30 AM","confirmation":"Add confirmation #","phone":"","website":"https://legacymountainziplines.com/","notes":"Timed reservation. Confirm required check-in time."}],"2026-08-13":[{"name":"Ripley's Aquarium of the Smokies","icon":"🐧","status":"Tickets needed","time":"10:45 AM target","confirmation":"Add ticket link after purchase","phone":"","website":"https://www.ripleyaquariums.com/gatlinburg/","notes":"Weekday visit planned."},{"name":"The Greenbrier Restaurant","icon":"🍽️","status":"Confirmed","time":"6:15 PM","confirmation":"Reservation confirmed","phone":"","website":"https://greenbrierrestaurant.com/","notes":"Farewell dinner."}],"2026-08-14":[]};
const READINESS_ITEMS=[{"id":"lodging","label":"Lodging","icon":"🏨","detail":"Wyndham stay confirmed","done":true},{"id":"dollywood","label":"Dollywood tickets","icon":"🎢","detail":"Tickets purchased","done":true},{"id":"zipline","label":"Zipline","icon":"🪂","detail":"Aug 12 at 10:30 AM","done":true},{"id":"dining","label":"Dining reservations","icon":"🍽️","detail":"Park Grill and Wild Plum still need confirmation","done":false},{"id":"aquarium","label":"Aquarium tickets","icon":"🐧","detail":"Purchase or add ticket link","done":false},{"id":"parking","label":"Parking decisions","icon":"🅿️","detail":"Decide on Dollywood preferred parking","done":false},{"id":"packing","label":"Family packing","icon":"🧳","detail":"Complete before departure","done":false},{"id":"weather","label":"Weather check","icon":"🌤️","detail":"Live weather available","done":true},{"id":"navigation","label":"Navigation","icon":"🗺️","detail":"Waze and Google Maps ready","done":true}];
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

function mapsSearch(query){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
function wazeSearch(query){return `https://www.waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`}
function googleRoute(origin,destination){return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`}
const SMART_STOP_GUIDES={
  "Club Wyndham Smoky Mountains":{simple:true,chips:["Resort reset"],parking:"Use the resort lot nearest your assigned building and note the building number before leaving.",practical:"Refill water, charge phones, and reset for the next adventure.",photo:"Family balcony or resort-sign photo",tip:"Set out tomorrow’s shoes, layers, and water bottles before winding down."},
  "Local Goat":{chips:["On-site lot","Celebration dinner"],parking:"Use the on-site restaurant lot and allow a few minutes for check-in.",food:"The approved itinerary highlights fried green tomatoes, bison burger, bistro steak, seasonal fish, and peanut butter pie.",photo:"Family table photo before dinner",tip:"Keep the first evening relaxed—this meal is the official start of the adventure."},
  "The Island in Pigeon Forge":{chips:["Free lot + tram","Fountain photo"],parking:"Use the large Island parking area and the tram when helpful; follow posted signs on arrival.",food:"Dessert is optional if everyone still has energy.",photo:"Fountain show or illuminated wheel",tip:"Treat this as an optional stroll rather than a required stop."},
  "Five Oaks Farm Kitchen":{chips:["Restaurant lot","Hearty breakfast"],parking:"Use the restaurant lot and allow enough time to keep the park day calm.",food:"Choose a hearty breakfast without overdoing it before the waterfall walk.",photo:"Rustic porch or farm-style entrance",tip:"Use breakfast to confirm layers, water, and the day’s pace."},
  "Sugarlands Visitor Center":{chips:["Visitor-center lot","Restrooms"],parking:"Use the visitor-center lot and follow posted parking directions.",practical:"Restrooms, park information, and a final water check before the trail.",photo:"National park sign or visitor-center backdrop",tip:"Check posted trail information or ask a ranger about current conditions before walking."},
  "Cataract Falls Trailhead":{chips:["Walk from Sugarlands","Supportive shoes"],parking:"Remain parked at Sugarlands and walk from the visitor-center area.",practical:"Wear supportive shoes; surfaces may be damp near the falls.",photo:"Waterfall view without blocking the trail",tip:"Keep this easy walk easy—turn back before it becomes tiring."},
  "Wild Plum Tea Room":{chips:["Follow posted parking","Timed lunch"],parking:"Use the available on-site area and follow posted parking guidance.",food:"Choose the house specialty that feels most distinctive and leave room for a tea-room treat.",photo:"Garden or cottage exterior",tip:"Leave the waterfall with a generous margin because this is a timed meal."},
  "Great Smoky Arts and Crafts Community":{chips:["Park by studio","Pick a short list"],parking:"Park at each chosen studio rather than trying to walk the full loop.",food:"Keep a drink and small snack in the car between studios.",photo:"Favorite artisan studio or handmade find",tip:"Choose a short must-see list; the goal is connection, not completion."},
  "The Park Grill":{chips:["Downtown parking","Dinner target"],parking:"Use a nearby public parking option and allow walking time; follow live signs and posted rates.",food:"The approved itinerary highlights mountain trout, ribeye, salmon, salad bar, and blackberry cobbler.",photo:"Rustic entrance or family dinner photo",tip:"Keep the backup dinner plan ready until the reservation is confirmed."},
  "The Donut Friar":{chips:["Keep same parking","Dessert stop"],parking:"Stay in the same downtown parking area used for dinner when practical.",food:"Choose one favorite each or split a small assortment.",photo:"The Village courtyard at night",tip:"This is a memory stop—skip it without guilt if the day has run long."},
  "Applewood Farmhouse Restaurant":{chips:["Shared complex lot","Apple fritters"],parking:"Use the Apple Barn complex lot and leave the car parked for nearby stops.",food:"Apple fritters, apple butter, and cider are the signature start in the approved itinerary.",photo:"Farmhouse porch or orchard-style entrance",tip:"Ask for to-go packaging early if you plan to browse afterward."},
  "Apple Barn Village":{chips:["Shared complex lot","Covered bridge"],parking:"Keep the car in the shared Apple Barn complex lot and follow posted signs.",food:"Sample cider and choose only treats that will travel well.",photo:"Covered bridge or mill-style buildings",tip:"Combine purchases in one bag so nothing is left at a shop."},
  "Apple Barn Winery":{chips:["Walk from village","Wine of the Trip"],parking:"Walk from the shared Apple Barn complex parking area.",food:"Taste slowly and choose one family “Wine of the Trip.”",photo:"Winery sign or tasting flight",tip:"Use a designated driver and keep the tasting unrushed."},
  "Apple Barn Bakery":{chips:["Shared complex lot","Travel-ready treat"],parking:"Remain in the Apple Barn complex lot.",food:"Pick a pastry or pie that can return to the resort if everyone is full.",photo:"Bakery case or shared dessert",tip:"One excellent treat is better than several that go uneaten."},
  "Seasons 101":{chips:["Allow parking time","Seasonal menu"],parking:"Allow extra time for downtown Sevierville parking and follow posted signs and rates.",food:"Ask about the seasonal feature and choose the dish that feels unique to the evening.",photo:"Courthouse-square or dinner-table photo",tip:"Leave the resort with enough margin to arrive calm, not merely on time."},
  "Dollywood":{chips:["Follow live parking signs","Full-day pacing"],parking:"Follow live signs to the available lot. Preferred parking remains a family decision, not a requirement.",food:"Choose one planned meal and one signature treat rather than grazing all day.",photo:"Entrance photo in the morning, before everyone gets tired",practical:"Refill water, use lockers strategically, and build in a mid-afternoon reset.",tip:"Start with the highest-priority attractions, then let the rest of the day breathe."},
  "Forbidden Caverns":{chips:["On-site directions","Light layer"],parking:"Follow the attraction’s posted arrival and parking directions.",practical:"Wear closed-toe shoes and bring a light layer; cave surfaces may be damp.",photo:"Entrance sign before the tour; follow all posted photography rules.",tip:"Use the restroom before the guided tour begins."},
  "Delauder's BBQ":{chips:["Verify before driving","Share sides"],parking:"Follow posted parking guidance and verify the stop before driving over.",food:"Order the barbecue specialty the counter recommends and share sides.",photo:"Rustic exterior or barbecue tray",tip:"Local schedules can change, so confirm this stop before leaving the caverns."},
  "Blue Moose Burgers & Wings":{chips:["Restaurant parking","Pre-coaster meal"],parking:"Use the available restaurant parking and follow posted signs.",food:"Split wings or an appetizer if a full meal would feel heavy before riding.",photo:"Casual family dinner photo",tip:"Protect the nighttime coaster timing; do not let dinner become rushed."},
  "Rocky Top Mountain Coaster":{chips:["Follow evening signs","Night ride"],parking:"Follow the attraction’s posted parking and evening traffic directions.",practical:"Secure loose items and follow all ride instructions.",photo:"Illuminated coaster entrance after dark",tip:"The nighttime lighting is the experience—wait until it is truly dark."},
  "Lil Black Bear Café":{chips:["Breakfast stop","Zipline buffer"],parking:"Use the available café parking and keep breakfast timing firm.",food:"Choose a satisfying but efficient breakfast before the zipline.",photo:"Bear-themed entrance or breakfast table",tip:"Leave with a generous buffer for the 10:30 AM reservation."},
  "Legacy Mountain Ziplines":{chips:["Use confirmation details","Closed-toe shoes"],parking:"Follow the confirmation’s arrival and parking instructions; mountain access can take longer than expected.",practical:"Closed-toe shoes, secure pockets, and required waivers completed in advance.",photo:"Harnessed group photo before the course",tip:"Use the check-in time in the confirmation—not the first zip time—as the true deadline."},
  "Parrot Mountain and Gardens":{chips:["On-site directions","Sloped paths"],parking:"Follow on-site parking signs and expect some walking on sloped paths.",practical:"Move slowly around birds and follow staff guidance for interactions.",photo:"Bird interaction or garden overlook",tip:"Protect time for the aviary experience rather than rushing every garden path."},
  "The Old Mill":{chips:["Park once","Historic mill photo"],parking:"Park once in the Old Mill district and walk between shops, river, dinner, and dessert when practical.",food:"Browse for local pantry items before dinner so purchases are not rushed.",photo:"Historic mill beside the river",tip:"Use the district as a slow, connected evening rather than a checklist."},
  "The Old Mill Restaurant":{chips:["Same district parking","Possible wait"],parking:"Remain in the Old Mill district parking area when practical.",food:"Choose a classic Southern meal and share sides if portions are large.",photo:"Family dinner or mill view while waiting",tip:"Put your name in, then browse nearby instead of standing at the entrance."},
  "Old Mill Creamery":{chips:["Walk from dinner","River dessert"],parking:"Walk from the Old Mill district parking area.",food:"Take dessert toward the river if the weather is comfortable.",photo:"Ice cream by the river",tip:"Let this become the evening’s slow-down moment."},
  "Pancake Pantry":{chips:["Downtown parking","Signature pancakes"],parking:"Park downtown once for breakfast and the aquarium when feasible; follow posted signs and rates.",food:"Choose a signature pancake flavor and avoid over-ordering before a walking day.",photo:"Historic entrance or breakfast stack",tip:"An efficient breakfast protects the aquarium’s morning hours."},
  "Ripley's Aquarium of the Smokies":{chips:["Downtown parking","2–3 hours"],parking:"Use a downtown parking option that also works for nearby exploration and follow posted signs and rates.",practical:"Have ticket links ready before reaching the entrance and choose a family meet-up point.",photo:"Penguin area, underwater tunnel, or exterior plaza",tip:"Visit the family’s highest-priority exhibits first, before attention fades."},
  "Anakeesta":{chips:["Optional","Weather + energy check"],parking:"Use a downtown parking option and follow the attraction’s current boarding guidance.",practical:"Choose this only when weather, energy, timing, and height comfort all align.",photo:"Mountain overlook if visibility is good",tip:"Optional means optional—protect the farewell dinner over squeezing this in."},
  "Downtown Gatlinburg":{chips:["Keep same parking","Firm departure time"],parking:"Keep the same downtown parking space whenever possible and follow posted signs and rates.",food:"Choose one small local treat rather than another full food stop.",photo:"Village lanes or a low-key mountain-town backdrop",tip:"Set a firm departure time for The Greenbrier."},
  "The Greenbrier Restaurant":{chips:["Restaurant parking","Farewell meal"],parking:"Drive from downtown, follow the restaurant’s parking signs, and arrive unhurried.",food:"Treat this as the farewell meal and choose what feels celebratory.",photo:"Family photo before dinner or by the entrance",tip:"Pause for a favorite-memory toast before the meal ends."},
  "Home":{simple:true,chips:["Live navigation"],parking:"Complete the final vehicle check before departure.",practical:"Use live navigation for traffic-aware routing and choose rest breaks as needed.",photo:"Final family photo before the drive",tip:"The drive home is part of the adventure—share favorite memories along the way."}
};

function reservationStatusFor(date,name){
  const record=(RESERVATION_DATA[date]||[]).find(item=>item.name===name);
  if(!record)return "";
  return [record.status,record.time].filter(Boolean).join(" · ");
}

function smartStopGuide(stop,date){
  const guide=SMART_STOP_GUIDES[stop.name];
  if(!guide)return null;
  return {...guide,reservation:reservationStatusFor(date,stop.name)};
}

function smartStopChips(stop,guide){
  const chips=[`⏱ ${stop.duration}`];
  if(guide?.reservation)chips.push(`🎟 ${guide.reservation}`);
  for(const chip of guide?.chips||[]){
    if(chips.length>=4)break;
    chips.push(chip);
  }
  return chips.slice(0,4);
}

function smartStopsMarkup(d){
  const originalStops=STOP_DATA[d.date]||[];
  const startStop=START_DATA[d.date];
  if(!originalStops.length||!startStop)return "";

  const dayStops=d.date==="2026-08-14"?originalStops.slice(1):originalStops;
  const stops=[{...startStop,isStart:true},...dayStops];
  const driveTimes=[startStop.drive,...(NEXT_DRIVE_TIMES[d.date]||[])];
  if(d.date==="2026-08-14")driveTimes.splice(1);

  const splitAt=Math.ceil(stops.length/2);
  const columns=[stops.slice(0,splitAt),stops.slice(splitAt)];

  function stopCardMarkup(stop,absoluteIndex){
    const next=stops[absoluteIndex+1];
    const route=next?googleRoute(stop.query,next.query):"";
    const nextDrive=driveTimes[absoluteIndex]||"Drive time varies";
    const isReturn=stop.name==="Club Wyndham Smoky Mountains" && absoluteIndex===stops.length-1;
    const isOptional=stop.type==="Optional adventure";
    const orderLabel=stop.isStart?"Start":absoluteIndex;
    const guide=smartStopGuide(stop,d.date);
    const chips=smartStopChips(stop,guide);
    const detailRows=guide?[
      guide.parking&&`<div><b>🅿 Parking & arrival</b><p>${escapeHtml(guide.parking)}</p></div>`,
      guide.food&&`<div><b>🍽 Foodie pick</b><p>${escapeHtml(guide.food)}</p></div>`,
      guide.photo&&`<div><b>📸 Best photo</b><p>${escapeHtml(guide.photo)}</p></div>`,
      guide.practical&&`<div><b>🎒 Practical note</b><p>${escapeHtml(guide.practical)}</p></div>`,
      guide.reservation&&`<div><b>🎟 Reservation / ticket</b><p>${escapeHtml(guide.reservation)}</p></div>`,
      guide.tip&&`<div class="remyTip"><b>💚 Remy’s Tip</b><p>${escapeHtml(guide.tip)}</p></div>`
    ].filter(Boolean).join(""):"";
    const showGuide=Boolean(guide&&!guide.simple&&detailRows);
    return `<article class="stopCard evolvedStop ${stop.isStart?"startStop":""} ${isReturn?"returnStop":""} ${isOptional?"optionalStop":""}" data-stop-name="${escapeHtml(stop.name)}">
      <div class="stopOrder"><span>${orderLabel}</span><i></i></div>
      <div class="stopBody">
        <div class="stopTitle">
          <span class="stopIcon">${stop.icon}</span>
          <div><small>${escapeHtml(stop.time)} · ${escapeHtml(stop.type)}</small><h4>${escapeHtml(stop.name)}</h4>${stop.isStart&&d.date==="2026-08-07"?`<p class="startAddress">${escapeHtml(HOME_ADDRESS)}</p>`:""}</div>
        </div>
        <div class="quickChips" aria-label="At-a-glance stop details">${chips.map(chip=>`<span>${escapeHtml(chip)}</span>`).join("")}</div>
        ${showGuide?`<details class="destinationGuide"><summary>Explore this stop</summary><div class="destinationGuideBody">${detailRows}</div></details>`:""}
        <div class="navActions">
          <a href="${wazeSearch(stop.query)}" target="_blank" rel="noopener">🚙 Waze</a>
          <a href="${mapsSearch(stop.query)}" target="_blank" rel="noopener">📍 Google Maps</a>
          ${next?`<a class="nextRoute" href="${route}" target="_blank" rel="noopener">Next: ${escapeHtml(next.name)}<span class="nextDriveTime">🚗 ${escapeHtml(nextDrive)}</span> →</a>`:`<span class="routeComplete">You’re done for today ✓</span>`}
        </div>
      </div>
    </article>`;
  }

  return `<section class="smartStops smartStopEvolution">
    <div class="smartStopsHead">
      <div><span class="eyebrow">YOUR ADVENTURE ITINERARY</span><h3>Smart Stops</h3></div>
      <span>${stops.length-1} stops + start</span>
    </div>
    <p class="stopIntro">Read the cards chronologically. Quick Chips show the essentials; open “Explore this stop” on major destinations for parking, food, photo, and practical guidance.</p>
    <div class="stopColumns">
      ${columns.map((column,columnIndex)=>{
        const offset=columnIndex===0?0:splitAt;
        return `<div class="stopColumn">${column.map((stop,index)=>stopCardMarkup(stop,offset+index)).join("")}</div>`;
      }).join("")}
    </div>
  </section>`;
}


const RESERVATION_OVERRIDES_KEY="adventureCompanionReservationOverridesV1";

function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function safeUrl(value){
  const raw=String(value||"").trim();
  if(!raw)return "";
  try{
    const candidate=/^https?:\/\//i.test(raw)?raw:`https://${raw}`;
    const parsed=new URL(candidate);
    return ["http:","https:"].includes(parsed.protocol)?parsed.href:"";
  }catch(e){return ""}
}

function reservationKey(date,index,item){
  return `${date}::${index}::${item.name}`;
}

function readReservationOverrides(){
  try{return JSON.parse(localStorage.getItem(RESERVATION_OVERRIDES_KEY)||"{}")}catch(e){return {}}
}

function saveReservationOverrides(data){
  localStorage.setItem(RESERVATION_OVERRIDES_KEY,JSON.stringify(data));
}

function getReservationRecord(date,item,index){
  const overrides=readReservationOverrides();
  const saved=overrides[reservationKey(date,index,item)]||{};
  return {
    confirmation:saved.confirmation ?? "",
    ticketUrl:saved.ticketUrl ?? "",
    documentUrl:saved.documentUrl ?? "",
    parkingNotes:saved.parkingNotes ?? "",
    phone:saved.phone ?? item.phone ?? "",
    website:saved.website ?? item.website ?? "",
    notes:saved.notes ?? item.notes ?? "",
    status:saved.status ?? item.status ?? "Pending"
  };
}

function managerMarkup(){
  const groups=Object.entries(RESERVATION_DATA).filter(([,items])=>items.length);
  return `<section class="reservationManager">
    <div class="reservationManagerHead">
      <button class="managerBack" data-view="reservations" type="button">← Reservations</button>
      <div>
        <span class="eyebrow">M3-02.5 · RESERVATION DETAILS</span>
        <h2>Manage Reservations</h2>
        <p>Add or update confirmation numbers, ticket links, reservation documents, parking notes, phone numbers, websites, and status. Saved information appears on the shared reservation cards.</p>
      </div>
      <button id="resetReservationDetails" class="managerSecondary" type="button">Reset saved edits</button>
    </div>
    <div class="managerNotice">
      These details are stored in this browser. They are visible to anyone using this copy of the app, but they do not automatically sync to a different device.
    </div>
    <div class="reservationManagerGroups">${groups.map(([date,items])=>`
      <section class="managerDay">
        <h3>${dateLabel(date)}</h3>
        ${items.map((item,index)=>managerEditorMarkup(date,item,index)).join("")}
      </section>`).join("")}
    </div>
  </section>`;
}

function managerEditorMarkup(date,item,index){
  const rec=getReservationRecord(date,item,index);
  const key=reservationKey(date,index,item);
  return `<details class="managerReservation">
    <summary>
      <span class="managerIcon">${item.icon}</span>
      <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.time)} · ${escapeHtml(rec.status)}</small></span>
      <b>Edit</b>
    </summary>
    <form class="managerForm" data-reservation-form="${escapeHtml(key)}">
      <div class="managerGrid">
        <label>Confirmation number
          <input name="confirmation" value="${escapeHtml(rec.confirmation)}" placeholder="Example: ABC12345">
        </label>
        <label>Status
          <select name="status">
            ${["Confirmed","Pending","Action Needed"].map(s=>`<option ${rec.status===s?"selected":""}>${s}</option>`).join("")}
          </select>
        </label>
        <label>Contact phone
          <input name="phone" type="tel" value="${escapeHtml(rec.phone)}" placeholder="Optional">
        </label>
        <label>Website
          <input name="website" type="url" value="${escapeHtml(rec.website)}" placeholder="https://…">
        </label>
        <label class="wide">Ticket or reservation link
          <input name="ticketUrl" type="url" value="${escapeHtml(rec.ticketUrl)}" placeholder="https://…">
        </label>
        <label class="wide">Reservation document link
          <input name="documentUrl" type="url" value="${escapeHtml(rec.documentUrl)}" placeholder="https://…">
        </label>
        <label class="wide">Parking notes
          <textarea name="parkingNotes" rows="2" placeholder="Parking lot, entrance, arrival or check-in guidance">${escapeHtml(rec.parkingNotes)}</textarea>
        </label>
        <label class="wide">Trip notes
          <textarea name="notes" rows="2" placeholder="Shared notes for the family">${escapeHtml(rec.notes)}</textarea>
        </label>
      </div>
      <div class="managerActions">
        <button class="managerSave" type="submit">Save reservation</button>
        <button class="managerClear" type="button">Clear custom details</button>
        <span class="managerStatus" aria-live="polite"></span>
      </div>
    </form>
  </details>`;
}

function wireReservationManager(){
  document.querySelector("#resetReservationDetails")?.addEventListener("click",()=>{
    if(confirm("Reset all reservation edits saved in this browser?")){
      localStorage.removeItem(RESERVATION_OVERRIDES_KEY);
      renderReservationManager();
    }
  });
  document.querySelectorAll("[data-reservation-form]").forEach(form=>{
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const data=new FormData(form);
      const all=readReservationOverrides();
      const key=form.dataset.reservationForm;
      all[key]={
        confirmation:String(data.get("confirmation")||"").trim(),
        status:String(data.get("status")||"Pending"),
        phone:String(data.get("phone")||"").trim(),
        website:safeUrl(data.get("website")),
        ticketUrl:safeUrl(data.get("ticketUrl")),
        documentUrl:safeUrl(data.get("documentUrl")),
        parkingNotes:String(data.get("parkingNotes")||"").trim(),
        notes:String(data.get("notes")||"").trim(),
        updatedAt:new Date().toISOString()
      };
      saveReservationOverrides(all);
      const status=form.querySelector(".managerStatus");
      if(status)status.textContent="✓ Saved";
      setTimeout(()=>{if(status)status.textContent=""},1800);
    });
    form.querySelector(".managerClear")?.addEventListener("click",()=>{
      const all=readReservationOverrides();
      delete all[form.dataset.reservationForm];
      saveReservationOverrides(all);
      renderReservationManager();
    });
  });
}

function renderReservationManager(){
  const s=document.querySelector("#screen");
  if(!s)return;
  s.hidden=false;
  s.innerHTML=managerMarkup();
  wireReservationManager();
  $$("[data-view]").forEach(b=>b.onclick=()=>view(b.dataset.view));
  bindManageReservationButtons();
  s.scrollIntoView({behavior:"smooth",block:"start"});
}

const READINESS_KEY="adventureCompanionReadiness";

function statusClass(status){
  const s=String(status||"").toLowerCase();
  if(s.includes("confirm")||s.includes("purchased"))return "confirmed";
  if(s.includes("pending")||s.includes("needed")||s.includes("contacted"))return "pending";
  return "planned";
}

function reservationMarkup(d){
  const items=RESERVATION_DATA[d.date]||[];
  if(!items.length)return "";
  return `<section class="reservationCenter">
    <div class="reservationCenterHead">
      <div><span class="eyebrow">RESERVATION CENTER</span><h3>Bookings for this day</h3></div>
      <div class="reservationCenterTools"><span>${items.length} item${items.length===1?"":"s"}</span><button data-manage-reservations="1" type="button">✏️ Manage</button></div>
    </div>
    <div class="reservationCards">${items.map((item,index)=>{
      const rec=getReservationRecord(d.date,item,index);
      const status=statusClass(rec.status);
      return `<article class="reservationCard">
        <div class="reservationTop">
          <span class="reservationIcon">${item.icon}</span>
          <div><small>${escapeHtml(item.time)}</small><h4>${escapeHtml(item.name)}</h4></div>
          <span class="reservationStatus ${status}">${escapeHtml(rec.status)}</span>
        </div>
        <div class="reservationDetails enhanced">
          ${rec.confirmation?`<div><span>Confirmation #</span><strong>${escapeHtml(rec.confirmation)}</strong></div>`:""}
          ${rec.phone?`<div><span>Contact</span><strong>${escapeHtml(rec.phone)}</strong></div>`:""}
          ${rec.parkingNotes?`<div class="wideDetail"><span>🅿️ Parking</span><strong>${escapeHtml(rec.parkingNotes)}</strong></div>`:""}
          ${rec.notes?`<p>${escapeHtml(rec.notes)}</p>`:""}
        </div>
        <div class="reservationActions">
          ${rec.phone?`<a href="tel:${escapeHtml(rec.phone)}">📞 Call</a>`:""}
          ${rec.website?`<a href="${escapeHtml(safeUrl(rec.website))}" target="_blank" rel="noopener">🌐 Website</a>`:""}
          ${rec.ticketUrl?`<a href="${escapeHtml(safeUrl(rec.ticketUrl))}" target="_blank" rel="noopener">🎟️ Tickets / Reservation</a>`:""}
          ${rec.documentUrl?`<a href="${escapeHtml(safeUrl(rec.documentUrl))}" target="_blank" rel="noopener">📄 Reservation Document</a>`:""}
        </div>
      </article>`}).join("")}</div>
  </section>`
}

function readReadiness(){
  try{return JSON.parse(localStorage.getItem(READINESS_KEY)||"{}")}catch(e){return {}}
}
function saveReadiness(state){
  localStorage.setItem(READINESS_KEY,JSON.stringify(state));
}
function readinessState(item){
  const state=readReadiness();
  return state[item.id]===undefined?item.done:Boolean(state[item.id]);
}
function readinessPercent(){
  const complete=READINESS_ITEMS.filter(readinessState).length;
  return Math.round(complete/READINESS_ITEMS.length*100);
}
function readinessMarkup(){
  const pct=readinessPercent();
  return `<section class="readinessScreen">
    <div class="readinessHero">
      <span class="eyebrow">MILESTONE 2 RELEASE CANDIDATE</span>
      <h2>Trip Readiness</h2>
      <p>Finish the practical details before sharing Adventure Companion with the family.</p>
      <div class="readinessMeter" aria-label="${pct}% ready">
        <div class="readinessRing" style="--pct:${pct}"><strong>${pct}%</strong><small>ready</small></div>
        <div><strong>${READINESS_ITEMS.filter(readinessState).length} of ${READINESS_ITEMS.length}</strong><span>trip areas complete</span></div>
      </div>
    </div>
    <div class="readinessList">${READINESS_ITEMS.map(item=>{
      const done=readinessState(item);
      return `<label class="readinessItem ${done?"done":""}">
        <input type="checkbox" data-readiness="${item.id}" ${done?"checked":""}>
        <span class="readinessIcon">${item.icon}</span>
        <span><strong>${item.label}</strong><small>${item.detail}</small></span>
        <b>${done?"Ready":"Open"}</b>
      </label>`
    }).join("")}</div>
    <p class="readinessNote">Trip-specific packing is ready, including personal medication reminders and rain protection for every traveler.</p>
  </section>`;
}

function wireReleaseCandidateTools(){
  document.querySelectorAll("[data-readiness]").forEach(box=>{
    if(box.dataset.wired==="1")return;
    box.dataset.wired="1";
    box.addEventListener("change",()=>{
      const state=readReadiness();
      state[box.dataset.readiness]=box.checked;
      saveReadiness(state);
      const host=document.querySelector("#readinessHost");
      if(host){
        host.innerHTML=readinessMarkup();
        wireReleaseCandidateTools();
      }
    });
  });
}

function dashboardMarkup(d){
  const x=DAY_DASH[d.date]||{};
  const complete=isComplete(d.date);
  return `<section class="dailyDashboard dashboardRedesign">
    <div class="dashboardLead">
      <span class="dashboardIcon">${x.icon||"🏔️"}</span>
      <div><span class="eyebrow">DAY ${dayNumber(d.date)} OF ${DATA.days.length}</span><h3>${dateLabel(d.date)}</h3><p>${x.focus||d.theme}</p></div>
      <button class="completeDay ${complete?"done":""}" data-complete="${d.date}" type="button" aria-pressed="${complete}">${complete?"✓ Complete":"Mark complete"}</button>
    </div>
    <div class="adventureSummary" aria-label="Today's adventure summary">
      <article><small>⏰ LEAVE AROUND</small><strong>${x.leave||"Flexible"}</strong></article>
      <article><small>📍 FIRST STOP</small><strong>${x.first||d.schedule[0][1]}</strong></article>
      <article><small>🎟️ RESERVATION</small><strong>${x.reservation||"No timed booking"}</strong></article>
      <article><small>🚗 TOTAL DRIVING</small><strong>${d.drive}</strong></article>
      <article><small>🌅 SUNSET</small><strong>${x.sunset||"Check closer to trip"}</strong></article>
    </div>
    <div class="dashboardFooter"><span>🌿 ${x.pace||"Flexible pace"}</span><span>Smart Stop Cards are today's itinerary</span></div>
  </section>
  <section class="adventureWeather" data-day-weather="${d.date}" aria-label="Adventure Intelligence">
    <div class="adventureWeatherHead">
      <div><span class="eyebrow">ADVENTURE INTELLIGENCE</span><h3>Weather & Plan B</h3></div>
      <span class="weatherWindowStatus" data-day-weather-status="${d.date}">Checking forecast…</span>
    </div>
    <div class="adventureWeatherBody">
      <div class="weatherPrimary"><span class="weatherPrimaryIcon">🌤️</span><div><strong>${dayWeatherFallback(d.date)}</strong><small>Sevierville / Smoky Mountains</small></div></div>
      <div class="adventureOutlook"><b>Adventure outlook</b><p>We will translate the forecast into practical guidance as soon as this date enters the forecast window.</p></div>
    </div>
    <details class="adaptiveAdventure">
      <summary>View Adaptive Adventure</summary>
      <div><b>Plan B</b><p>${d.planB}</p><small>Your reservations remain the anchor unless conditions require a change.</small></div>
    </details>
  </section>`;
}

let tripWeatherPromise=null;
function dayWeatherFallback(date){
  const target=new Date(date+'T12:00:00');
  return target-Date.now()>16*86400000?'Forecast opens closer to the trip':'Forecast unavailable';
}
function adventureOutlook(day){
  const rain=Number(day.rainChance||0),high=Number(day.high||0);
  const notes=[];
  if(rain>=60)notes.push('Rain may affect outdoor stops; keep the Adaptive Adventure ready.');
  else if(rain>=30)notes.push('A passing shower is possible; the original plan still looks workable.');
  else notes.push('Low rain risk supports the original adventure plan.');
  if(high>=90)notes.push('Plan shade, water, and indoor breaks during the hottest hours.');
  else if(high>=84)notes.push('Warm conditions make hydration and pacing important.');
  else notes.push('Temperatures look comfortable for the planned pace.');
  if(/storm|thunder/i.test(day.condition||''))notes.push('Recheck before leaving and protect timed reservations first.');
  return notes.slice(0,3).map(note=>`<li>${note}</li>`).join('');
}
function hydrateDayWeather(){
  const cards=[...document.querySelectorAll('[data-day-weather]')];
  if(!cards.length||!window.AdventureWeather?.loadTripForecast)return;
  if(!tripWeatherPromise)tripWeatherPromise=window.AdventureWeather.loadTripForecast({allowExpired:!navigator.onLine}).catch(()=>null);
  tripWeatherPromise.then(result=>{
    cards.forEach(card=>{
      const date=card.dataset.dayWeather,day=result?.data?.days?.[date];
      const status=card.querySelector(`[data-day-weather-status="${date}"]`);
      const body=card.querySelector('.adventureWeatherBody');
      if(day&&body){
        body.innerHTML=`<div class="weatherPrimary"><span class="weatherPrimaryIcon">${day.icon}</span><div><strong>${day.high}° / ${day.low}° · ${day.condition}</strong><small>${day.rainChance}% chance of rain</small></div></div><div class="adventureOutlook"><b>Adventure outlook</b><ul>${adventureOutlook(day)}</ul></div>`;
        if(status)status.textContent=result.fromCache?'Cached forecast':'Live forecast';
        card.classList.toggle('adaptiveRecommended',Number(day.rainChance||0)>=50||/storm|thunder/i.test(day.condition||''));
      }else if(status){
        status.textContent='Forecast window not open yet';
      }
    });
  });
}

function experienceDashboardMarkup(){
  const rows=window.AdventurePacking?.readiness?.()||[];
  const unlocked=localStorage.getItem('adventureCompanionCampfireUnlocked')==='true';
  return `<div class="experienceDashboardGrid">
    <button class="experienceCard remysCornerCard" data-view="companion" type="button"><span class="experienceCardIcon">🔥</span><span><small>REMY'S CORNER</small><strong>${unlocked?'The Journey Begins is unlocked':'A thought for today'}</strong><em>Campfire stories · Adventure phase · Encouragement</em></span><b>Open →</b></button>
    <button class="experienceCard readinessCard" data-view="packing" type="button"><span class="experienceCardIcon">🎒</span><span><small>FAMILY ADVENTURE READINESS</small><strong>${rows.filter(r=>r.ready).length} of ${rows.length} adventurers ready</strong><span class="readinessPeople">${rows.map(r=>`<i class="${r.ready?'ready':''}">${r.icon} ${r.name} ${r.ready?'✓':''}</i>`).join('')}</span></span><b>Pack →</b></button>
  </div>`;
}
function renderExperienceDashboard(){const card=document.querySelector('#homeCard');if(!card)return;card.querySelector('.experienceDashboardGrid')?.remove();card.insertAdjacentHTML('beforeend',experienceDashboardMarkup());bindDynamic();}
window.addEventListener('adventure:packing-progress',renderExperienceDashboard);
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
  h=`${dashboardMarkup(day)}<button class=primary data-day="${day.date}">Open today's adventure</button>`
}
if(p==="remembering")h=`<div class=big>🌳</div><h3>This adventure is part of your story.</h3><p>Gather the photos, laughter, favorite meals, and lessons you want to carry forward.</p><button class=primary id=next>🏔️ Plan Your Next Adventure</button>`;
$("#homeCard").innerHTML=h;renderExperienceDashboard();bindDynamic();bindCompletion();hydrateDayWeather()}

document.addEventListener("click",event=>{
  const manageButton=event.target.closest("[data-manage-reservations]");
  if(!manageButton)return;
  event.preventDefault();
  event.stopPropagation();
  renderReservationManager();
});

function bindManageReservationButtons(){
  document.querySelectorAll("[data-manage-reservations]").forEach(button=>{
    if(button.dataset.manageWired==="1")return;
    button.dataset.manageWired="1";
    button.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      renderReservationManager();
    });
  });
}
function bindDynamic(){$$("[data-go]").forEach(b=>b.onclick=()=>view(b.dataset.go));$$("[data-view]").forEach(b=>b.onclick=()=>view(b.dataset.view));bindManageReservationButtons();$$("[data-day]").forEach(b=>b.onclick=()=>showDay(b.dataset.day));$("#next")?.addEventListener("click",()=>$("#homeCard").insertAdjacentHTML("beforeend","<p><b>New Adventure seed planted. 🌱</b></p>"))}
function bindCompletion(){
  $$("[data-complete]").forEach(b=>b.onclick=()=>{
    const date=b.dataset.complete;
    setComplete(date,!isComplete(date));
    showDay(date);
  });
}
function view(v){$$("nav button,.desktopSideNav [data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===v));const s=$("#screen");if(v==="home"){s.classList.remove("screenEntering");s.hidden=true;scrollTo({top:0,behavior:"smooth"});$("#homeCard")?.focus?.({preventScroll:true});return}s.hidden=false;s.classList.remove("screenEntering");void s.offsetWidth;s.classList.add("screenEntering");
if(v==="week")s.innerHTML=`<div class=weekHeading><div><span class=eyebrow>MILESTONE 3</span><h3>🗓️ Our Adventure Week</h3></div><span class=weekProgress>${completedDays().length}/8 complete</span></div><p class=info>Each day opens to a dashboard plus smart stop cards with Waze, Google Maps, and stop-to-stop route links.</p><div class=familyDayGrid>${DATA.days.map(d=>{const dt=new Date(d.date+"T12:00:00"),x=DAY_DASH[d.date],done=isComplete(d.date);return `<div class="familyDayCard ${done?"completed":""}"><button data-open="${d.date}"><span class=datePill><small>${dt.toLocaleDateString(undefined,{weekday:"short"})}</small><b>${dt.getDate()}</b></span><span class=summary><strong>${done?"✓ ":""}${d.title}</strong><small>${x.icon} ${x.leave} · ${x.reservation}</small><em>${x.focus}</em></span><span class=chev>›</span></button></div>`}).join("")}</div>`;
if(v==="reservations")s.innerHTML=`<div class="reservationIndexHead simplified">
  <div><span class="eyebrow">TRIP RESERVATIONS</span><h3>🍽️ Reservations</h3></div>
  <button class="manageReservationsButton compact" data-manage-reservations="1" type="button">✏️ Manage</button>
</div>${Object.entries(RESERVATION_DATA).filter(([,items])=>items.length).map(([date,items])=>`
  <section class="reservationIndexDay"><h4>${dateLabel(date)}</h4>
  ${items.map((item,index)=>{const rec=getReservationRecord(date,item,index);return `<article class="reservationIndexCard">
    <span>${item.icon}</span>
    <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.time)}${rec.confirmation?` · Confirmation ${escapeHtml(rec.confirmation)}`:""}</small></div>
    <b class="${statusClass(rec.status)}">${escapeHtml(rec.status)}</b>
  </article>`}).join("")}</section>`).join("")}`;
if(v==="traditions")s.innerHTML=`<h3>💚 Moments to Protect</h3><ul class=info>${DATA.traditions.map(t=>`<li>${t}</li>`).join("")}</ul>`;
if(v==="packing"){window.AdventurePacking?.render(s);}
if(v==="trip")s.innerHTML=`<h3>🎒 Trip Snapshot</h3><p><b>Dates:</b> August 7–14, 2026</p><p><b>Home base:</b> ${DATA.trip.homeBase}</p><p><b>Travel party:</b> ${DATA.trip.party}</p><p><b>Priorities:</b> Stay together, place busy attractions on weekdays, eat well, minimize unnecessary driving, and preserve rest.</p>`;
if(v==="companion"){const campfire=localStorage.getItem("adventureCompanionCampfireUnlocked")==="true";s.innerHTML=`<div class="remysCornerHead"><span class="bigFire">🔥</span><div><span class="eyebrow">A PLACE TO PAUSE</span><h3>Remy’s Corner</h3><p>Celebrate effort. Preserve memories. Reduce stress.</p></div></div><section class="todayThought"><small>TODAY’S THOUGHT</small><blockquote>The itinerary supports the experience; it does not have to control it.</blockquote></section><section class="cornerPhase"><small>ADVENTURE PHASE</small><strong>🌿 Planning · The adventure is taking shape</strong></section><h4 class="campfireTitle">🔥 Campfire Stories</h4>${campfire?`<section class="campfireUnlocked"><span aria-hidden="true">🔥</span><div><small>UNLOCKED · THE JOURNEY BEGINS</small><h4>Packing is the moment a dream becomes real.</h4><p>Soon you’ll be standing together in the Smoky Mountains. Laugh often. Take pictures. Be present. These moments become memories faster than we expect.</p><em>— Remy 💚</em></div></section>`:`<section class="campfireLocked"><span>🔒</span><div><strong>The Journey Begins</strong><p>Complete every adventurer’s packing list to unlock this Campfire.</p></div></section>`}<section class="futureCampfires"><span>🔒 One Week Left</span><span>🔒 Road Trip Begins</span><span>🔒 First Sunrise</span></section>`;}
hydrateDayWeather();$$(`[data-open]`).forEach(b=>b.onclick=()=>showDay(b.dataset.open));$$("[data-view]").forEach(b=>b.onclick=()=>view(b.dataset.view));bindManageReservationButtons();s.scrollIntoView({behavior:"smooth",block:"start"})}
function showDay(date){const d=DATA.days.find(x=>x.date===date);if(!d)return;const s=$("#screen");s.hidden=false;s.innerHTML=`<div class=dayHead><button class=back data-back>← Week</button><span class=dayPosition>Day ${dayNumber(date)} of ${DATA.days.length}</span></div>
${dashboardMarkup(d)}
<div class=dayHero><small>${d.short} · ${d.theme}</small><h3>${d.title}</h3><p>${d.why}</p><div class=dayChips><span>🚗 ${d.drive}</span><span>🌤️ Adaptive weather guidance</span><span>📍 Stops in journey order</span></div></div>
${reservationMarkup(d)}
${smartStopsMarkup(d)}
<div class=why><b>◆ Why this day matters</b><br>${d.why}</div>
<div class=remy><b>★ Remy's recommendation</b><br>${d.remy}</div>
<div class=familyQuestion><b>💚 Family question</b><br>${familyQuestionFor(d.date)}</div>`;
$("[data-back]").onclick=()=>view("week");bindCompletion();bindManageReservationButtons();hydrateDayWeather();s.scrollIntoView({behavior:"smooth",block:"start"})}
DATA = {"trip": {"name": "Smoky Mountains 2026", "start": "2026-08-07", "end": "2026-08-14", "homeBase": "Club Wyndham Smoky Mountains", "party": "Papa, Bubbe, Emily, Jake, and Kaseryn"}, "days": [{"date": "2026-08-07", "short": "Fri 8/7", "title": "Welcome to Tennessee", "theme": "Welcome", "why": "Ease into the vacation without overplanning. The first evening is celebratory but flexible after the drive.", "budget": "$250–$325", "drive": "About 20–30 minutes total", "route": "Club Wyndham → Local Goat → The Island → Club Wyndham", "parking": "Local Goat has on-site parking. The Island has a large free lot with tram service.", "crowds": "If arrival runs late, preserve dinner and shorten or skip The Island.", "food": "Local Goat · 6:00 PM", "dishes": "Fried green tomatoes, bison burger, bistro steak, seasonal fish, peanut butter pie.", "dessert": "The Island Creamery", "photos": "Resort arrival; The Island fountain at dusk.", "planB": "Dinner only, followed by a quiet resort evening.", "remy": "Do not rush the fountains. Let this evening feel like the official start of the trip.", "schedule": [["Afternoon", "Arrive, check in, unpack, and make a quick grocery stop."], ["5:35 PM", "Leave the resort for dinner."], ["6:00 PM", "Local Goat reservation."], ["7:45 PM", "The Island fountain show, strolling, and first family photo."], ["Afterward", "Dessert at The Island Creamery, then return to the resort."]]}, {"date": "2026-08-08", "short": "Sat 8/8", "title": "Mountains, Arts & Local Flavor", "theme": "Mountains", "why": "A gentle Smokies introduction with one easy waterfall walk, local art, and a memorable dinner.", "budget": "$350–$450", "drive": "About 75–100 minutes total, depending on traffic", "route": "Club Wyndham → Five Oaks → Sugarlands → Cataract Falls → Wild Plum → Arts & Crafts → Park Grill → Donut Friar → Resort", "parking": "Sugarlands and artisan stops have free parking. Park once near Park Grill and The Village.", "crowds": "Saturday is busy, so avoid major ticketed attractions and keep the day flexible.", "food": "Wild Plum Tea Room · 1:30 PM; Park Grill pending", "dishes": "At Park Grill: mountain trout, hickory-grilled ribeye, cedar-plank salmon, salad bar, blackberry cobbler.", "dessert": "The Donut Friar after dinner", "photos": "National Park sign; Cataract Falls bridge; artisan studio; The Village at night.", "planB": "If weather limits the waterfall, spend more time at Sugarlands and the Arts & Crafts Community.", "remy": "Sit quietly by the creek for ten minutes. No phones; just listen to the water.", "schedule": [["9:30 AM", "Breakfast at Five Oaks Farm Kitchen."], ["10:45 AM", "Drive toward Great Smoky Mountains National Park."], ["11:15 AM", "Sugarlands Visitor Center and family photo at the park sign."], ["12:05 PM", "Walk to Cataract Falls and pause by the creek."], ["1:30 PM", "Wild Plum Tea Room reservation."], ["3:00 PM", "Great Smoky Arts & Crafts Community; select a few studios."], ["6:00 PM", "Park Grill target time — reservation still pending."], ["After dinner", "Walk to The Village and visit The Donut Friar."]]}, {"date": "2026-08-09", "short": "Sun 8/9", "title": "Relax, Wine & Appalachia", "theme": "Recharge", "why": "A deliberately slower day before Dollywood, built around Apple Barn flavors, wine tasting, and protected resort time.", "budget": "$325–$425", "drive": "Mostly 5–15 minute drives; roughly 35–50 minutes total", "route": "Club Wyndham → Apple Barn Village & Winery → Club Wyndham → Seasons 101 → Club Wyndham", "parking": "Large free lots at Apple Barn. Confirm downtown parking for Seasons 101.", "crowds": "Sunday is intentionally low-pressure. Stay longer only where everyone is enjoying themselves.", "food": "Seasons 101 · 6:00 PM", "dishes": "Choose from the seasonal menu and keep dinner relaxed after the tasting.", "dessert": "Apple Barn Bakery after lunch and wine tasting", "photos": "Apple Barn wagon; winery tasting; family bottle selection.", "planB": "Rain does not materially affect this day; extend indoor Apple Barn time and resort downtime.", "remy": "Let the wine tasting be leisurely. This is a vacation day, not a checklist.", "schedule": [["9:30 AM", "Breakfast at Applewood Farmhouse."], ["10:45 AM", "Explore Apple Barn Village: bakery, cider mill, shops, and creamery."], ["12:30 PM", "Light lunch in the village or nearby."], ["After lunch", "Apple Barn Winery tasting and select the Wine of the Trip."], ["After tasting", "Apple Barn Bakery dessert destination."], ["2:30–5:00 PM", "Choose Your Own Adventure afternoon at the resort."], ["6:00 PM", "Seasons 101 reservation."]]}, {"date": "2026-08-10", "short": "Mon 8/10", "title": "Dollywood Classics", "theme": "Dollywood", "why": "The busiest attraction is placed on Monday to reduce crowds and maximize rides, shows, crafts, and food.", "budget": "$750–$950", "drive": "About 10–15 minutes each way, plus parking traffic", "route": "Club Wyndham → Dollywood → Club Wyndham", "parking": "Standard parking is adequate; preferred parking may be worth it for shorter walking.", "crowds": "Arrive before opening, prioritize top rides early, and avoid overcommitting to closing time.", "food": "Flexible dining inside Dollywood", "dishes": "Cinnamon bread, barbecue, skillet meals, fresh lemonade, and one family-shared snack.", "dessert": "Dollywood cinnamon bread", "photos": "Dollywood entrance; Dollywood Express; Big Bear Mountain sign; Craftsman's Valley.", "planB": "Use indoor shows, shops, and restaurants during storms; revisit rides when weather clears.", "remy": "Leave while everyone is still smiling, not after everyone is exhausted.", "schedule": [["7:15 AM", "Quick breakfast at the condo or nearby."], ["8:30–8:45 AM", "Arrive before opening; allow time for parking and security."], ["Opening", "Big Bear Mountain first, then FireChaser Express and other priorities."], ["Late morning", "Dollywood Express, Craftsman's Valley, eagle area, and shows."], ["Lunch", "Choose based on where the family is at that moment."], ["Afternoon", "Mix rides with shows and shaded breaks."], ["Dinner", "Eat inside Dollywood or leave while everyone is still happy."], ["After meal", "Share Dollywood cinnamon bread."]]}, {"date": "2026-08-11", "short": "Tue 8/11", "title": "Hidden Wonders & Adventure Night", "theme": "Hidden Wonders", "why": "A cave, local barbecue, protected downtime, and a playful nighttime coaster make this one of the most varied days.", "budget": "$550–$700", "drive": "About 75–95 minutes total", "route": "Club Wyndham → Forbidden Caverns → Delauder's BBQ → Resort → Blue Moose → Rocky Top Coaster → Ice cream → Resort", "parking": "Free parking at Forbidden Caverns, Delauder's, Blue Moose, and the coaster.", "crowds": "Forbidden Caverns is walk-up. Arrive close to opening and keep the evening flexible.", "food": "Delauder's BBQ lunch; Blue Moose · 6:15 PM target", "dishes": "Brisket, pulled pork, smoked turkey, mac and cheese, beans, banana pudding; later wings, burgers, and salads.", "dessert": "Ice cream only after the mountain coaster", "photos": "Forbidden Caverns entrance; barbecue spread; illuminated coaster.", "planB": "If storms affect the coaster, move it to another clear evening.", "remy": "Do not feel guilty about doing nothing during the afternoon. The rest is intentional.", "schedule": [["9:30 AM", "Breakfast at a nearby café or the condo."], ["10:30 AM", "Drive to Forbidden Caverns."], ["11:00 AM–12:15 PM", "Guided cave tour."], ["12:45 PM", "Lunch at Delauder's BBQ."], ["2:15–5:00 PM", "Completely unscheduled resort afternoon."], ["6:15 PM", "Blue Moose Burgers & Wings target."], ["8:15 PM", "Rocky Top Mountain Coaster after dark."], ["After coaster", "Ice cream dessert destination."]]}, {"date": "2026-08-12", "short": "Wed 8/12", "title": "Adventure, Animals & History", "theme": "Adventure", "why": "Ziplining, animals, Smokies history, a heritage meal, and an unplugged sunset balance excitement and connection.", "budget": "$650–$825", "drive": "About 45–70 minutes total", "route": "Club Wyndham → Lil Black Bear Café → Legacy Mountain Zipline → Lunch → Parrot Mountain → Old Mill → Resort", "parking": "Use attraction lots. At Old Mill, park once and walk the district.", "crowds": "Keep Arts & Crafts off this day; Saturday already covers local artisans.", "food": "Casual lunch; Old Mill Restaurant target", "dishes": "Pot roast, chicken and dumplings or pot pie, corn chowder, fritters, and blackberry cobbler.", "dessert": "Old Mill Creamery", "photos": "Zipline launch; holding parrots; Old Mill water wheel; golden-hour river photo.", "planB": "If ziplining is weather-cancelled, expand Parrot Mountain and Old Mill time and reschedule if possible.", "remy": "Protect the sunset. It may become the most meaningful memory of the week.", "schedule": [["9:00 AM", "Breakfast at Lil Black Bear Café."], ["10:30 AM", "Legacy Mountain Zipline reservation for the kids; Emily joins only if cleared and comfortable."], ["After zipline", "Casual lunch together."], ["Early afternoon", "Parrot Mountain & Gardens."], ["Late afternoon", "Browse the Old Mill district at a relaxed pace."], ["Dinner", "Old Mill Restaurant target."], ["After dinner", "Old Mill Creamery."], ["Sunset", "Sit by the river, put phones away, and share favorite memories so far."]]}, {"date": "2026-08-13", "short": "Thu 8/13", "title": "Grand Finale", "theme": "Grand Finale", "why": "The aquarium is correctly placed on the final full weekday, followed by relaxed Gatlinburg time and a special farewell dinner.", "budget": "$700–$850", "drive": "About 55–75 minutes total, depending on Gatlinburg traffic", "route": "Club Wyndham → Gatlinburg parking → Pancake Pantry → Aquarium → optional Anakeesta/downtown → Greenbrier → Resort", "parking": "Park once downtown for breakfast, aquarium, and optional downtown time. Drive separately to The Greenbrier.", "crowds": "Arrive at the aquarium earlier in the day. Keep the afternoon relaxed and avoid height-anxiety activities.", "food": "The Greenbrier · 6:15 PM", "dishes": "Crab cakes, filet, prime rib if offered, seafood entrée, and a signature dessert.", "dessert": "Dessert at The Greenbrier", "photos": "Aquarium shark tunnel; penguins; gardens or downtown; farewell dinner photo.", "planB": "If weather affects outdoor plans, stay longer at the aquarium and enjoy downtown shops before dinner.", "remy": "At dinner, each person answers: What should become a family tradition from this trip?", "schedule": [["9:30 AM", "Breakfast at Pancake Pantry."], ["10:45 AM", "Ripley's Aquarium of the Smokies."], ["1:00 PM", "Lunch in downtown Gatlinburg."], ["2:15 PM", "Optional relaxed Anakeesta gardens/shops or downtown time; skip height-intensive attractions."], ["Late afternoon", "Return to the car and freshen up if needed."], ["6:15 PM", "The Greenbrier farewell dinner reservation."], ["After dinner", "Dessert at The Greenbrier and family tradition reflection."]]}, {"date": "2026-08-14", "short": "Fri 8/14", "title": "Heading Home", "theme": "Home", "why": "End without rushing: one last meal, one final photo, and time to begin imagining the next adventure.", "budget": "$100–$175", "drive": "Dependent on the drive home", "route": "Club Wyndham → Breakfast if needed → Home", "parking": "No special considerations.", "crowds": "Allow extra departure time for Friday traffic.", "food": "Flexible farewell breakfast", "dishes": "Choose a favorite from earlier in the trip or keep breakfast simple.", "dessert": "None scheduled", "photos": "Final family photo at the resort.", "planB": "Keep the morning light.", "remy": "Start talking about where Making New Traditions should go in 2027.", "schedule": [["Morning", "Relaxed breakfast at the condo or a favorite nearby spot."], ["Before checkout", "Pack, complete a final room check, and take one last family photo."], ["Checkout", "Depart Club Wyndham and head home already discussing the next adventure."]]}], "reservations": [{"name": "Local Goat", "date": "Fri Aug 7", "time": "6:00 PM", "status": "Confirmed"}, {"name": "Wild Plum Tea Room", "date": "Sat Aug 8", "time": "1:30 PM target", "status": "Contacted"}, {"name": "Park Grill", "date": "Sat Aug 8", "time": "6:00 PM target", "status": "Pending"}, {"name": "Seasons 101", "date": "Sun Aug 9", "time": "6:00 PM", "status": "Confirmed"}, {"name": "Legacy Mountain Zipline", "date": "Wed Aug 12", "time": "10:30 AM", "status": "Confirmed"}, {"name": "The Greenbrier", "date": "Thu Aug 13", "time": "6:15 PM", "status": "Confirmed"}], "traditions": ["Take one group photo every day.", "Sit beside the water at Cataract Falls without phones.", "Choose a local Wine of the Trip.", "Share Dollywood cinnamon bread.", "Ride the mountain coaster after dark.", "Take a photo with a parrot.", "Protect Wednesday's sunset.", "Choose one Christmas ornament that represents the trip.", "At farewell dinner, decide which tradition continues next year."]};
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
    const complete=isComplete(d.date);
    const state=complete?"complete":d.date===current?"active":d.date<current?"past":"";
    const weekday=new Date(d.date+"T12:00:00").toLocaleDateString(undefined,{weekday:"short"});
    return `<button class="trailStop stone-${(i%4)+1} ${state}" data-day="${d.date}" title="${escapeHtml(d.title)}" type="button">
      <span class="stoneLabel"><strong>${complete?"✓ Day "+(i+1):"Day "+(i+1)}</strong><small>${weekday}</small></span>
    </button>`
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


if("serviceWorker" in navigator){
  window.addEventListener("load",async()=>{
    wireBuildTools();
    try{
      const reg=await navigator.serviceWorker.register("service-worker.js");

      if(reg.waiting){
        showUpdateToast();
      }

      reg.addEventListener("updatefound",()=>{
        const worker=reg.installing;
        if(!worker)return;
        worker.addEventListener("statechange",()=>{
          if(worker.state==="installed" && navigator.serviceWorker.controller){
            showUpdateToast();
          }
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange",()=>{
        window.location.reload();
      });

      // Check for a newer deployment whenever the app opens.
      reg.update().catch(()=>{});
    }catch(e){}
  });
}else{
  window.addEventListener("load",wireBuildTools);
}

window.addEventListener("load",()=>{
  let host=document.querySelector("#readinessHost");
  if(!host){
    const main=document.querySelector("main");
    if(main){
      host=document.createElement("div");
      host.id="readinessHost";
      host.innerHTML=readinessMarkup();
      main.appendChild(host);
    }
  }
  wireReleaseCandidateTools();
});

const releaseObserver=new MutationObserver(()=>{
  wireReleaseCandidateTools();
});
window.addEventListener("load",()=>{
  const root=document.querySelector("main")||document.body;
  releaseObserver.observe(root,{childList:true,subtree:true});
});

function dismissAdventureIntro(skipNextTime){
  const intro=
    document.querySelector("#introOverlay")||
    document.querySelector(".introOverlay")||
    document.querySelector(".welcomeOverlay")||
    document.querySelector("[data-intro-overlay]");
  if(intro){
    intro.classList.add("isClosing");
    intro.setAttribute("aria-hidden","true");
    setTimeout(()=>intro.remove(),220);
  }
  document.body.classList.remove("introOpen","modalOpen","noScroll");
  document.documentElement.classList.remove("introOpen","modalOpen","noScroll");
  if(skipNextTime){
    localStorage.setItem("adventureCompanionSkipIntro","true");
  }
}

function wireAdventureIntroFix(){
  document.querySelectorAll("button,a").forEach(el=>{
    const text=(el.textContent||"").trim().toLowerCase();
    if(text==="enter adventure" || text==="start adventure"){
      if(el.dataset.introFixed==="1")return;
      el.dataset.introFixed="1";
      el.addEventListener("click",()=>dismissAdventureIntro(false),{capture:true});
    }
    if(text==="skip next time" || text==="don't show this again" || text==="dont show this again"){
      if(el.dataset.introFixed==="1")return;
      el.dataset.introFixed="1";
      el.addEventListener("click",()=>dismissAdventureIntro(true),{capture:true});
    }
  });
}

window.addEventListener("load",wireAdventureIntroFix);
const introFixObserver=new MutationObserver(wireAdventureIntroFix);
window.addEventListener("load",()=>{
  introFixObserver.observe(document.body,{childList:true,subtree:true});
});

// Reliability handshake: this line is intentionally last so startup failures remain detectable.
window.AdventureReliability?.markAppReady({
  build:APP_BUILD.version,
  navigation:typeof view==="function",
  dailyAdventure:typeof showDay==="function"
});
