(function(root,factory){
  "use strict";
  const build=factory();
  root.AdventureCompanionBuild=build;
  if(typeof module==="object"&&module.exports)module.exports=build;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const build=Object.freeze({
    version:"M3-05.0B",
    milestone:"Milestone 3",
    feature:"Architecture & Version Foundation",
    build:"Build 1",
    updated:"July 22, 2026",
    cache:"adventure-companion-m3-05-0b-build-1",
    eyebrow:"M3-05.0B · ARCHITECTURE & VERSION FOUNDATION",
    description:"Centralized build information creates one reliable source of truth for the application, diagnostics, and offline cache."
  });

  function applyToDocument(doc){
    if(!doc)return;
    const buildMeta=doc.querySelector('meta[name="adventure-companion-build"]');
    const dateMeta=doc.querySelector('meta[name="adventure-companion-build-date"]');
    if(buildMeta)buildMeta.content=build.version;
    if(dateMeta)dateMeta.content=build.updated;
    doc.querySelectorAll("[data-build-field]").forEach(node=>{
      const value=build[node.dataset.buildField];
      if(value!==undefined)node.textContent=value;
    });
  }

  if(typeof document!=="undefined"){
    applyToDocument(document);
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>applyToDocument(document),{once:true});
  }

  return Object.freeze({...build,applyToDocument});
});
