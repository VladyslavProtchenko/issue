# Code Review & Gap Analysis

## Requirements Checklist

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | Filter by status, priority, labels (multi-select) | DONE | `IssueFilters.tsx` + `filters.ts` |
| 2 | Cursor-based pagination (Relay connection spec) | DONE | `usePaginationFragment` + `useInfiniteScroll` |
| 3 | **Optimistic update on status change IN THE LIST** | **MISSING** | Status only editable on detail page, not inline in list |
| 4 | Edit title | DONE | `IssueHeader.tsx` + Zod validation |
| 5 | Edit description | DONE | `IssueBody.tsx` + Zod validation |
| 6 | Edit status/priority/assignee | DONE | `IssueSidebar.tsx` with optimistic responses |
| 7 | Edit labels | DONE | `IssueLabels.tsx` with ConnectionHandler |
| 8 | Comment thread with cursor pagination | DONE | `CommentThread.tsx` with `usePaginationFragment` |
| 9 | Fragment co-location | DONE | Every detail component has its own fragment |
| 10 | Real-time updates (Supabase Realtime) | DONE | `useRealtimeIssues` + `useRealtimeComments` + `useLabels` |
| 11 | Relay + pg_graphql documented in README | **MISSING** | README is default Next.js boilerplate |
| 12 | Setup instructions in README | **MISSING** | — |
| 13 | Architecture decisions in README | **MISSING** | — |
| 14 | Trade-offs in README | **MISSING** | — |
| 15 | Vercel deploy | **TODO** | — |
| 16 | Private GitHub repo + access for Oleksandra | **TODO** | — |

---

## Critical Issues (must fix)

### 1. No inline status change in Issue List

The test task says: _"Optimistic update on status change — the UI must update instantly and reconcile gracefully if the server rejects the mutation"_ — this is under **Issue List**, not Issue Detail.

Currently `IssueListContent.tsx` only displays status as a Badge — it's not clickable, not editable. The user must navigate to the detail page to change status.

**Fix:** Add an inline status dropdown (or clickable badge) in each row/card of `IssueListContent.tsx` with a `useMutation` + `optimisticResponse` + `onError` toast. Prevent row click navigation when interacting with the dropdown.

### 2. README is empty

The default Create Next App README is still in place. The test task explicitly says README is _"one of the most important parts of the assessment"_.

**Fix:** Write README with all 4 required sections (setup, Relay+pg_graphql, architecture, trade-offs).

### 3. No deploy / no repo

Project is not deployed to Vercel and no private GitHub repo exists.

**Fix:** Create private repo, deploy to Vercel, grant access to Oleksandra.

---

## Important Issues (should fix)

### 4. No Zod validation for status/priority changes

`IssueSidebar.tsx` casts values with `as issue_status` / `as issue_priority` without Zod validation. Title and description are validated, but status/priority are not.

**Fix:** Add `issueStatusSchema` and `issuePrioritySchema` to `validation.ts` and validate before committing mutations.

### 5. No optimistic update for new comments

`CommentComposer.tsx` uses `useMutation` but without `optimisticResponse` or `optimisticUpdater`. Comment only appears after server response.

**Fix:** Add optimistic updater that creates a temporary comment record and inserts it into the connection immediately.

### 6. `Record<string, unknown>` instead of proper GraphQL filter type

`IssueList.tsx` and `page.tsx` use `Record<string, unknown>` for the filter parameter. This works but loses type safety.

**Fix:** Generate or manually define a proper `IssuesFilter` type matching the GraphQL schema.

---

## Minor Issues (nice to fix)

### 7. No `.env.example` documentation

`.env.example` exists but has no comments explaining where to get the values.

### 8. No loading skeleton / Suspense boundary

Components use `useLazyLoadQuery` which requires Suspense, but there's no visible skeleton or spinner — just a blank screen during initial load.

### 9. Implementation plan diverges from actual code

- Plan describes `src/` directory but code lives in `app/`
- Plan mentions `StatusSelect.tsx` component — it doesn't exist
- Plan mentions `commitLocalUpdate` approach — actual implementation uses `fetchQuery`
- Plan mentions `useMutationWithToast.ts` hook — it doesn't exist

Not a code problem, but the plan should either be updated or removed before submission.

---

## What's Done Well

- **Relay + pg_graphql integration** is correct (`nodeInterfaceIdField`, `getDataID`, custom scalars)
- **Fragment co-location** is clean — every detail component owns its data
- **Real-time architecture** is solid — `fetchQuery` approach in RelayProvider ensures store consistency
- **Optimistic updates** on detail page (status, priority, assignee, labels) all work with proper error handling
- **Mobile responsive design** with card layout for mobile, table for desktop
- **No `any` types** in source code (only in generated files)
- **Clean component structure** — good separation of concerns
