# Issue Tracker — Implementation Plan

## Overview

Minimal issue tracker built with Next.js 16 (App Router), Relay, Supabase pg_graphql, Tailwind CSS, and Zod.

---

## Architecture Decisions

### Client-Only Relay

Relay does NOT officially support React Server Components ([relay#4599](https://github.com/facebook/relay/issues/4599)). All Relay data-fetching happens in `"use client"` components.

**Pattern:**
- `app/layout.tsx` — Server Component, wraps children with `<RelayProvider>`
- `RelayProvider` — `"use client"`, provides `RelayEnvironmentProvider`
- Pages render thin Server Components that mount client-side Relay components
- All `useLazyLoadQuery`, `useFragment`, `usePaginationFragment` — client-only

### Relay + pg_graphql Integration

pg_graphql uses `nodeId` (base64-encoded) instead of `id` for Relay's Node interface. Since relay-compiler v13+ this is handled via config:

```js
// relay.config.js
schemaConfig: {
  nodeInterfaceIdField: 'nodeId',
  nodeInterfaceIdVariableName: 'nodeId',
}
```

Plus in Relay Environment:
```ts
getDataID: (node) => node.nodeId
```

**No schema transforms needed.** pg_graphql natively generates Relay-compatible Connection/Edge types.

### Directory Structure

```
issues-tracker/
├── relay.config.js
├── schema.graphql              # Auto-generated from Supabase introspection
├── scripts/
│   └── fetch-schema.ts         # Introspection script
├── src/
│   ├── __generated__/          # Relay compiler artifacts
│   ├── lib/
│   │   ├── relay/
│   │   │   ├── environment.ts  # Relay Environment with Supabase fetch
│   │   │   └── RelayProvider.tsx
│   │   ├── supabase/
│   │   │   └── client.ts       # Supabase client singleton
│   │   └── validation/
│   │       └── schemas.ts      # Zod schemas
│   ├── hooks/
│   │   ├── useRealtimeIssues.ts
│   │   └── useMutationWithToast.ts
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives
│   │   ├── issues/
│   │   │   ├── IssueList.tsx           # usePaginationFragment
│   │   │   ├── IssueRow.tsx            # useFragment
│   │   │   ├── IssueFilters.tsx        # Filter controls
│   │   │   ├── IssueDetail.tsx         # Top-level query
│   │   │   ├── IssueHeader.tsx         # useFragment
│   │   │   ├── IssueBody.tsx           # useFragment
│   │   │   ├── IssueSidebar.tsx        # useFragment (assignee, labels, priority)
│   │   │   └── StatusSelect.tsx        # Optimistic update trigger
│   │   └── comments/
│   │       ├── CommentThread.tsx       # usePaginationFragment
│   │       └── CommentItem.tsx         # useFragment
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx                    # Redirect to /issues
│       └── issues/
│           ├── page.tsx                # Issue list page
│           └── [id]/
│               └── page.tsx            # Issue detail page
```

---

## Step-by-Step Implementation

---

### Stage 1: Supabase Setup

**Goal:** Database schema + pg_graphql enabled.

#### 1.1 Create tables (SQL in Supabase Dashboard → SQL Editor)

```sql
-- Enable pg_graphql (if not already)
create extension if not exists pg_graphql;

-- Custom types
create type issue_status as enum ('backlog', 'todo', 'in_progress', 'done', 'cancelled');
create type issue_priority as enum ('none', 'urgent', 'high', 'medium', 'low');

-- Users
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text
);

-- Issues
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  status issue_status not null default 'backlog',
  priority issue_priority not null default 'none',
  assignee_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  body text not null,
  author_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Labels
create table public.labels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#6B7280'
);

-- Issue-Labels junction
create table public.issue_labels (
  issue_id uuid not null references public.issues(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (issue_id, label_id)
);

-- Indexes
create index idx_issues_status on public.issues(status);
create index idx_issues_priority on public.issues(priority);
create index idx_issues_assignee on public.issues(assignee_id);
create index idx_issues_created_at on public.issues(created_at desc);
create index idx_comments_issue on public.comments(issue_id);
create index idx_comments_created_at on public.comments(created_at);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger issues_updated_at
  before update on public.issues
  for each row execute function update_updated_at();

-- Realtime: enable replica identity full for DELETE payloads
alter table public.issues replica identity full;
alter table public.comments replica identity full;
alter table public.issue_labels replica identity full;
```

#### 1.2 Customize pg_graphql field names

By default, FK relations use the referenced table name. We want explicit names:

```sql
-- issues.assignee_id → users: call it "assignee" instead of "users"
comment on constraint issues_assignee_id_fkey on public.issues is
  E'@graphql({"foreign_name": "assignee", "local_name": "assignedIssues"})';

-- comments.author_id → users: call it "author"
comment on constraint comments_author_id_fkey on public.comments is
  E'@graphql({"foreign_name": "author", "local_name": "authoredComments"})';

-- comments.issue_id → issues: call it "issue"
comment on constraint comments_issue_id_fkey on public.comments is
  E'@graphql({"foreign_name": "issue", "local_name": "comments"})';
```

#### 1.3 Seed data

```sql
-- Users
insert into public.users (id, name, avatar_url) values
  ('11111111-1111-1111-1111-111111111111', 'Alice Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'),
  ('22222222-2222-2222-2222-222222222222', 'Bob Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'),
  ('33333333-3333-3333-3333-333333333333', 'Carol Williams', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol');

-- Labels
insert into public.labels (name, color) values
  ('bug', '#EF4444'),
  ('feature', '#3B82F6'),
  ('improvement', '#8B5CF6'),
  ('documentation', '#10B981'),
  ('urgent', '#F59E0B');

-- Issues
insert into public.issues (title, description, status, priority, assignee_id) values
  ('Fix login page crash on Safari', 'The login page throws an error on Safari 17.', 'todo', 'high', '11111111-1111-1111-1111-111111111111'),
  ('Add dark mode support', 'Users should be able to toggle between light and dark themes.', 'in_progress', 'medium', '22222222-2222-2222-2222-222222222222'),
  ('Update API documentation', 'The REST API docs are outdated after v2 migration.', 'backlog', 'low', null),
  ('Database connection pooling', 'Implement PgBouncer for connection management.', 'done', 'high', '33333333-3333-3333-3333-333333333333'),
  ('Improve search performance', 'Full-text search is slow on large datasets.', 'todo', 'urgent', '11111111-1111-1111-1111-111111111111');

-- Issue Labels
insert into public.issue_labels (issue_id, label_id) values
  ((select id from public.issues where title like 'Fix login%'), (select id from public.labels where name = 'bug')),
  ((select id from public.issues where title like 'Fix login%'), (select id from public.labels where name = 'urgent')),
  ((select id from public.issues where title like 'Add dark%'), (select id from public.labels where name = 'feature')),
  ((select id from public.issues where title like 'Update API%'), (select id from public.labels where name = 'documentation')),
  ((select id from public.issues where title like 'Database%'), (select id from public.labels where name = 'improvement')),
  ((select id from public.issues where title like 'Improve%'), (select id from public.labels where name = 'improvement'));

-- Comments
insert into public.comments (issue_id, body, author_id) values
  ((select id from public.issues where title like 'Fix login%'), 'I can reproduce this on Safari 17.2. Works fine on Chrome.', '22222222-2222-2222-2222-222222222222'),
  ((select id from public.issues where title like 'Fix login%'), 'Looks like a WebKit issue with the auth library. Investigating.', '11111111-1111-1111-1111-111111111111'),
  ((select id from public.issues where title like 'Add dark%'), 'Should we use CSS variables or Tailwind dark mode?', '33333333-3333-3333-3333-333333333333'),
  ((select id from public.issues where title like 'Add dark%'), 'Tailwind dark: prefix with class strategy. PR coming soon.', '22222222-2222-2222-2222-222222222222');
```

#### 1.4 RLS Policies (permissive for demo)

```sql
-- Enable RLS
alter table public.users enable row level security;
alter table public.issues enable row level security;
alter table public.comments enable row level security;
alter table public.labels enable row level security;
alter table public.issue_labels enable row level security;

-- Allow all operations with anon key (demo purposes)
create policy "Allow all on users" on public.users for all using (true) with check (true);
create policy "Allow all on issues" on public.issues for all using (true) with check (true);
create policy "Allow all on comments" on public.comments for all using (true) with check (true);
create policy "Allow all on labels" on public.labels for all using (true) with check (true);
create policy "Allow all on issue_labels" on public.issue_labels for all using (true) with check (true);
```

#### 1.5 Enable Realtime

In Supabase Dashboard → Database → Replication:
- Enable replication for tables: `issues`, `comments`, `issue_labels`

Or via SQL:
```sql
alter publication supabase_realtime add table public.issues;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.issue_labels;
```

---

### Stage 2: Project Configuration

**Goal:** Install dependencies, configure Relay compiler, fetch schema, verify compilation.

#### 2.1 Install packages

```bash
# Relay
npm install relay-runtime react-relay

# Relay dev tools
npm install --save-dev relay-compiler @types/react-relay @types/relay-runtime

# GraphQL (for introspection script)
npm install --save-dev graphql

# Supabase
npm install @supabase/supabase-js

# Zod
npm install zod

# Toast notifications (for optimistic update errors)
npm install sonner

# Concurrent dev scripts
npm install --save-dev concurrently
```

#### 2.2 Move source files to src/

Currently code is in `app/`. We need a `src/` directory for Relay compiler:

```
mkdir -p src
mv app src/app
```

Update `tsconfig.json` paths if needed.

#### 2.3 Environment variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Create `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

#### 2.4 Schema introspection script

File: `scripts/fetch-schema.ts`

```typescript
import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql';
import { writeFileSync, mkdirSync } from 'node:fs';

async function fetchSchema() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const response = await fetch(`${url}/graphql/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error('Introspection errors:', json.errors);
    process.exit(1);
  }

  const schema = buildClientSchema(json.data);
  const sdl = printSchema(schema);

  writeFileSync('./schema.graphql', sdl);
  console.log('Schema written to ./schema.graphql');
}

