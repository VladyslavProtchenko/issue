# Flamingo — Frontend Engineer Take-Home

## Issue Tracker

Build a minimal issue tracker. The domain is simple by design — we want to see how you think, not how fast you type.

---

## Tech Stack

| Layer | Technology |
| :---- | :---- |
| Framework | Next.js 14+ (App Router) |
| Data layer | Relay \+ Supabase GraphQL (pg\_graphql) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Validation | Zod |

---

## Backend

Use Supabase (free tier). Enable pg\_graphql in **Dashboard → Database → Extensions** to get a GraphQL API generated from your schema.

### Database schema

*\-- core*  
users       (**id** uuid PK, name text, avatar\_url text)  
issues      (**id** uuid PK, title text, description text, status text, priority text, assignee\_id uuid FK, created\_at timestamptz)  
comments    (**id** uuid PK, issue\_id uuid FK, **body** text, author\_id uuid FK, created\_at timestamptz)

*\-- labels (many-to-many)*  
labels       (**id** uuid PK, name text, color text)  
issue\_labels (issue\_id uuid FK, label\_id uuid FK, PK (issue\_id, label\_id))

You may extend or adjust column types, but the above tables and relationships must exist.

---

## Requirements

### Issue List

* Filter by **status**, **priority**, and **labels** (multi-select)

* **Cursor-based pagination** using Relay connection spec

* **Optimistic update** on status change — the UI must update instantly and **reconcile gracefully** if the server rejects the mutation (e.g., revert with a toast, not a silent failure)

### Issue Detail

* Edit title, description, status, priority, assignee, labels

* **Comment thread** with cursor-based pagination

* Each section of the detail page must use a **Relay fragment co-located with its component** — no monolithic top-level queries

### Real-Time

* Issue list must reflect changes from other users without a manual refresh

* Use **Supabase Realtime** (preferred) or short polling with manual Relay store updates (commitLocalUpdate / environment.getStore())

### Relay Compiler & pg\_graphql

pg\_graphql generates a schema with its own conventions (\*Collection types, nodeId, etc.). The Relay compiler does not work with this out of the box.

**Document your approach** to making Relay compiler and pg\_graphql work together in the README. This is one of the most important parts of the assessment.

---

## README

Your README must include:

1. **Setup instructions** — clone, install, configure Supabase, run

2. **Relay \+ pg\_graphql configuration** — how you made them work together and what problems you hit

3. **Architecture decisions** — why you structured things the way you did

4. **Trade-offs** — what you’d do differently with more time

If you run out of time, describe what you would have done. That counts too.

---

## Submission

* Private GitHub repo with access granted to **Oleksandra**

* Deployed on **Vercel** (free tier)

* This project is a reflection of you as an engineer. If you see an opportunity to add something beyond the requirements — a better UX pattern, a smarter architectural choice, a detail that shows craft — go for it. We value taste and initiative.

---

Questions? Reach out to Oleksandra. Good luck\!

