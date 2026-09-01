const fs = require("fs");
const test = require("node:test");
const assert = require("node:assert/strict");

const html = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

test("Welcome is Adventure-neutral while preserving its auth and identity controls", () => {
  assert.match(html, /OUR FAMILY ADVENTURES/);
  assert.match(html, /Where will our next adventure take us\?/);
  assert.match(
    html,
    /Adventure Companion keeps our plans, reservations,[\s\S]*routes, and shared moments together—one adventure at a time\./,
  );
  assert.match(html, /<legend>Who are you\?<\/legend>/);
  assert.match(
    html,
    /Choose your name so Adventure Companion knows who is joining\./,
  );
  assert.doesNotMatch(html, /The Smokies are calling\./);
  assert.doesNotMatch(html, /Eight days to explore, eat well, laugh often/);

  for (const id of [
    "welcomeModal",
    "welcomeIdentityChoices",
    "googleSignIn",
    "enterAdventure",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }

  assert.match(app, /async function setupWelcome\(\)/);
  assert.match(app, /globalThis\.AdventurerIdentity/);
  assert.match(app, /firebase\.signInWithGoogle\(\)/);
  assert.match(app, /"Enter Adventure Companion"/);
});

test("Welcome remains scrollable and safe-area aware on small viewports", () => {
  assert.match(
    styles,
    /\.welcomeModal\s*\{[^}]*overflow-y:\s*auto;/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 520px\)[\s\S]*?\.welcomeModal\s*\{[^}]*place-items:\s*start center;[^}]*safe-area-inset-top[^}]*safe-area-inset-bottom/s,
  );
  assert.match(styles, /scroll-padding-bottom:[^;]*safe-area-inset-bottom/);

  const welcomeRules = [...styles.matchAll(/\.welcome(?:Modal|Sheet)\s*\{([^}]*)\}/g)]
    .map((match) => match[1])
    .join("\n");
  assert.doesNotMatch(welcomeRules, /(?:height|min-height):\s*100vh/);
});

test("Welcome identity cards align without inventing relationship labels", () => {
  assert.match(
    styles,
    /\.welcomeIdentityChoice\s*\{[^}]*display:\s*flex;[^}]*min-height:\s*72px;[^}]*flex-direction:\s*column;[^}]*justify-content:\s*center;/s,
  );
  assert.match(
    app,
    /adventurer\.relationshipLabel\s*\?[\s\S]*?<small>[\s\S]*?adventurer\.relationshipLabel[\s\S]*?:\s*""/,
  );
});

test("mobile System diagnostics remain scrollable and dismissible", () => {
  assert.match(
    styles,
    /\.buildPanel,[\s\S]*?overflow:\s*auto;/,
  );
  assert.match(
    styles,
    /\.buildPanel\s*\{[^}]*max-height:\s*calc\(100dvh[^}]*overscroll-behavior:\s*contain;/s,
  );
  assert.match(
    styles,
    /\.buildPanel \.panelHeader\s*\{[^}]*position:\s*sticky;[^}]*top:/s,
  );
  assert.match(html, /id="closeBuildPanel"[^>]*aria-label="Close"/);
  assert.match(
    app,
    /#closeBuildPanel"\)\?\.addEventListener\("click",\(\)=>closePanel\(buildPanel\)\)/,
  );
});
