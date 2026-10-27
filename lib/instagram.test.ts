import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedMediaUrl, isValidHandle, normalizeHandle, parseProfile, parseStories } from "./instagram.ts";

test("pseudos valides et invalides", () => {
  assert.equal(isValidHandle("lea.marchand"), true);
  assert.equal(isValidHandle("a_b.c9"), true);
  assert.equal(isValidHandle(""), false);
  assert.equal(isValidHandle("a b"), false);
  assert.equal(isValidHandle("a..b"), false);
  assert.equal(isValidHandle(".abc"), false);
  assert.equal(isValidHandle("x".repeat(31)), false);
  assert.equal(isValidHandle("a/../b"), false);
});

test("normalise @pseudo et liens de profil", () => {
  assert.equal(normalizeHandle("  @lea.m "), "lea.m");
  assert.equal(normalizeHandle("https://www.instagram.com/lea.m/?hl=fr"), "lea.m");
  assert.equal(normalizeHandle("lea.m"), "lea.m");
});

test("seuls les CDN Instagram sont autorisés", () => {
  assert.equal(isAllowedMediaUrl("https://scontent-cdg4-1.cdninstagram.com/v/t51/a.jpg"), true);
  assert.equal(isAllowedMediaUrl("https://scontent.fbcdn.net/x.mp4"), true);
  assert.equal(isAllowedMediaUrl("http://scontent.cdninstagram.com/a.jpg"), false);
  assert.equal(isAllowedMediaUrl("https://evil.com/cdninstagram.com"), false);
  assert.equal(isAllowedMediaUrl("https://cdninstagram.com.evil.com/a.jpg"), false);
  assert.equal(isAllowedMediaUrl("pas une url"), false);
});

test("profil public", () => {
  const p = parseProfile({
    data: { user: { id: "1", username: "demo", full_name: "Démo", biography: "hello", is_private: false, is_verified: true, profile_pic_url_hd: "https://a.cdninstagram.com/hd.jpg", edge_followed_by: { count: 12 }, edge_follow: { count: 3 }, edge_owner_to_timeline_media: { count: 7 } } },
  });
  assert.deepEqual(p, { id: "1", username: "demo", fullName: "Démo", bio: "hello", isPrivate: false, isVerified: true, picHd: "https://a.cdninstagram.com/hd.jpg", followers: 12, following: 3, posts: 7 });
});

test("profil privé et réponses invalides", () => {
  assert.equal(parseProfile({ data: { user: { username: "x", is_private: true } } })?.isPrivate, true);
  assert.equal(parseProfile({ data: { user: null } }), null);
  assert.equal(parseProfile(null), null);
  assert.equal(parseProfile("nope"), null);
});

test("stories image et vidéo", () => {
  const s = parseStories({
    reels_media: [{ items: [
      { pk: "10", taken_at: 100, image_versions2: { candidates: [{ url: "https://a.cdninstagram.com/i.jpg" }] } },
      { pk: 11, taken_at: 200, image_versions2: { candidates: [{ url: "https://a.cdninstagram.com/p.jpg" }] }, video_versions: [{ url: "https://a.cdninstagram.com/v.mp4" }] },
      { pk: "12" },
    ] }],
  });
  assert.equal(s.length, 2);
  assert.deepEqual(s[0], { id: "10", kind: "image", url: "https://a.cdninstagram.com/i.jpg", poster: "https://a.cdninstagram.com/i.jpg", takenAt: 100 });
  assert.equal(s[1].kind, "video");
  assert.equal(s[1].poster, "https://a.cdninstagram.com/p.jpg");
});

test("stories : forme reels{} et vide", () => {
  assert.equal(parseStories({ reels: { "1": { items: [{ id: "a", image_versions2: { candidates: [{ url: "https://x.fbcdn.net/a.jpg" }] } }] } } }).length, 1);
  assert.deepEqual(parseStories({ reels_media: [] }), []);
  assert.deepEqual(parseStories(undefined), []);
});
