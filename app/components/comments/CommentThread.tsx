'use client';

import { usePaginationFragment, graphql } from 'react-relay';
import { useRealtimeComments } from '@/app/hooks/useRealtimeComments';
import { CommentItem } from './CommentItem';
import { CommentComposer } from './CommentComposer';
import type { CommentThread_issue$key } from '../../__generated__/CommentThread_issue.graphql';

const fragment = graphql`
  fragment CommentThread_issue on issues
    @argumentDefinitions(
      first: { type: "Int", defaultValue: 5 }
      after: { type: "Cursor" }
    )
    @refetchable(queryName: "CommentThreadPaginationQuery") {
    nodeId
    id
    comments(
      first: $first
      after: $after
      orderBy: [{ created_at: DescNullsLast }]
    ) @connection(key: "CommentThread_comments", filters: []) {
      totalCount
      edges {
        node {
          nodeId
          ...CommentItem_comment
        }
      }
    }
  }
`;

export function CommentThread({ issue }: { issue: CommentThread_issue$key }) {
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    fragment,
    issue,
  );

  const edges = data.comments?.edges ?? [];

  useRealtimeComments(data.id, data.nodeId);

  return (
    <div className="mt-6">
      <h2 className="text-base font-semibold mb-4">
        Comments {data.comments?.totalCount ? `(${data.comments.totalCount})` : ''}
      </h2>

      <div className="space-y-3 mb-6">
        {edges.map(({ node }) => (
          <CommentItem key={node.nodeId} comment={node} />
        ))}
      </div>

      {hasNext && (
        <button
          onClick={() => loadNext(5)}
          disabled={isLoadingNext}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoadingNext ? 'Loading...' : 'Load more comments'}
        </button>
      )}

      <CommentComposer issueId={data.id} issueNodeId={data.nodeId} />
    </div>
  );
}
