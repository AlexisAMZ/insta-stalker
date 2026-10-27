import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanSource, isValidEmail, normalizeEmail } from "./waitlist.ts";

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
