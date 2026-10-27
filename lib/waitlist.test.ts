import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanSource, isValidEmail, normalizeEmail, parseOffset, visibleCount } from "./waitlist.ts";

test("e-mails valides", () => {
  for (const e of ["a@b.co", "lea.m+snap@gmail.com", "  Lea@Mail.FR "]) assert.equal(isValidEmail(e), true, e);
});

test("e-mails invalides", () => {
  for (const e of ["", "a", "a@b", "a@@b.co", "a b@c.co", "a@b..co", "@b.co", "a@.co", `${"x".repeat(250)}@b.co`]) {
    assert.equal(isValidEmail(e), false, e);
  }
});

test("normalisation et source", () => {
  assert.equal(normalizeEmail("  Lea@Mail.FR "), "lea@mail.fr");
  assert.equal(cleanSource("Snapchat"), "snapchat");
  assert.equal(cleanSource("a b<script>"), "abscript");
  assert.equal(cleanSource("x".repeat(80)).length, 32);
  assert.equal(cleanSource(undefined), "");
});

test("décalage et seuil d'affichage du compteur", () => {
  assert.equal(parseOffset("13"), 13);
  for (const bad of [undefined, "", "abc", "-4", "0"]) assert.equal(parseOffset(bad), 0, String(bad));
  assert.equal(parseOffset("999999999"), 100_000);
  assert.equal(visibleCount(0, 13), 13);
  assert.equal(visibleCount(2, 13), 15);
  assert.equal(visibleCount(1, 0), null);
  assert.equal(visibleCount(4, 0), null);
  assert.equal(visibleCount(5, 0), 5);
});
