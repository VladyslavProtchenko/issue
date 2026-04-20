'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePaginationFragment, useMutation, graphql } from 'react-relay';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown } from 'lucide-react';
import { STATUS_LABEL, STATUS_CLASS, PRIORITY_LABEL } from '@/app/lib/constants';
import { useInfiniteScroll } from '@/app/hooks/useInfiniteScroll';
import type { IssueListContent_query$key } from '../../__generated__/IssueListContent_query.graphql';
import type {
  IssueListContentUpdateStatusMutation,
  issue_status,
} from '../../__generated__/IssueListContentUpdateStatusMutation.graphql';

const fragment = graphql`
  fragment IssueListContent_query on Query
    @refetchable(queryName: "IssueListContentPaginationQuery")
    @argumentDefinitions(
      first: { type: "Int", defaultValue: 10 }
      after: { type: "Cursor" }
      filter: { type: "issuesFilter" }
    ) {
    issuesCollection(
      first: $first
      after: $after
      filter: $filter
      orderBy: [{ created_at: DescNullsLast }]
    ) @connection(key: "IssueListContent_issuesCollection") {
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
          issue_labelsCollection {
            edges {
              node {
                labels {
                  id
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

const updateStatusMutation = graphql`
  mutation IssueListContentUpdateStatusMutation($nodeId: ID!, $status: issue_status!) {
    updateissuesCollection(
      filter: { nodeId: { eq: $nodeId } }
      set: { status: $status }
    ) {
      affectedCount
      records {
        nodeId
        status
      }
    }
  }
`;

const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as issue_status[];

export function IssueListContent({ queryRef }: { queryRef: IssueListContent_query$key }) {
  const router = useRouter();
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(fragment, queryRef);
  const [commitUpdateStatus] = useMutation<IssueListContentUpdateStatusMutation>(updateStatusMutation);
  const edges = data.issuesCollection?.edges ?? [];

  const handleIntersect = useCallback(() => {
    if (!isLoadingNext) loadNext(10);
  }, [loadNext, isLoadingNext]);

  const loaderRef = useInfiniteScroll(handleIntersect, hasNext);

  function handleStatusChange(nodeId: string, newStatus: issue_status, prevStatus: string) {
    commitUpdateStatus({
      variables: { nodeId, status: newStatus },
      optimisticResponse: {
        updateissuesCollection: {
          affectedCount: 1,
          records: [{ nodeId, status: newStatus }],
        },
      },
      onCompleted: (response) => {
        if (response.updateissuesCollection.affectedCount === 0) {
          toast.error(`Failed to update status. Reverted to "${STATUS_LABEL[prevStatus]}".`);
        }
      },
      onError: () => {
        toast.error(`Failed to update status. Reverted to "${STATUS_LABEL[prevStatus]}".`);
      },
    });
  }

  const empty = (
    <p className="py-8 text-center text-sm text-muted-foreground">No issues found</p>
  );

  return (
    <div className="w-full">
      {/* Mobile: card list */}
      <div className="flex flex-col divide-y rounded-lg border sm:hidden">
        {edges.length === 0 ? empty : edges.map(({ node }) => (
          <div
            key={node.nodeId}
            className="flex flex-col gap-2 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push(`/issues/${node.id}`)}
          >
            {/* Status + priority */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 transition-opacity ${STATUS_CLASS[node.status] ?? ''}`}>
                    {STATUS_LABEL[node.status] ?? node.status}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                  {STATUS_OPTIONS.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onSelect={() => handleStatusChange(node.nodeId, s, node.status)}
                      className="text-sm"
                    >
                      <Badge variant="outline" className={`text-xs px-2 py-0.5 ${STATUS_CLASS[s] ?? ''}`}>
                        {STATUS_LABEL[s]}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-xs text-muted-foreground">{PRIORITY_LABEL[node.priority] ?? node.priority}</span>
            </div>
            {/* Title + assignee + date */}
            <div>
              <p className="text-sm font-medium leading-snug">{node.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {node.assignee && (
                  <>
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={node.assignee.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[9px]">
                        {node.assignee.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{node.assignee.name}</span>
                    <span>·</span>
                  </>
                )}
                <span>{new Date(node.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            {/* Labels */}
            {(node.issue_labelsCollection?.edges.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1">
                {node.issue_labelsCollection?.edges.map(({ node: il }) => (
                  <span
                    key={il.labels?.id}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${il.labels?.color}22`, color: il.labels?.color }}
                  >
                    {il.labels?.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {['Issue', 'Labels', 'Priority', 'Status'].map((col) => (
                <TableHead key={col} className="text-base">{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {edges.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No issues found
                </TableCell>
              </TableRow>
            )}
            {edges.map(({ node }) => (
              <TableRow
                key={node.nodeId}
                className="cursor-pointer h-16"
                onClick={() => router.push(`/issues/${node.id}`)}
              >
                <TableCell>
                  <p className="text-base font-medium">{node.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {node.assignee && (
                      <>
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={node.assignee.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[10px]">
                            {node.assignee.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{node.assignee.name}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>{new Date(node.created_at).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {node.issue_labelsCollection?.edges.map(({ node: il }) => (
                      <span
                        key={il.labels?.id}
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: `${il.labels?.color}22`, color: il.labels?.color }}
                      >
                        {il.labels?.name}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-base text-muted-foreground">
                  {PRIORITY_LABEL[node.priority] ?? node.priority}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium hover:opacity-80 transition-opacity ${STATUS_CLASS[node.status] ?? ''}`}>
                        {STATUS_LABEL[node.status] ?? node.status}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      {STATUS_OPTIONS.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onSelect={() => handleStatusChange(node.nodeId, s, node.status)}
                          className="text-sm"
                        >
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${STATUS_CLASS[s] ?? ''}`}>
                            {STATUS_LABEL[s]}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div ref={loaderRef} />
      {isLoadingNext && (
        <div className="border-t py-4 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  );
}
