import assert from "node:assert/strict";
import { test } from "node:test";
import { configuredPassword, configuredSecret, issueToken, passwordMatches, safeNext, timingSafeEqual, verifyToken } from "./access.ts";

const SECRET = "s".repeat(40);
const PROD = { NODE_ENV: "production", AMZ_PASSWORD: "p", AMZ_SECRET: SECRET };

test("en production, sans mot de passe ni secret solide l'accès reste fermé", async () => {
  assert.equal(configuredPassword({ NODE_ENV: "production" }), null);
  assert.equal(await issueToken({ NODE_ENV: "production" }), null);
  assert.equal(await passwordMatches("dev-password", { NODE_ENV: "production" }), false);
  assert.equal(configuredPassword({ NODE_ENV: "production", AMZ_PASSWORD: "x" }), "x");
  // secret absent, trop court, ou identique au mot de passe
  assert.equal(await issueToken({ NODE_ENV: "production", AMZ_PASSWORD: "p" }), null);
  assert.equal(await issueToken({ ...PROD, AMZ_SECRET: "court" }), null);
  assert.equal(configuredSecret({ ...PROD, AMZ_PASSWORD: SECRET }), null);
});

test("jeton signé : valide, expiré, falsifié, autre secret", async () => {
  const now = 1_000_000;
  const token = await issueToken(PROD, now, 5_000);
  assert.ok(token);
  assert.equal(await verifyToken(token, PROD, now + 1_000), true);
  assert.equal(await verifyToken(token, PROD, now + 5_001), false); // expiré côté serveur
  const [exp, nonce, sig] = token.split(".");
  assert.equal(await verifyToken(`${Number(exp) + 10_000_000}.${nonce}.${sig}`, PROD, now), false); // exp prolongée
  assert.equal(await verifyToken(`${exp}.${nonce}.${"0".repeat(64)}`, PROD, now), false);
  assert.equal(await verifyToken(token, { ...PROD, AMZ_SECRET: "t".repeat(40) }, now), false);
  for (const bad of [undefined, "", "a.b", "a.b.c.d", "x.y.z"]) assert.equal(await verifyToken(bad, PROD, now), false, String(bad));
  assert.notEqual(token, await issueToken(PROD, now, 5_000)); // chaque session a son propre jeton
});

test("comparaison du mot de passe", async () => {
  const env = { AMZ_PASSWORD: "bon mot de passe" };
  assert.equal(await passwordMatches("bon mot de passe", env), true);
  assert.equal(await passwordMatches("bon mot de passe ", env), false);
  assert.equal(await passwordMatches("", env), false);
  assert.equal(timingSafeEqual("abc", "abc"), true);
  assert.equal(timingSafeEqual("abc", "abd"), false);
  assert.equal(timingSafeEqual("abc", "ab"), false);
});

test("redirection : chemins internes seulement", () => {
  assert.equal(safeNext("/dashboard?x=1"), "/dashboard?x=1");
  for (const bad of ["//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "/a\nb", "evil", "", null, undefined, "/\t/evil.com"]) {
    assert.equal(safeNext(bad), "/", String(bad));
  }
});
