# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router). The site lives at the repo root (Vercel-ready); the console scripts and Python CLI live in `cli/`. First phase is a static mockup with sample data; real functionality is wired later.

## Users

The general public tracking **their own** account: someone who wants to know who followed them, who unfollowed them, and who they stopped following, on Instagram and Snapchat. Not aimed at monitoring other people.

## Product Purpose

AMZ Tracker turns the existing Instagram Followers Tracker (console capture + diff) into a website anyone can use: take a snapshot of your followers/following, take another later, and see exactly who arrived and who left. Success means a non-technical person gets their first diff without touching a terminal.

## Positioning

Snapshot-and-diff, read-only: the tool only reads lists you can already see, never follows, likes or messages, and keeps captures on your side. The output is names, not vanity metrics.

## Operating Context

- Instagram: followers ("abonnés") and following ("abonnements") lists, captured from the user's own logged-in session.
- Snapchat: shown at parity in the mockup (friends added / removed). How Snap data is actually obtained is an open product decision.
- Captures are dated `.txt` files, one `@username` per line; comparisons diff two captures.
- Quality check: the profile's announced count vs. lines loaded; nameless lines are deleted/deactivated accounts, not movement.

## Capabilities and Constraints

- Confirmed (existing code): capture both lists, compare against a previous capture, history across captures, downloadable reports.
- Read-only by design; rate limits mean captures take minutes for thousands of accounts.
- Open: real Snapchat data source, accounts/auth, where captures are stored for the hosted site, pricing (none decided — do not invent).

## Brand Commitments

- Name: **AMZ Tracker**, shown with Instagram and Snapchat marks (user-specified).
- Language: French UI copy.

## Evidence on Hand

- No testimonials, user counts, press or pricing exist. Do not fabricate them.
- Mock data in `tests/mock/` (137 simulated accounts) can inspire sample data.

## Product Principles

1. Names over numbers: the value is *who* moved, not a vanity counter.
2. Read-only and honest: say plainly what the tool does and does not do.
3. Two captures to first insight: everything serves the first diff.
4. Explain gaps: a missing count is deactivated accounts, not a bug — say so.