fetchSchema();
```

#### 2.5 Relay config

File: `relay.config.js`

```javascript
module.exports = {
  src: './src',
  language: 'typescript',
  schema: './schema.graphql',
  artifactDirectory: './src/__generated__',
  excludes: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],

  // pg_graphql uses nodeId instead of id for Node interface
  schemaConfig: {
    nodeInterfaceIdField: 'nodeId',
    nodeInterfaceIdVariableName: 'nodeId',
  },

  // Map pg_graphql custom scalars to TypeScript types
  customScalarTypes: {
    UUID: 'string',
    BigInt: 'string',
    BigFloat: 'string',
    Opaque: 'string',
    Datetime: 'string',
    JSON: 'string',
    Cursor: 'string',
  },

  eagerEsModules: false,
};
```

#### 2.6 next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    relay: {
      src: "./src",
      artifactDirectory: "./src/__generated__",
      language: "typescript",
      eagerEsModules: false,
    },
  },
};

export default nextConfig;
```

#### 2.7 Package scripts

```json
{
  "scripts": {
    "dev": "concurrently \"relay-compiler --watch\" \"next dev\"",
    "build": "relay-compiler && next build",
    "start": "next start",
    "lint": "eslint",
    "relay": "relay-compiler",
    "relay:watch": "relay-compiler --watch",
    "fetch-schema": "npx tsx scripts/fetch-schema.ts"
  }
}
```

