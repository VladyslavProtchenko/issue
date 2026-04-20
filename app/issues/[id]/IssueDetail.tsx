'use client';

import { useLazyLoadQuery, graphql } from 'react-relay';
import type { IssueDetailQuery } from '../../__generated__/IssueDetailQuery.graphql';
import { IssueHeader } from '../../components/issues/IssueHeader';
import { IssueSidebar } from '../../components/issues/IssueSidebar';
import { IssueBody } from '../../components/issues/IssueBody';
import { CommentThread } from '../../components/comments/CommentThread';

const query = graphql`
  query IssueDetailQuery($id: UUID!) {
    issuesCollection(filter: { id: { eq: $id } }, first: 1) {
      edges {
        node {
          ...IssueHeader_issue
          ...IssueSidebar_issue
          ...IssueBody_issue
          ...CommentThread_issue
        }
      }
    }
  }
`;

export function IssueDetail({ id }: { id: string }) {
  const data = useLazyLoadQuery<IssueDetailQuery>(query, { id });
  const node = data.issuesCollection?.edges[0]?.node;

  if (!node) {
    return <p className="text-muted-foreground">Issue not found.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_256px] gap-6 lg:gap-8 lg:items-start">
      {/* Row 1, Col 1: header + description */}
      <div className="min-w-0">
        <IssueHeader issue={node} />
        <IssueBody issue={node} />
      </div>
      {/* Row 1-2, Col 2: sidebar (spans both rows on desktop) */}
      <div className="lg:row-span-2">
        <IssueSidebar issue={node} />
      </div>
      {/* Row 2, Col 1: comments */}
      <div className="min-w-0">
        <CommentThread issue={node} />
      </div>
    </div>
  );
}
