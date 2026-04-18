-- Extensions
create extension if not exists pg_graphql;

-- Custom types
create type issue_status as enum ('backlog', 'todo', 'in_progress', 'done', 'cancelled');
create type issue_priority as enum ('none', 'urgent', 'high', 'medium', 'low');

-- Tables
create table public.users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  avatar_url text
);

create table public.issues (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text default '',
  status      issue_status not null default 'backlog',
  priority    issue_priority not null default 'none',
  assignee_id uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  issue_id   uuid not null references public.issues(id) on delete cascade,
  body       text not null,
  author_id  uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.labels (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  color text not null default '#6B7280'
);

create table public.issue_labels (
  issue_id uuid not null references public.issues(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (issue_id, label_id)
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_issues_status     on public.issues(status);
create index idx_issues_priority   on public.issues(priority);
create index idx_issues_assignee   on public.issues(assignee_id);
create index idx_issues_created_at on public.issues(created_at desc);
create index idx_comments_issue      on public.comments(issue_id);
create index idx_comments_created_at on public.comments(created_at);

-- ============================================================
-- updated_at trigger
-- ============================================================
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

-- ============================================================
-- pg_graphql: rename FK relations
-- ============================================================
comment on constraint issues_assignee_id_fkey on public.issues is
  E'@graphql({"foreign_name": "assignee", "local_name": "assignedIssues"})';

comment on constraint comments_author_id_fkey on public.comments is
  E'@graphql({"foreign_name": "author", "local_name": "authoredComments"})';

comment on constraint comments_issue_id_fkey on public.comments is
  E'@graphql({"foreign_name": "issue", "local_name": "comments"})';

-- ============================================================
-- RLS
-- ============================================================
alter table public.users        enable row level security;
alter table public.issues       enable row level security;
alter table public.comments     enable row level security;
alter table public.labels       enable row level security;
alter table public.issue_labels enable row level security;

create policy "Allow all on users"        on public.users        for all using (true) with check (true);
create policy "Allow all on issues"       on public.issues       for all using (true) with check (true);
create policy "Allow all on comments"     on public.comments     for all using (true) with check (true);
create policy "Allow all on labels"       on public.labels       for all using (true) with check (true);
create policy "Allow all on issue_labels" on public.issue_labels for all using (true) with check (true);

-- ============================================================
-- Realtime
-- ============================================================
alter table public.issues       replica identity full;
alter table public.comments     replica identity full;
alter table public.issue_labels replica identity full;

alter publication supabase_realtime add table public.issues;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.issue_labels;

-- ============================================================
-- Seed data
-- ============================================================
insert into public.users (id, name, avatar_url) values
  ('11111111-1111-1111-1111-111111111111', 'Alice Johnson',   'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'),
  ('22222222-2222-2222-2222-222222222222', 'Bob Smith',       'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'),
  ('33333333-3333-3333-3333-333333333333', 'Carol Williams',  'https://api.dicebear.com/7.x/avataaars/svg?seed=carol');

insert into public.labels (name, color) values
  ('bug',           '#EF4444'),
  ('feature',       '#3B82F6'),
  ('improvement',   '#8B5CF6'),
  ('documentation', '#10B981'),
  ('urgent',        '#F59E0B');

insert into public.issues (title, description, status, priority, assignee_id) values
  ('Fix login page crash on Safari',  'The login page throws an error on Safari 17.',              'todo',        'high',   '11111111-1111-1111-1111-111111111111'),
  ('Add dark mode support',           'Users should be able to toggle between light and dark themes.', 'in_progress', 'medium', '22222222-2222-2222-2222-222222222222'),
  ('Update API documentation',        'The REST API docs are outdated after v2 migration.',        'backlog',     'low',    null),
  ('Database connection pooling',     'Implement PgBouncer for connection management.',            'done',        'high',   '33333333-3333-3333-3333-333333333333'),
  ('Improve search performance',      'Full-text search is slow on large datasets.',               'todo',        'urgent', '11111111-1111-1111-1111-111111111111');

insert into public.issue_labels (issue_id, label_id) values
  ((select id from public.issues where title like 'Fix login%'),    (select id from public.labels where name = 'bug')),
  ((select id from public.issues where title like 'Fix login%'),    (select id from public.labels where name = 'urgent')),
  ((select id from public.issues where title like 'Add dark%'),     (select id from public.labels where name = 'feature')),
  ((select id from public.issues where title like 'Update API%'),   (select id from public.labels where name = 'documentation')),
  ((select id from public.issues where title like 'Database%'),     (select id from public.labels where name = 'improvement')),
  ((select id from public.issues where title like 'Improve%'),      (select id from public.labels where name = 'improvement'));

insert into public.comments (issue_id, body, author_id) values
  ((select id from public.issues where title like 'Fix login%'), 'I can reproduce this on Safari 17.2. Works fine on Chrome.',              '22222222-2222-2222-2222-222222222222'),
  ((select id from public.issues where title like 'Fix login%'), 'Looks like a WebKit issue with the auth library. Investigating.',         '11111111-1111-1111-1111-111111111111'),
  ((select id from public.issues where title like 'Add dark%'),  'Should we use CSS variables or Tailwind dark mode?',                     '33333333-3333-3333-3333-333333333333'),
  ((select id from public.issues where title like 'Add dark%'),  'Tailwind dark: prefix with class strategy. PR coming soon.',             '22222222-2222-2222-2222-222222222222');
