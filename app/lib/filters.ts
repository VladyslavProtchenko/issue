import type { IssueFiltersValue } from '../components/issues/IssueFilters';
import type { issuesFilter } from '../__generated__/IssueListQuery.graphql';

export function buildIssuesFilter(filters: IssueFiltersValue, labelIssueIds?: string[]): issuesFilter | undefined {
  const conditions: issuesFilter[] = [];

  if (filters.statuses.length > 0) {
    conditions.push({ status: { in: filters.statuses } });
  }

  if (filters.priorities.length > 0) {
    conditions.push({ priority: { in: filters.priorities } });
  }

  if (filters.labelIds.length > 0) {
    // No issues match → use impossible UUID so 0 results are returned
    const ids = labelIssueIds && labelIssueIds.length > 0
      ? labelIssueIds
      : ['00000000-0000-0000-0000-000000000000'];
    conditions.push({ id: { in: ids } });
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return { and: conditions };
}
