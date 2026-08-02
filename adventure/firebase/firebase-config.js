(function () {
"use strict";

const FIREBASE_CONFIG = Object.freeze({
  apiKey:
    "AIzaSyDdtJSz6ThAZpzEuSFzAlHaue00eDC5EsQ",
  authDomain:
    "adventure-companion-3addd.firebaseapp.com",
  projectId:
    "adventure-companion-3addd",
  storageBucket:
    "adventure-companion-3addd.firebasestorage.app",
  messagingSenderId:
    "555798612218",
  appId:
    "1:555798612218:web:59118854e8ade42c6aa143",
});

if (
  typeof module !== "undefined" &&
  module.exports
) {
  module.exports = FIREBASE_CONFIG;
}

if (typeof window !== "undefined") {
  window.ADVENTURE_FIREBASE_CONFIG =
    FIREBASE_CONFIG;
}
})();