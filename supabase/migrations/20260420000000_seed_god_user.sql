insert into public.users (id, name, avatar_url) values
  ('00000000-0000-0000-0000-000000000000', 'god', null)
on conflict (id) do nothing;