#### 2.8 Verify

```bash
# 1. Fetch schema from Supabase
npm run fetch-schema

# 2. Run Relay compiler (should succeed with 0 operations if no queries yet)
npm run relay

# 3. Start dev
npm run dev
```

---

### Stage 3: Relay Runtime Setup

**Goal:** Relay Environment + Provider working in Next.js App Router.

#### 3.1 Supabase client

File: `src/lib/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

#### 3.2 Relay Environment

File: `src/lib/relay/environment.ts`

```typescript
import {
  Environment,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
} from 'relay-runtime';

const fetchFn: FetchFunction = async (operation, variables) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      body: JSON.stringify({
        query: operation.text,
        variables,
      }),
    },
  );

  return response.json();
};

function createEnvironment(): Environment {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
    // CRITICAL: pg_graphql uses nodeId as global identifier
    getDataID: (fieldValue) => fieldValue.nodeId ?? fieldValue.id,
  });
}

let clientEnvironment: Environment | undefined;

export function getClientEnvironment(): Environment {
  if (typeof window === 'undefined') {
    return createEnvironment();
  }

  if (!clientEnvironment) {
    clientEnvironment = createEnvironment();
  }

  return clientEnvironment;
}
```

#### 3.3 Relay Provider

File: `src/lib/relay/RelayProvider.tsx`

```tsx
'use client';

