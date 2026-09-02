(function(root,factory){
  "use strict";
  const api=factory();
  root.AdventureCompanionServiceWorkerUpdate=api;
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root.document&&root.navigator?.serviceWorker){
    api.installBrowserFlow(root);
  }
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  function createController({reload,hideBanner}){
    let reloadStarted=false;

    return Object.freeze({
      requestActivation(registration){
        const waiting=registration?.waiting;
        if(!waiting)return false;
        waiting.postMessage({type:"SKIP_WAITING"});
        return true;
      },

      handleControllerChange(){
        if(reloadStarted)return false;
        reloadStarted=true;
        hideBanner();
        reload();
        return true;
      }
    });
  }

  function installBrowserFlow(root){
    const controller=createController({
      reload:()=>root.location.reload(),
      hideBanner:()=>root.hideUpdateToast?.()
    });
    const refreshButton=root.document.querySelector("#refreshApp");

    refreshButton?.addEventListener("click",async event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      try{
        const registration=
          await root.navigator.serviceWorker.getRegistration();
        if(!controller.requestActivation(registration)){
          root.hideUpdateToast?.();
        }
      }catch(error){
        root.hideUpdateToast?.();
      }
    },true);

    root.navigator.serviceWorker.addEventListener(
      "controllerchange",
      ()=>controller.handleControllerChange()
    );

    return controller;
  }

  return Object.freeze({createController,installBrowserFlow});
});
