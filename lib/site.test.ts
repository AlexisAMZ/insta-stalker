import assert from "node:assert/strict";
import { test } from "node:test";
import { isLaunched, isPublicPath, teaserFor } from "./site.ts";

test("avant lancement : seule la page d'attente (et son API) est publique", () => {
  for (const p of ["/bientot", "/api/waitlist", "/api/waitlist/confirm", "/robots.txt", "/sitemap.xml"]) assert.equal(isPublicPath(p, false), true, p);
  for (const p of ["/", "/legal", "/dashboard", "/viewer", "/api/viewer", "/api/media", "/partage"]) assert.equal(isPublicPath(p, false), false, p);
});

test("après lancement : accueil et mentions publics, l'app reste privée", () => {
  assert.equal(isPublicPath("/", true), true);
  assert.equal(isPublicPath("/legal", true), true);
  for (const p of ["/dashboard", "/viewer", "/comparaison", "/a-degager", "/alertes", "/personne/x", "/api/viewer", "/connexion", "/partage"]) {
    assert.equal(isPublicPath(p, true), false, p);
  }
});

test("avant lancement, toute page d'un visiteur montre la page d'attente ; les API privées non", () => {
  for (const p of ["/", "/dashboard", "/legal", "/nimporte/quoi"]) assert.equal(teaserFor(p, false), "/bientot", p);
  assert.equal(teaserFor("/api/viewer", false), null);
  assert.equal(teaserFor("/dashboard", true), null);
});

test("interrupteur de lancement", () => {
  assert.equal(isLaunched({}), false);
  assert.equal(isLaunched({ SITE_LAUNCHED: "0" }), false);
  assert.equal(isLaunched({ SITE_LAUNCHED: "true" }), false);
  assert.equal(isLaunched({ SITE_LAUNCHED: "1" }), true);
});
