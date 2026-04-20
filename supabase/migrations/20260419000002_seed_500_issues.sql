do $$
declare
  titles text[] := array[
    'Fix crash on startup', 'Add export to PDF', 'Improve load time', 'Update dependencies',
    'Fix memory leak', 'Add unit tests', 'Refactor auth module', 'Fix broken pagination',
    'Add search functionality', 'Improve error handling', 'Fix typo in UI', 'Add dark mode',
    'Migrate to TypeScript', 'Fix CORS issue', 'Add rate limiting', 'Improve caching',
    'Fix broken links', 'Add email notifications', 'Refactor database queries', 'Fix XSS vulnerability',
    'Add two-factor auth', 'Improve onboarding', 'Fix date formatting', 'Add CSV import',
    'Fix infinite scroll', 'Add keyboard shortcuts', 'Improve accessibility', 'Fix race condition',
    'Add webhook support', 'Refactor API client', 'Fix mobile layout', 'Add drag and drop',
    'Improve search ranking', 'Fix session timeout', 'Add audit logging', 'Fix SQL injection',
    'Add multi-language support', 'Improve dashboard performance', 'Fix image upload', 'Add SSO login',
    'Fix broken redirects', 'Add activity feed', 'Improve test coverage', 'Fix flaky tests',
    'Add file attachments', 'Fix tooltip positioning', 'Add custom themes', 'Fix form validation',
    'Add batch operations', 'Improve API documentation'
  ];
  descriptions text[] := array[
    'Needs investigation and fix.',
    'Users have been requesting this feature.',
    'Performance is degrading under load.',
    'Current version has known security issues.',
    'Causing high memory usage in production.',
    'Coverage is below 40% for this module.',
    'Code is hard to maintain and test.',
    'Does not work correctly on large datasets.',
    'Users cannot find content efficiently.',
    'Errors are swallowed silently.',
    'Found during QA review.',
    'Multiple user requests in the last month.',
    'JavaScript errors are becoming unmanageable.',
    'Blocking third-party integrations.',
    'API is being abused by bots.',
    'Response times exceed 2 seconds.',
    'Several pages return 404 after restructure.',
    'Users missing important updates.',
    'N+1 query detected in profiler.',
    'User input not sanitized properly.',
    'Security audit recommendation.',
    'New users drop off at step 3.',
    'Wrong timezone causes off-by-one errors.',
    'Partners need data in structured format.',
    'Breaks on pages with more than 100 items.',
    'Power users need faster navigation.',
    'Screen reader users cannot use the app.',
    'Intermittent 500 errors under high load.',
    'External services need event notifications.',
    'Too much duplicated HTTP logic.',
    'Layout breaks on screens below 375px.',
    'Reordering items is clunky with mouse.',
    'Irrelevant results appear at top.',
    'Users get logged out unexpectedly.',
    'Required for compliance.',
    'Pen test found critical vulnerability.',
    'Expanding to EU market.',
    'Charts take 4+ seconds to render.',
    'Files over 5MB fail silently.',
    'Enterprise clients require SSO.'
  ];
  statuses issue_status[] := array['backlog', 'todo', 'in_progress', 'done', 'cancelled'];
  priorities issue_priority[] := array['none', 'low', 'medium', 'high', 'urgent'];
  user_ids uuid[] := array[
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    null
  ];
  i int;
begin
  for i in 1..500 loop
    insert into public.issues (title, description, status, priority, assignee_id, created_at)
    values (
      titles[1 + mod(i + floor(random() * 7)::int, array_length(titles, 1))] || ' #' || i,
      descriptions[1 + mod(i, array_length(descriptions, 1))],
      statuses[1 + mod(floor(random() * 5)::int, 5)],
      priorities[1 + mod(floor(random() * 5)::int, 5)],
      user_ids[1 + mod(floor(random() * 4)::int, 4)],
      now() - (random() * interval '180 days')
    );
  end loop;
end;
$$;