import { type ReactNode } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { getClientEnvironment } from './environment';

export function RelayProvider({ children }: { children: ReactNode }) {
  const environment = getClientEnvironment();

  return (
    <RelayEnvironmentProvider environment={environment}>
      {children}
    </RelayEnvironmentProvider>
  );
}
```

#### 3.4 Root Layout

File: `src/app/layout.tsx`

```tsx
import { RelayProvider } from '@/lib/relay/RelayProvider';
import { Toaster } from 'sonner';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RelayProvider>
          {children}
          <Toaster position="bottom-right" />
        </RelayProvider>
      </body>
    </html>
  );
}
```

---

### Stage 4: Issue List Page

**Goal:** Issue list with filters, cursor pagination, optimistic status update.

#### 4.1 Components

| Component | Relay Hook | Responsibility |
|-----------|-----------|----------------|
| `IssueListPage` | `useLazyLoadQuery` | Top-level query, renders filters + list |
| `IssueList` | `usePaginationFragment` | Paginated list with `@connection` + `@refetchable` |
| `IssueRow` | `useFragment` | Single issue row with status toggle |
| `IssueFilters` | — | Filter controls (status, priority, labels) |
| `StatusSelect` | `useMutation` | Inline status change with optimistic update |

#### 4.2 GraphQL operations

**Root query:**
```graphql
query IssueListPageQuery(
  $first: Int!
  $after: Cursor
  $filter: IssuesFilter
  $orderBy: [IssuesOrderBy!]
) {
  ...IssueList_query @arguments(first: $first, after: $after, filter: $filter, orderBy: $orderBy)
}
```

**Paginated fragment:**
```graphql
fragment IssueList_query on Query
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 20 }
    after: { type: "Cursor" }
    filter: { type: "IssuesFilter" }
    orderBy: { type: "[IssuesOrderBy!]", defaultValue: [{ createdAt: DescNullsLast }] }
  )
  @refetchable(queryName: "IssueListPaginationQuery") {
  issuesCollection(first: $first, after: $after, filter: $filter, orderBy: $orderBy)
    @connection(key: "IssueList_issuesCollection") {
    edges {
      node {
        nodeId
        id
        ...IssueRow_issue
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Issue row fragment:**
```graphql
fragment IssueRow_issue on Issues {
  nodeId
  id
  title
  status
  priority
  createdAt
  assignee {
    id
    name
    avatarUrl
  }
  issueLabelsCollection {
    edges {
      node {
        labels {
          id
          name
          color
        }
      }
    }
  }
}
```

#### 4.3 Optimistic status update

```graphql
mutation UpdateIssueStatusMutation(
  $set: IssuesUpdateInput!
  $filter: IssuesFilter!
) {
  updateIssuesCollection(set: $set, filter: $filter) {
    records {
      nodeId
      id
      status
    }
  }
}
```

**In code:**
```typescript
commit({
  variables: {
    set: { status: newStatus },
    filter: { id: { eq: issueId } },
  },
  optimisticResponse: {
    updateIssuesCollection: {
      records: [{
        nodeId,
        id: issueId,
        status: newStatus,
      }],
    },
  },
  onError(error) {
    // Relay auto-reverts optimistic update
    toast.error(`Failed to update status: ${error.message}`);
  },
});
```

#### 4.4 Filters

Filters map directly to pg_graphql `IssuesFilter`:

```typescript
// Build filter from UI state
function buildFilter(filters: FilterState): IssuesFilter {
  const filter: IssuesFilter = {};

  if (filters.status.length > 0) {
    filter.status = { in: filters.status };
  }
  if (filters.priority.length > 0) {
    filter.priority = { in: filters.priority };
  }
  if (filters.labelIds.length > 0) {
    filter.issueLabelsCollection = {
      // Filter issues that have at least one of selected labels
    };
  }

  return filter;
}

// Apply filter via refetch
refetch({ filter: buildFilter(filters) }, { fetchPolicy: 'network-only' });
```

**Label filtering challenge:** pg_graphql doesn't have a direct "issues with label X" filter on the issues collection. Options:
1. Filter via `issueLabelsCollection` nested filter (if supported)
2. Create a Postgres function/view that does the join
3. Use `or` filter with multiple `issueLabelsCollection` conditions

Best approach: create a database function or use the nested filter pattern.

---

### Stage 5: Issue Detail Page

**Goal:** Edit all fields, fragment co-location, comment thread.

#### 5.1 Fragment architecture

```
IssueDetailPage (useLazyLoadQuery)
├── IssueHeader (useFragment)      → title, status, createdAt
├── IssueBody (useFragment)        → description (editable)
├── IssueSidebar (useFragment)     → assignee, priority, labels
└── CommentThread (usePaginationFragment)
    ├── CommentItem (useFragment)  → body, author, createdAt
    └── CommentComposer            → new comment form
```

#### 5.2 GraphQL operations

**Page query:**
```graphql
query IssueDetailPageQuery($nodeId: ID!) {
  node(nodeId: $nodeId) {
    ... on Issues {
      ...IssueHeader_issue
      ...IssueBody_issue
      ...IssueSidebar_issue
      ...CommentThread_issue
    }
  }
}
```

**Comment thread with pagination:**
```graphql
fragment CommentThread_issue on Issues
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 20 }
    after: { type: "Cursor" }
  )
  @refetchable(queryName: "CommentThreadPaginationQuery") {
  commentsCollection(first: $first, after: $after, orderBy: [{ createdAt: AscNullsLast }])
    @connection(key: "CommentThread_commentsCollection") {
    edges {
      node {
        nodeId
        id
        ...CommentItem_comment
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

#### 5.3 Edit mutations

| Action | Mutation | Notes |
|--------|----------|-------|
| Edit title/description | `updateIssuesCollection` | Optimistic update |
| Change status | `updateIssuesCollection` | Optimistic update + toast on error |
| Change priority | `updateIssuesCollection` | Optimistic update |
| Change assignee | `updateIssuesCollection` | Dropdown, optimistic |
| Add label | `insertIntoIssueLabelsCollection` | Updater: add edge to connection |
| Remove label | `deleteFromIssueLabelsCollection` | Updater: remove edge |
| Add comment | `insertIntoCommentsCollection` | Updater: append to comment connection |

#### 5.4 Zod validation

```typescript
import { z } from 'zod';

export const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'done', 'cancelled']),
  priority: z.enum(['none', 'urgent', 'high', 'medium', 'low']),
  assigneeId: z.string().uuid().nullable(),
});

