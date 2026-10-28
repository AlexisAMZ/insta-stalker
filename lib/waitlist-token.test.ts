import assert from "node:assert/strict";
import { test } from "node:test";
import { CONFIRM_TTL_MS, confirmToken, verifyConfirmToken } from "./waitlist-token.ts";

const ENV = { NODE_ENV: "production", AMZ_PASSWORD: "p", AMZ_SECRET: "s".repeat(40) };

test("le jeton de confirmation est lié à l'adresse et expire", async () => {
  const now = 5_000_000;
  const t = await confirmToken("a@b.co", ENV, now);
  assert.ok(t);
  assert.equal(await verifyConfirmToken("a@b.co", t, ENV, now + 1000), true);
  assert.equal(await verifyConfirmToken("autre@b.co", t, ENV, now + 1000), false); // autre adresse
  assert.equal(await verifyConfirmToken("a@b.co", t, ENV, now + CONFIRM_TTL_MS + 1), false); // expiré
  assert.equal(await verifyConfirmToken("a@b.co", `${now + 9e9}.${t.split(".")[1]}`, ENV, now), false); // exp falsifiée
  for (const bad of ["", "x", "1.2.3"]) assert.equal(await verifyConfirmToken("a@b.co", bad, ENV, now), false, bad);
});

test("sans secret solide en production, aucun jeton n'est émis", async () => {
  assert.equal(await confirmToken("a@b.co", { NODE_ENV: "production" }), null);
  assert.equal(await verifyConfirmToken("a@b.co", "1.2", { NODE_ENV: "production" }), false);
});
