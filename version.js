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
    version:"M4-01",
    milestone:"Milestone 4",
    feature:"Adventure Switcher",
    build:"Build 1",
    updated:"August 30, 2026",
    cache:"adventure-companion-m4-01-build-1",
    eyebrow:"M4-01 · ADVENTURE SWITCHER",
      description:
        "Adventure Companion now supports switching between durable Adventures while preserving the complete Smokies experience and safely preparing Pacific Coast 2026 for future planning."
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