export const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(2000),
});
```

---

### Stage 6: Real-Time Updates

**Goal:** Issue list reflects changes from other users automatically.

#### 6.1 Approach

Supabase Realtime → `commitLocalUpdate` → Relay store update → automatic re-render.

#### 6.2 Custom hook: useRealtimeIssues

```typescript
'use client';

import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { commitLocalUpdate, ConnectionHandler } from 'relay-runtime';
import { supabase } from '@/lib/supabase/client';

export function useRealtimeIssues() {
  const environment = useRelayEnvironment();

  useEffect(() => {
    const channel = supabase
      .channel('issues-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, (payload) => {
        switch (payload.eventType) {
          case 'UPDATE':
            commitLocalUpdate(environment, (store) => {
              // Find existing record and update fields
              // Use nodeId format: base64(["public","issues","<uuid>"])
            });
            break;
          case 'INSERT':
            // Refetch or add to connection via commitLocalUpdate
            break;
          case 'DELETE':
            // Remove from connection via ConnectionHandler.deleteNode
            break;
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [environment]);
}
```

#### 6.3 Key challenge: nodeId format

Supabase Realtime gives us raw row data (with `id` UUID), but Relay store uses `nodeId` (base64). We need to either:
1. Compute `nodeId` from the UUID: `btoa(JSON.stringify(["public","issues", uuid]))`
2. Or do a lightweight refetch when INSERT happens

For UPDATE: we can iterate store records or compute nodeId.
For INSERT: safest to do `environment.getStore().notify()` or refetch the connection.

---

### Stage 7: UI & Styling

**Goal:** Clean, functional UI with Tailwind CSS.

#### 7.1 Component design

- **Issue List:** Table-like layout with status/priority badges, assignee avatars, label chips
- **Filters:** Horizontal bar with dropdowns/multi-selects
- **Issue Detail:** Two-column layout — main content (title, description, comments) + sidebar (metadata)
- **Comments:** Threaded list with markdown support (optional)

#### 7.2 UI components to build

| Component | Description |
|-----------|-------------|
| `Badge` | Status/priority/label badge with color |
| `Avatar` | User avatar with fallback initials |
| `Select` | Dropdown select (single) |
| `MultiSelect` | Multi-select for labels |
| `Button` | Primary/secondary/ghost variants |
| `Textarea` | Auto-resizing textarea |
| `Toast` | Via `sonner` — already configured |
| `Skeleton` | Loading states for Suspense |

All built with Tailwind CSS, no component library needed.

---

### Stage 8: README & Deploy

#### 8.1 README content

1. **Setup instructions** — clone, env vars, Supabase setup, schema fetch, run
2. **Relay + pg_graphql** — `nodeInterfaceIdField`, `getDataID`, schema introspection, known issues
3. **Architecture** — client-only Relay, fragment co-location, realtime bridge pattern
4. **Trade-offs** — what would be different with more time

#### 8.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel Dashboard
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Build command: `npm run build` (runs `relay-compiler && next build`).

---

## Key Technical Solutions

### Problem: Relay compiler doesn't understand pg_graphql's nodeId

**Solution:** `relay.config.js` → `schemaConfig.nodeInterfaceIdField: 'nodeId'` + environment `getDataID: (node) => node.nodeId`

### Problem: Optimistic update must revert with toast on error

**Solution:** Relay auto-reverts optimistic responses on `onError`. We just show toast in `onError` callback. No manual revert needed.

### Problem: Label filtering (many-to-many)

**Solution:** Either nested filter on `issueLabelsCollection` or a Postgres function that returns filtered issue IDs.

### Problem: Relay doesn't support RSC

**Solution:** All Relay components are `"use client"`. Server components are thin wrappers that mount client components.

### Problem: Realtime → Relay store bridge

**Solution:** Custom `useRealtimeIssues` hook using `commitLocalUpdate` + `ConnectionHandler` to manipulate the Relay store in response to Supabase Realtime events.

---

## Execution Order

| # | Stage | Estimated Effort | Dependencies |
|---|-------|-----------------|--------------|
| 1 | Supabase setup | SQL execution | Supabase account |
| 2 | Project config | Install + config files | Stage 1 (need schema) |
| 3 | Relay runtime | Environment + Provider | Stage 2 |
| 4 | Issue List | UI + queries + mutations | Stage 3 |
| 5 | Issue Detail | UI + fragments + mutations | Stage 3 |
| 6 | Real-time | Supabase Realtime hook | Stage 4 |
| 7 | UI polish | Styling + UX details | Stages 4-5 |
| 8 | README + Deploy | Documentation + Vercel | All stages |

Stages 4 and 5 can be done in parallel.
