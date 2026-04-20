'use client';

import { useState, useEffect } from 'react';
import { useFragment, useMutation, graphql } from 'react-relay';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_LABEL, STATUS_CLASS, PRIORITY_LABEL } from '@/app/lib/constants';
import { getSupabaseClient } from '@/app/lib/supabase/client';
import { IssueLabels } from './IssueLabels';
import type { IssueSidebar_issue$key } from '../../__generated__/IssueSidebar_issue.graphql';
import type {
  IssueSidebarUpdateStatusMutation,
  issue_status,
} from '../../__generated__/IssueSidebarUpdateStatusMutation.graphql';
import type {
  IssueSidebarUpdatePriorityMutation,
  issue_priority,
} from '../../__generated__/IssueSidebarUpdatePriorityMutation.graphql';
import type { IssueSidebarUpdateAssigneeMutation } from '../../__generated__/IssueSidebarUpdateAssigneeMutation.graphql';

type UserRow = { id: string; nodeId: string; name: string; avatar_url: string | null };

function pgNodeId(table: string, id: string): string {
  return btoa(JSON.stringify(['public', table, id]));
}

const fragment = graphql`
  fragment IssueSidebar_issue on issues {
    nodeId
    id
    status
    priority
    assignee_id
    assignee {
      nodeId
      name
      avatar_url
    }
    ...IssueLabels_issue
  }
`;

const updateStatusMutation = graphql`
  mutation IssueSidebarUpdateStatusMutation($nodeId: ID!, $status: issue_status!) {
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

const updatePriorityMutation = graphql`
  mutation IssueSidebarUpdatePriorityMutation($nodeId: ID!, $priority: issue_priority!) {
    updateissuesCollection(
      filter: { nodeId: { eq: $nodeId } }
      set: { priority: $priority }
    ) {
      affectedCount
      records {
        nodeId
        priority
      }
    }
  }
`;

const updateAssigneeMutation = graphql`
  mutation IssueSidebarUpdateAssigneeMutation($nodeId: ID!, $assigneeId: UUID) {
    updateissuesCollection(
      filter: { nodeId: { eq: $nodeId } }
      set: { assignee_id: $assigneeId }
    ) {
      affectedCount
      records {
        nodeId
        assignee_id
        assignee {
          nodeId
          name
          avatar_url
        }
      }
    }
  }
`;

const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as issue_status[];
const PRIORITY_OPTIONS = Object.keys(PRIORITY_LABEL) as issue_priority[];

export function IssueSidebar({ issue }: { issue: IssueSidebar_issue$key }) {
  const data = useFragment(fragment, issue);
  const [users, setUsers] = useState<UserRow[]>([]);

  const [commitUpdateStatus, isUpdatingStatus] =
    useMutation<IssueSidebarUpdateStatusMutation>(updateStatusMutation);
  const [commitUpdatePriority, isUpdatingPriority] =
    useMutation<IssueSidebarUpdatePriorityMutation>(updatePriorityMutation);
  const [commitUpdateAssignee, isUpdatingAssignee] =
    useMutation<IssueSidebarUpdateAssigneeMutation>(updateAssigneeMutation);

  useEffect(() => {
    getSupabaseClient()
      .from('users')
      .select('id, name, avatar_url')
      .then(({ data: rows }) => {
        if (rows) {
          setUsers(rows.map((u) => ({ ...u, nodeId: pgNodeId('users', u.id) })));
        }
      });
  }, []);

  function handleStatusChange(newStatus: string) {
    const status = newStatus as issue_status;
    const prevStatus = data.status;
    commitUpdateStatus({
      variables: { nodeId: data.nodeId, status },
      optimisticResponse: {
        updateissuesCollection: { affectedCount: 1, records: [{ nodeId: data.nodeId, status }] },
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

  function handlePriorityChange(newPriority: string) {
    const priority = newPriority as issue_priority;
    const prevPriority = data.priority;
    commitUpdatePriority({
      variables: { nodeId: data.nodeId, priority },
      optimisticResponse: {
        updateissuesCollection: { affectedCount: 1, records: [{ nodeId: data.nodeId, priority }] },
      },
      onCompleted: (response) => {
        if (response.updateissuesCollection.affectedCount === 0) {
          toast.error(`Failed to update priority. Reverted to "${PRIORITY_LABEL[prevPriority]}".`);
        }
      },
      onError: () => {
        toast.error(`Failed to update priority. Reverted to "${PRIORITY_LABEL[prevPriority]}".`);
      },
    });
  }

  function handleAssigneeChange(value: string) {
    const assigneeId = value === 'unassigned' ? null : value;
    const selectedUser = assigneeId ? (users.find((u) => u.id === assigneeId) ?? null) : null;

    commitUpdateAssignee({
      variables: { nodeId: data.nodeId, assigneeId },
      optimisticResponse: {
        updateissuesCollection: {
          affectedCount: 1,
          records: [{
            nodeId: data.nodeId,
            assignee_id: assigneeId,
            assignee: selectedUser
              ? { nodeId: selectedUser.nodeId, name: selectedUser.name, avatar_url: selectedUser.avatar_url }
              : null,
          }],
        },
      },
      onCompleted: (response) => {
        if (response.updateissuesCollection.affectedCount === 0) {
          toast.error('Failed to update assignee.');
        }
      },
      onError: () => {
        toast.error('Failed to update assignee.');
      },
    });
  }

  return (
    <aside className="space-y-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
          Status
        </p>
        <Select value={data.status} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
          <SelectTrigger className={`w-full text-sm ${STATUS_CLASS[data.status] ?? ''}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="text-sm">
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
          Priority
        </p>
        <Select
          value={data.priority}
          onValueChange={handlePriorityChange}
          disabled={isUpdatingPriority}
        >
          <SelectTrigger className="w-full text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((p) => (
              <SelectItem key={p} value={p} className="text-sm">
                {PRIORITY_LABEL[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
          Assignee
        </p>
        <Select
          value={data.assignee_id ?? 'unassigned'}
          onValueChange={handleAssigneeChange}
          disabled={isUpdatingAssignee}
        >
          <SelectTrigger className="w-full text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned" className="text-sm text-muted-foreground">
              Unassigned
            </SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={u.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {u.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {u.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <IssueLabels issue={data} />
    </aside>
  );
}
