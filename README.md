# Issues Tracker

🇺🇦 [Українська](#issues-tracker) · 🇬🇧 [English](#issues-tracker-1)

---

## Технологічний стек

1. **Next.js 16** — App Router, всі Relay компоненти є `"use client"`
2. **Relay** — отримання даних, fragment co-location, оптимістичні оновлення, cursor pagination
3. **Supabase** — PostgreSQL база даних, pg_graphql (автогенерований GraphQL API), Auth, Realtime
4. **TypeScript** — strict mode, без `any`
5. **Tailwind CSS** — utility-first стилізація
6. **Zod** — валідація заголовку, опису, коментарів
7. **Sonner** — toast-сповіщення про помилки мутацій

---

## Структура папок

```
app/
├── __generated__/          # Relay compiler output (auto-generated)
├── components/
│   ├── issues/
│   │   ├── IssueList.tsx         # useLazyLoadQuery — top-level query
│   │   ├── IssueListContent.tsx  # usePaginationFragment — infinite scroll
│   │   ├── IssueFilters.tsx      # status / priority / label multi-select
│   │   ├── IssueHeader.tsx       # useFragment — editable title
│   │   ├── IssueBody.tsx         # useFragment — editable description
│   │   ├── IssueSidebar.tsx      # useFragment — status, priority, assignee
│   │   └── IssueLabels.tsx       # useFragment — add / remove labels
│   ├── comments/
│   │   ├── CommentThread.tsx     # usePaginationFragment
│   │   ├── CommentItem.tsx       # useFragment
│   │   └── CommentComposer.tsx   # new comment form with Zod validation
│   └── AuthDialog.tsx            # login / register modal
├── hooks/
│   ├── useRealtimeIssues.ts      # Supabase Realtime → Relay store (issues + labels)
│   ├── useRealtimeComments.ts    # Supabase Realtime → Relay store (comments)
│   ├── useLabels.ts              # labels list with realtime sync
│   ├── useCurrentUser.ts         # Supabase Auth state
│   └── useInfiniteScroll.ts      # IntersectionObserver for pagination
├── lib/
│   ├── relay/
│   │   ├── environment.ts        # Relay Environment + fetchFn
│   │   └── RelayProvider.tsx     # RelayEnvironmentProvider + realtime subscriptions
│   ├── supabase/client.ts        # Supabase client singleton
│   ├── constants.ts              # STATUS_LABEL, STATUS_CLASS, PRIORITY_LABEL
│   ├── filters.ts                # buildIssuesFilter(IssueFiltersValue) → issuesFilter
│   └── validation.ts             # Zod schemas
├── issues/[id]/
│   ├── page.tsx                  # Issue detail page
│   └── IssueDetail.tsx           # Layout + top-level query for detail
└── page.tsx                      # Issue list page
scripts/
└── fetch-schema.ts               # Introspection → schema.graphql
supabase/
└── migrations/                   # All DB migrations
```

---

## Функціональність

### Issue List

1. **Multi-select filters** — фільтрація за статусом, пріоритетом та мітками через дропдауни; фільтр по мітках спочатку резолвить `issue_id` через Supabase client, потім передає до GraphQL
2. **Cursor-based pagination** — нескінченний скрол через `usePaginationFragment` з `@connection` + `@refetchable`; завантажує по 10 елементів
   ```graphql
   fragment IssueListContent_query on Query
     @refetchable(queryName: "IssueListContentPaginationQuery")
     @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, after: { type: "Cursor" }, filter: { type: "issuesFilter" }) {
     issuesCollection(first: $first, after: $after, filter: $filter, orderBy: [{ created_at: DescNullsLast }])
       @connection(key: "IssueListContent_issuesCollection") { ... }
   }
   ```
3. **Inline status change with optimistic update** — клік по бейджу статусу відкриває дропдаун; UI оновлюється миттєво через `optimisticResponse`, автоматично відкочується з toast при помилці

### Issue Detail

5. **Editable title** — інлайн редагування по кліку, валідація Zod (`min 1, max 200`), оптимістичне оновлення
6. **Editable description** — textarea редагування, валідація Zod (`max 5000`), оптимістичне оновлення
7. **Status / priority / assignee selects** — дропдаун селекти в сайдбарі, всі з `optimisticResponse` + toast при помилці
8. **Label management** — додавання/видалення міток через `ConnectionHandler` для миттєвого оновлення UI
   ```graphql
   mutation IssueLabelsAddMutation($issueId: UUID!, $labelId: UUID!) {
     insertIntoissue_labelsCollection(objects: [{ issue_id: $issueId, label_id: $labelId }]) {
       records { nodeId labels { id nodeId name color } }
     }
   }
   ```
9. **Fragment co-location** — кожна секція володіє своїми даними: `IssueHeader_issue`, `IssueBody_issue`, `IssueSidebar_issue`, `IssueLabels_issue`, `CommentThread_issue`, `CommentItem_comment`
10. **Comment thread with pagination** — `usePaginationFragment` з кнопкою "Load more", відсортовано від найновіших
11. **Comment composer** — валідація Zod (`min 1, max 2000`), задізейблена під час запиту

### Real-Time

12. **Issue updates** — Supabase Realtime `UPDATE` на таблиці `issues` тригерить `fetchQuery` для оновлення задачі в Relay store
13. **Label changes in list** — Supabase Realtime `INSERT/DELETE` на таблиці `issue_labels` тригерить `fetchQuery` щоб бейджі міток оновлювались без навігації
14. **New comments** — Supabase Realtime `INSERT` на таблиці `comments` оновлює connection через `commitLocalUpdate` + інкрементує `totalCount`
15. **Label definitions** — Supabase Realtime `INSERT/UPDATE/DELETE` на таблиці `labels` синхронізує список міток через хук `useLabels`

---

## Relay + pg_graphql

pg_graphql генерує нестандартну схему: використовує `nodeId` (base64-encoded) замість `id` для Node interface, а типи називає `issuesCollection`, `issuesEdge` тощо.

Два налаштування дозволяють Relay працювати з цим:

**1. `relay.config.js`** — вказати компілятору використовувати `nodeId` як глобальний ID:
```js
schemaConfig: {
  nodeInterfaceIdField: 'nodeId',
  nodeInterfaceIdVariableName: 'nodeId',
}
```

**2. `environment.ts`** — вказати Relay store ключувати записи по `nodeId`:
```ts
getDataID: (node) => node.nodeId
```

Без обох налаштувань Relay за замовчуванням використовує `id` і не може нормалізувати записи між запитами.

**Custom scalars** — pg_graphql експонує `UUID`, `Datetime`, `Cursor` тощо як custom scalars. Замаплені на `string` у relay.config.js щоб компілятор генерував коректні TypeScript типи.

**Інтроспекція схеми** — `scripts/fetch-schema.ts` завантажує SDL з GraphQL endpoint Supabase і записує `schema.graphql`. Це джерело правди для Relay компілятора. Перезапускати після кожної зміни схеми:
```bash
npm run fetch-schema && npm run relay
```

**Relay store key matching** — критичне обмеження: `fetchQuery` у `useRealtimeIssues` має запитувати поля з точно такими ж аргументами як читаючий фрагмент. Наприклад, `issue_labelsCollection` без `first: 5` відповідає фрагменту списку; додавання `first: 5` запише в інший store key і оновлення не поширяться.

---

## Architecture Decisions

1. **Client-only Relay** — Relay не підтримує React Server Components ([relay#4599](https://github.com/facebook/relay/issues/4599)). Всі запити даних у `"use client"` компонентах; сторінки — тонкі server wrappers
2. **Realtime via `fetchQuery`, not `commitLocalUpdate`** — обчислення правильного формату `nodeId` з сирого Supabase payload ненадійне. `fetchQuery` дозволяє серверу повернути правильно нормалізовані дані; Relay записує їх у store автоматично. Незначний додатковий мережевий запит на кожне оновлення
3. **Realtime subscriptions in `RelayProvider`** — `useRealtimeIssues` живе у `RelayProvider` (не в компоненті сторінки), тому підписки зберігаються при навігації і не перестворюються при кожній зміні роуту
4. **Label filtering via Supabase client** — pg_graphql не надає прямого фільтру "задачі з міткою X" на `issuesCollection`. Рішення: спочатку запит до `issue_labels` через Supabase JS client, збір `issue_id`, потім передача як `id: { in: [...] }` фільтру до GraphQL
5. **CSS Grid for detail layout** — мобільний порядок: Header → Sidebar → Comments, десктоп — дві колонки з Comments на всю ширину знизу. CSS Grid з `lg:row-span-2` на сайдбарі вирішує це без дублювання розмітки

---

## Trade-offs

1. **No server-side rendering** — відсутність підтримки RSC у Relay означає що початковий рендер — стан завантаження. З більшим часом: дослідити експериментальні SSR API `react-relay` або prefetch запити у Server Components
2. **Label filter is a two-step query** — спочатку до Supabase JS client, потім до GraphQL. Правильним рішенням була б Postgres функція через pg_graphql або `or` фільтр на `issue_labelsCollection`
3. **Auth is simple** — Supabase email/password auth реалізовано, але не є обов'язковою для перегляду задач. У реальному продукті RLS policies були б обмежені автентифікованими користувачами
4. **No error boundaries** — Relay `Suspense` границі показують базовий текст завантаження. З більшим часом: skeleton screens та `ErrorBoundary` компоненти
5. **`fetchQuery` realtime overhead** — кожна реалтайм подія тригерить GraphQL запит. Для high-traffic даних `commitLocalUpdate` з коректним обчисленням nodeId або WebSocket підписки були б ефективнішими

---
---

# Issues Tracker

---

## Features

### Issue List

1. **Multi-select filters** — filter by status, priority, and labels via dropdowns; label filter resolves `issue_id` list via Supabase client before passing to GraphQL
2. **Cursor-based pagination** — infinite scroll using `usePaginationFragment` with `@connection` + `@refetchable`; loads 10 per batch
   ```graphql
   fragment IssueListContent_query on Query
     @refetchable(queryName: "IssueListContentPaginationQuery")
     @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, after: { type: "Cursor" }, filter: { type: "issuesFilter" }) {
     issuesCollection(first: $first, after: $after, filter: $filter, orderBy: [{ created_at: DescNullsLast }])
       @connection(key: "IssueListContent_issuesCollection") { ... }
   }
   ```
3. **Inline status change with optimistic update** — clicking the status badge opens a dropdown; UI updates instantly via `optimisticResponse`, auto-reverts with toast on error

### Issue Detail

5. **Editable title** — inline edit on click, validated with Zod (`min 1, max 200`), optimistic update
6. **Editable description** — textarea edit, validated with Zod (`max 5000`), optimistic update
7. **Status / priority / assignee selects** — dropdown selects in sidebar, all with `optimisticResponse` + toast on error
8. **Label management** — add/remove labels with `ConnectionHandler` for immediate UI update
   ```graphql
   mutation IssueLabelsAddMutation($issueId: UUID!, $labelId: UUID!) {
     insertIntoissue_labelsCollection(objects: [{ issue_id: $issueId, label_id: $labelId }]) {
       records { nodeId labels { id nodeId name color } }
     }
   }
   ```
9. **Fragment co-location** — every section owns its data: `IssueHeader_issue`, `IssueBody_issue`, `IssueSidebar_issue`, `IssueLabels_issue`, `CommentThread_issue`, `CommentItem_comment`
10. **Comment thread with pagination** — `usePaginationFragment` with "Load more" button, ordered newest first
11. **Comment composer** — Zod validation (`min 1, max 2000`), disabled while in-flight

### Real-Time

12. **Issue updates** — Supabase Realtime `UPDATE` on `issues` table triggers `fetchQuery` to refresh the affected issue in Relay store
13. **Label changes in list** — Supabase Realtime `INSERT/DELETE` on `issue_labels` table triggers `fetchQuery` so label badges update in the list without navigation
14. **New comments** — Supabase Realtime `INSERT` on `comments` table updates the connection via `commitLocalUpdate` + increments `totalCount`
15. **Label definitions** — Supabase Realtime `INSERT/UPDATE/DELETE` on `labels` table keeps the label list in sync via `useLabels` hook

---

## Relay + pg_graphql

pg_graphql generates a non-standard schema: it uses `nodeId` (base64-encoded) instead of `id` for the Node interface, and names types like `issuesCollection`, `issuesEdge`, etc.

Two config changes make Relay work with it:

**1. `relay.config.js`** — tell the compiler to use `nodeId` as the global ID field:
```js
schemaConfig: {
  nodeInterfaceIdField: 'nodeId',
  nodeInterfaceIdVariableName: 'nodeId',
}
```

**2. `environment.ts`** — tell the Relay store to key records by `nodeId`:
```ts
getDataID: (node) => node.nodeId
```

Without both, Relay uses `id` by default and can't normalize records across queries.

**Custom scalars** — pg_graphql exposes `UUID`, `Datetime`, `Cursor`, etc. as custom scalars. Mapped to `string` in relay.config.js so the compiler generates correct TypeScript types.

**Schema introspection** — `scripts/fetch-schema.ts` fetches the SDL from Supabase's GraphQL endpoint and writes `schema.graphql`. This is the source of truth for the Relay compiler. Re-run after any schema change:
```bash
npm run fetch-schema && npm run relay
```

**Relay store key matching** — a critical constraint: `fetchQuery` in `useRealtimeIssues` must request fields with the exact same arguments as the reading fragment. For example, `issue_labelsCollection` without `first: 5` matches the list fragment; adding `first: 5` would write to a different store key and updates wouldn't propagate.

---

## Architecture Decisions

1. **Client-only Relay** — Relay does not support React Server Components ([relay#4599](https://github.com/facebook/relay/issues/4599)). All data fetching is in `"use client"` components; pages are thin server wrappers
2. **Realtime via `fetchQuery` not `commitLocalUpdate`** — computing the correct `nodeId` format from a raw Supabase payload is fragile. `fetchQuery` lets the server return the proper normalized data; Relay writes it to the store automatically. Slight extra network request per update, acceptable for a demo
3. **Realtime subscriptions in `RelayProvider`** — `useRealtimeIssues` lives in `RelayProvider` (not in a page component) so subscriptions survive navigation and aren't re-created on every route change
4. **Label filtering via Supabase client** — pg_graphql does not expose a direct "issues that have label X" filter on `issuesCollection`. The workaround: query `issue_labels` via the Supabase JS client first, collect matching `issue_id`s, then pass them as an `id: { in: [...] }` filter to GraphQL
5. **CSS Grid for detail layout** — mobile order is Header → Sidebar → Comments, but desktop is two columns with Comments spanning full width below. CSS Grid with `lg:row-span-2` on the sidebar solves this without duplicating markup

---

## Trade-offs

1. **No server-side rendering** — Relay's lack of RSC support means the initial render is a loading state. With more time: explore `react-relay`'s experimental SSR APIs or prefetch queries in Server Components and pass serialized data to the client
2. **Label filter is a two-step query** — first to Supabase JS client, then to GraphQL. A proper solution would be a Postgres function exposed via pg_graphql or an `or` filter on `issue_labelsCollection`
3. **Auth is simple** — Supabase email/password auth is implemented but not required for viewing issues. In a real product, RLS policies would be scoped to authenticated users
4. **No error boundaries** — Relay `Suspense` boundaries show a basic loading text. With more time: proper skeleton screens and `ErrorBoundary` components for graceful degradation
5. **`fetchQuery` realtime overhead** — each realtime event fires a GraphQL request. For high-traffic data, `commitLocalUpdate` with proper nodeId computation or WebSocket subscriptions would be more efficient
