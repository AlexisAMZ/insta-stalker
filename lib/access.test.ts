import assert from "node:assert/strict";
import { test } from "node:test";
import { configuredPassword, expectedToken, passwordMatches, safeNext, timingSafeEqual } from "./access.ts";

test("en production, sans AMZ_PASSWORD l'accès reste fermé", async () => {
  assert.equal(configuredPassword({ NODE_ENV: "production" }), null);
  assert.equal(await expectedToken({ NODE_ENV: "production" }), null);
  assert.equal(await passwordMatches("dev-password", { NODE_ENV: "production" }), false);
  assert.equal(configuredPassword({ NODE_ENV: "production", AMZ_PASSWORD: "x" }), "x");
});

test("le jeton dépend du secret, pas seulement du mot de passe", async () => {
  const a = await expectedToken({ AMZ_PASSWORD: "p", AMZ_SECRET: "s1" });
  const b = await expectedToken({ AMZ_PASSWORD: "p", AMZ_SECRET: "s2" });
  const c = await expectedToken({ AMZ_PASSWORD: "p", AMZ_SECRET: "s1" });
  assert.notEqual(a, b);
  assert.equal(a, c);
  assert.match(a ?? "", /^[0-9a-f]{64}$/);
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
