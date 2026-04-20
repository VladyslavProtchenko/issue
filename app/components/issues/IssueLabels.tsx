'use client';

import { useFragment, useMutation, graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLabels } from '@/app/hooks/useLabels';
import type { IssueLabels_issue$key } from '../../__generated__/IssueLabels_issue.graphql';
import type { IssueLabelsAddMutation } from '../../__generated__/IssueLabelsAddMutation.graphql';
import type { IssueLabelsRemoveMutation } from '../../__generated__/IssueLabelsRemoveMutation.graphql';

import type { Label as LabelRow } from '@/app/hooks/useLabels';

function pgNodeId(table: string, id: string): string {
  return btoa(JSON.stringify(['public', table, id]));
}

const fragment = graphql`
  fragment IssueLabels_issue on issues {
    nodeId
    id
    issue_labelsCollection(first: 5) @connection(key: "IssueLabels_issue_labelsCollection", filters: []) {
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
`;

const addMutation = graphql`
  mutation IssueLabelsAddMutation($issueId: UUID!, $labelId: UUID!) {
    insertIntoissue_labelsCollection(objects: [{ issue_id: $issueId, label_id: $labelId }]) {
      records {
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
`;

const removeMutation = graphql`
  mutation IssueLabelsRemoveMutation($issueId: UUID!, $labelId: UUID!) {
    deleteFromissue_labelsCollection(
      filter: { issue_id: { eq: $issueId }, label_id: { eq: $labelId } }
    ) {
      records {
        nodeId
      }
    }
  }
`;

export function IssueLabels({ issue }: { issue: IssueLabels_issue$key }) {
  const data = useFragment(fragment, issue);
  const allLabels = useLabels();
  const [commitAdd] = useMutation<IssueLabelsAddMutation>(addMutation);
  const [commitRemove] = useMutation<IssueLabelsRemoveMutation>(removeMutation);

  const assignedLabelIds = new Set(
    data.issue_labelsCollection?.edges.map((e) => e.node.labels?.id).filter(Boolean) ?? [],
  );

  const availableLabels = allLabels.filter((l) => !assignedLabelIds.has(l.id));

  function handleAdd(label: LabelRow) {
    const tempId = `client:temp:issue_label:${label.id}`;
    const labelNodeId = pgNodeId('labels', label.id);

    commitAdd({
      variables: { issueId: data.id, labelId: label.id },
      optimisticUpdater: (store) => {
        const issueRecord = store.get(data.nodeId);
        if (!issueRecord) return;
        const connection = ConnectionHandler.getConnection(issueRecord, 'IssueLabels_issue_labelsCollection');
        if (!connection) return;

        const issueLabelRecord = store.create(tempId, 'issue_labels');
        issueLabelRecord.setValue(tempId, 'nodeId');

        const labelRecord = store.get(labelNodeId) ?? store.create(labelNodeId, 'labels');
        labelRecord.setValue(label.id, 'id');
        labelRecord.setValue(labelNodeId, 'nodeId');
        labelRecord.setValue(label.name, 'name');
        labelRecord.setValue(label.color, 'color');
        issueLabelRecord.setLinkedRecord(labelRecord, 'labels');

        const edge = ConnectionHandler.createEdge(store, connection, issueLabelRecord, 'issue_labelsEdge');
        ConnectionHandler.insertEdgeAfter(connection, edge);
      },
      updater: (store, response) => {
        const nodeId = response?.insertIntoissue_labelsCollection?.records[0]?.nodeId;
        if (!nodeId) return;
        const newRecord = store.get(nodeId);
        if (!newRecord) return;
        const issueRecord = store.get(data.nodeId);
        if (!issueRecord) return;
        const connection = ConnectionHandler.getConnection(issueRecord, 'IssueLabels_issue_labelsCollection');
        if (!connection) return;
        const edge = ConnectionHandler.createEdge(store, connection, newRecord, 'issue_labelsEdge');
        ConnectionHandler.insertEdgeAfter(connection, edge);
      },
      onError: () => { toast.error('Failed to add label.'); },
    });
  }

  function handleRemove(issueLabelNodeId: string, labelId: string) {
    commitRemove({
      variables: { issueId: data.id, labelId },
      optimisticUpdater: (store) => {
        const issueRecord = store.get(data.nodeId);
        if (!issueRecord) return;
        const connection = ConnectionHandler.getConnection(issueRecord, 'IssueLabels_issue_labelsCollection');
        if (!connection) return;
        ConnectionHandler.deleteNode(connection, issueLabelNodeId);
      },
      updater: (store, response) => {
        const nodeId = response?.deleteFromissue_labelsCollection?.records[0]?.nodeId;
        if (!nodeId) return;
        const issueRecord = store.get(data.nodeId);
        if (!issueRecord) return;
        const connection = ConnectionHandler.getConnection(issueRecord, 'IssueLabels_issue_labelsCollection');
        if (!connection) return;
        ConnectionHandler.deleteNode(connection, nodeId);
      },
      onError: () => { toast.error('Failed to remove label.'); },
    });
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
        Labels
      </p>

      <div className="flex flex-wrap gap-1 mb-2">
        {data.issue_labelsCollection?.edges.map(({ node }) => (
          <span
            key={node.nodeId}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${node.labels?.color}22`,
              color: node.labels?.color,
            }}
          >
            {node.labels?.name}
            <button
              onClick={() => handleRemove(node.nodeId, node.labels!.id)}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {availableLabels.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              + Add label
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            {availableLabels.map((l) => (
              <DropdownMenuItem
                key={l.id}
                onSelect={() => handleAdd(l)}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: l.color }}
                />
                {l.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
