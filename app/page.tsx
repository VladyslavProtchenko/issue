'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { IssueFilters, type IssueFiltersValue } from './components/issues/IssueFilters';
import { IssueList } from './components/issues/IssueList';
import { getSupabaseClient } from './lib/supabase/client';
import { buildIssuesFilter } from './lib/filters';

export default function Home() {
  const [filters, setFilters] = useState<IssueFiltersValue>({
    statuses: [],
    priorities: [],
    labelIds: [],
  });
  const [resolvedFilter, setResolvedFilter] = useState<Record<string, unknown> | undefined>(undefined);
  const [isResolving, setIsResolving] = useState(false);
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    abortRef.current = false;
    setIsResolving(true);

    async function resolve() {
      let labelIssueIds: string[] | undefined;

      if (filters.labelIds.length > 0) {
        const { data } = await getSupabaseClient()
          .from('issue_labels')
          .select('issue_id')
          .in('label_id', filters.labelIds);
        labelIssueIds = [...new Set(data?.map((r) => r.issue_id) ?? [])];
      }

      if (abortRef.current) return;
      setResolvedFilter(buildIssuesFilter(filters, labelIssueIds));
      setIsResolving(false);
    }

    resolve();
    return () => { abortRef.current = true; };
  }, [filters]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-semibold">Issues</h1>
      <IssueFilters value={filters} onChange={setFilters} />
      <div className={`mt-6 transition-opacity ${isResolving ? 'opacity-50 pointer-events-none' : ''}`}>
        <Suspense fallback={<div className="rounded-lg border py-8 text-center text-muted-foreground">Loading...</div>}>
          <IssueList filter={resolvedFilter} />
        </Suspense>
      </div>
    </main>
  );
}
