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
    version:"M4-03",
    milestone:"Milestone 4",
    feature:"Adventure Invitations & Adventure-Aware Access",
    build:"Build 1",
    updated:"September 1, 2026",
    cache:"adventure-companion-m4-03-build-1",
    eyebrow:"M4-03 · ADVENTURE INVITATIONS & ADVENTURE-AWARE ACCESS",
      description:
        "Adventure Companion now includes the trusted invitation and Adventure-aware access foundation while keeping the new access experience safely disabled for this production checkpoint."
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
