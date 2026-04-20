'use client';

import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';
import { getSupabaseClient } from '@/app/lib/supabase/client';
import type { useRealtimeIssuesQuery as QueryType } from '@/app/__generated__/useRealtimeIssuesQuery.graphql';

const issueQuery = graphql`
  query useRealtimeIssuesQuery($id: UUID!) {
    issuesCollection(filter: { id: { eq: $id } }, first: 1) {
      edges {
        node {
          nodeId
          id
          title
          description
          status
          priority
          assignee_id
          assignee {
            nodeId
            name
            avatar_url
          }
          issue_labelsCollection {
            edges {
              node {
                nodeId
                labels {
                  id
                  nodeId
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  }
`;

function refetchIssue(environment: ReturnType<typeof useRelayEnvironment>, id: string) {
  fetchQuery<QueryType>(environment, issueQuery, { id }).toPromise();
}

export function useRealtimeIssues() {
  const environment = useRelayEnvironment();

  useEffect(() => {
    const supabase = getSupabaseClient();

    const issuesChannel = supabase
      .channel('issues-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'issues' },
        (payload) => {
          refetchIssue(environment, (payload.new as { id: string }).id);
        },
      )
      .subscribe();

    // Refetch the affected issue when labels are added or removed
    const labelsChannel = supabase
      .channel('issue-labels-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'issue_labels' },
        (payload) => {
          refetchIssue(environment, (payload.new as { issue_id: string }).issue_id);
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'issue_labels' },
        (payload) => {
          const id = (payload.old as { issue_id: string }).issue_id;
          if (id) refetchIssue(environment, id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(issuesChannel);
      supabase.removeChannel(labelsChannel);
    };
  }, [environment]);
}
