'use client';

import { useLazyLoadQuery, graphql } from 'react-relay';
import type { IssueListQuery } from '../../__generated__/IssueListQuery.graphql';

const query = graphql`
  query IssueListQuery($first: Int!, $after: Cursor) {
    issuesCollection(first: $first, after: $after, orderBy: [{ created_at: DescNullsLast }]) {
      edges {
        node {
          nodeId
          id
          title
          status
          priority
          created_at
          assignee {
            name
            avatar_url
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export function IssueList() {
  const data = useLazyLoadQuery<IssueListQuery>(query, { first: 20 });
  const edges = data.issuesCollection?.edges ?? [];

  return (
    <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
      {edges.length === 0 && (
        <p className="px-4 py-8 text-center text-zinc-500">No issues found</p>
      )}
      {edges.map(({ node }) => (
        <div key={node.nodeId} className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-50">
          <span className="text-xs font-medium text-zinc-500 uppercase">{node.status}</span>
          <span className="flex-1 text-sm font-medium text-zinc-900">{node.title}</span>
          <span className="text-xs text-zinc-400">{node.priority}</span>
          {node.assignee && (
            <span className="text-xs text-zinc-500">{node.assignee.name}</span>
          )}
        </div>
      ))}
    </div>
  );
}
