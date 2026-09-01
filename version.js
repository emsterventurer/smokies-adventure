(function(root,factory){
  "use strict";

  const build=factory();

  root.AdventureCompanionBuild=build;

  if(
    typeof module==="object" &&
    module.exports
  ){
    module.exports=build;
  }
})(
  typeof globalThis!=="undefined"
    ? globalThis
    : this,
  function(){
    "use strict";

    const build=Object.freeze({
    version:"M4-02.4",
    milestone:"Milestone 4",
    feature:"Pacific Coast Castle Rock & Carolyn Traveler",
    build:"Build 1",
    updated:"September 1, 2026",
    cache:"adventure-companion-m4-02-4-build-1",
    eyebrow:"M4-02.4 · PACIFIC COAST CASTLE ROCK & CAROLYN TRAVELER",
      description:
        "Adventure Companion now includes Castle Rock and Carolyn in the Pacific Coast experience, with reviewed drive estimates and preservation-first upgrades while preserving Smokies."
    });

    function applyToDocument(doc){
      if(!doc){
        return;
      }

      const buildMeta=
        doc.querySelector(
          'meta[name="adventure-companion-build"]'
        );

      const dateMeta=
        doc.querySelector(
          'meta[name="adventure-companion-build-date"]'
        );

      if(buildMeta){
        buildMeta.content=build.version;
      }

      if(dateMeta){
        dateMeta.content=build.updated;
      }

      doc
        .querySelectorAll(
          "[data-build-field]"
        )
        .forEach(node=>{
          const value=
            build[
              node.dataset.buildField
            ];

          if(value!==undefined){
            node.textContent=value;
          }
        });
    }

    if(
      typeof document!=="undefined"
    ){
      applyToDocument(document);

      if(
        document.readyState==="loading"
      ){
        document.addEventListener(
          "DOMContentLoaded",
          ()=>applyToDocument(document),
          {once:true}
        );
      }
    }

    return Object.freeze({
      ...build,
      applyToDocument
    });
  }
);
