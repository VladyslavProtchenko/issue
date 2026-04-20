'use client';

import { useState } from 'react';
import { useFragment, useMutation, graphql } from 'react-relay';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { issueDescriptionSchema } from '@/app/lib/validation';
import type { IssueBody_issue$key } from '../../__generated__/IssueBody_issue.graphql';
import type { IssueBodyUpdateDescriptionMutation } from '../../__generated__/IssueBodyUpdateDescriptionMutation.graphql';

const fragment = graphql`
  fragment IssueBody_issue on issues {
    nodeId
    description
  }
`;

const updateDescriptionMutation = graphql`
  mutation IssueBodyUpdateDescriptionMutation($nodeId: ID!, $description: String!) {
    updateissuesCollection(
      filter: { nodeId: { eq: $nodeId } }
      set: { description: $description }
    ) {
      records {
        nodeId
        description
      }
    }
  }
`;

export function IssueBody({ issue }: { issue: IssueBody_issue$key }) {
  const data = useFragment(fragment, issue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [commit] = useMutation<IssueBodyUpdateDescriptionMutation>(updateDescriptionMutation);

  function startEdit() {
    setDraft(data.description ?? '');
    setEditing(true);
  }

  function save() {
    const trimmed = draft.trim();
    setEditing(false);
    const result = issueDescriptionSchema.safeParse({ description: trimmed });
    if (!result.success || trimmed === (data.description ?? '').trim()) return;
    commit({
      variables: { nodeId: data.nodeId, description: trimmed },
      optimisticResponse: {
        updateissuesCollection: { records: [{ nodeId: data.nodeId, description: trimmed }] },
      },
      onError: () => { toast.error('Failed to update description.'); },
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setEditing(false);
  }

  return (
    <div className="px-4 mb-6">
      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            autoFocus
            placeholder="Add a description..."
            className="resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="group relative min-h-[60px]">
          {data.description ? (
            <p className="text-base whitespace-pre-wrap">{data.description}</p>
          ) : (
            <p className="text-muted-foreground italic">Add a description...</p>
          )}
          <button
            onClick={startEdit}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
