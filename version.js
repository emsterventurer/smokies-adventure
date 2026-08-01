(function(root,factory){
  "use strict";
  const build=factory();
  root.AdventureCompanionBuild=build;
  if(typeof module==="object"&&module.exports)module.exports=build;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

    const build=Object.freeze({
  version:"M3-07.1",
  milestone:"Milestone 3",
  feature:"Durable Adventure Data",
  build:"Build 1",
  updated:"August 1, 2026",
  cache:"adventure-companion-m3-07-1-build-1",
  eyebrow:"M3-07.1 · DURABLE ADVENTURE DATA",
  description:"Durable Adventure Records, the Adventure Book, intelligent memory title suggestions, and persistent photo storage work together to preserve family stories across browser sessions."
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
