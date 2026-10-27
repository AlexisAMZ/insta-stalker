import assert from "node:assert/strict";
import { test } from "node:test";
import { isLaunched, isPublicPath } from "./site.ts";

test("avant lancement : seules la page d'attente, les mentions et l'inscription sont publiques", () => {
  for (const p of ["/bientot", "/legal", "/api/waitlist", "/robots.txt", "/sitemap.xml"]) assert.equal(isPublicPath(p, false), true, p);
  for (const p of ["/", "/dashboard", "/viewer", "/api/viewer", "/api/media", "/partage"]) assert.equal(isPublicPath(p, false), false, p);
});

test("après lancement : l'accueil devient public, l'app reste privée", () => {
  assert.equal(isPublicPath("/", true), true);
  for (const p of ["/dashboard", "/viewer", "/comparaison", "/a-degager", "/alertes", "/personne/x", "/api/viewer", "/connexion", "/partage"]) {
    assert.equal(isPublicPath(p, true), false, p);
  }
});

test("interrupteur de lancement", () => {
  assert.equal(isLaunched({}), false);
  assert.equal(isLaunched({ SITE_LAUNCHED: "0" }), false);
  assert.equal(isLaunched({ SITE_LAUNCHED: "true" }), false);
  assert.equal(isLaunched({ SITE_LAUNCHED: "1" }), true);
});
