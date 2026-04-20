'use client';

import { useLazyLoadQuery, graphql } from 'react-relay';
import { IssueListContent } from './IssueListContent';
import type { IssueListQuery, issuesFilter } from '../../__generated__/IssueListQuery.graphql';

const query = graphql`
  query IssueListQuery($first: Int!, $after: Cursor, $filter: issuesFilter) {
    ...IssueListContent_query @arguments(first: $first, after: $after, filter: $filter)
  }
`;

export function IssueList({ filter }: { filter?: issuesFilter }) {
  const data = useLazyLoadQuery<IssueListQuery>(query, { first: 10, filter });
  return <IssueListContent queryRef={data} />;
}
