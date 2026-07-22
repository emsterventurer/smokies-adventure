(function(root,factory){
  "use strict";
  const config=factory();
  root.AdventureCompanionConfig=config;
  if(typeof module==="object"&&module.exports)module.exports=config;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const config={
    trip:{
      start:"2026-08-07T00:00:00",
      end:"2026-08-15T00:00:00",
      planningStart:"2026-07-01T00:00:00",
      timezone:"America/New_York",
      locationLabel:"Sevierville / Smoky Mountains",
      coordinates:Object.freeze({latitude:35.8681,longitude:-83.5618})
    },
    weather:{
      freshMs:60*60*1000,
      staleMs:6*60*60*1000,
      maxMs:24*60*60*1000,
      cacheKey:"adventureCompanionWeatherM3031",
      tripCacheKey:"adventureCompanionTripWeatherM3042"
    },
    reliability:{
      startupTimeoutMs:3500,
      smartStopsGraceMs:2200,
      buttonResetMs:1600
    },
    ui:{
      panelCloseMs:220,
      toastCloseMs:250,
      feedbackCloseMs:800,
      splashHideMs:900,
      splashRemoveMs:1600
    },
    storage:{
      feedback:"adventureCompanionFeedback",
      packing:"adventureCompanionPackingM3041",
      packingCelebrated:"adventureCompanionPackingCelebratedM3044B",
      campfireUnlocked:"adventureCompanionCampfireUnlocked",
      individualCelebrations:"adventureCompanionIndividualCelebrationsM3044C",
      familyCelebration:"adventureCompanionFamilyCelebrationM3044C"
    },
    features:{
      diagnostics:true,
      weather:true,
      packingCelebrations:true
    }
  };

  Object.values(config).forEach(section=>Object.freeze(section));
  return Object.freeze(config);
});
