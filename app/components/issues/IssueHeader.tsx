'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useFragment, useMutation, graphql } from 'react-relay';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABEL, STATUS_CLASS, PRIORITY_LABEL } from '@/app/lib/constants';
import { issueTitleSchema } from '@/app/lib/validation';
import type { IssueHeader_issue$key } from '../../__generated__/IssueHeader_issue.graphql';
import type { IssueHeaderUpdateTitleMutation } from '../../__generated__/IssueHeaderUpdateTitleMutation.graphql';

const fragment = graphql`
  fragment IssueHeader_issue on issues {
    nodeId
    title
    status
    priority
    created_at
  }
`;

const updateTitleMutation = graphql`
  mutation IssueHeaderUpdateTitleMutation($nodeId: ID!, $title: String!) {
    updateissuesCollection(
      filter: { nodeId: { eq: $nodeId } }
      set: { title: $title }
    ) {
      records {
        nodeId
        title
      }
    }
  }
`;

export function IssueHeader({ issue }: { issue: IssueHeader_issue$key }) {
  const data = useFragment(fragment, issue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [commit] = useMutation<IssueHeaderUpdateTitleMutation>(updateTitleMutation);

  function startEdit() {
    setDraft(data.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function save() {
    const trimmed = draft.trim();
    setEditing(false);
    const result = issueTitleSchema.safeParse({ title: trimmed });
    if (!result.success || trimmed === data.title) return;
    commit({
      variables: { nodeId: data.nodeId, title: trimmed },
      optimisticResponse: {
        updateissuesCollection: { records: [{ nodeId: data.nodeId, title: trimmed }] },
      },
      onError: () => { toast.error('Failed to update title.'); },
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') setEditing(false);
  }

  return (
    <div className="mb-6">
      <Link href="/" className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
        ← Back to issues
      </Link>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className="w-full text-2xl font-semibold mb-3 bg-transparent border-b border-border outline-none"
          autoFocus
        />
      ) : (
        <div className="group flex items-center gap-2 mb-3">
          <h1 className="text-2xl font-semibold">{data.title}</h1>
          <button
            onClick={startEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Badge variant="outline" className={`text-sm px-3 py-1 ${STATUS_CLASS[data.status] ?? ''}`}>
          {STATUS_LABEL[data.status] ?? data.status}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {PRIORITY_LABEL[data.priority] ?? data.priority} priority
        </span>
        <span className="text-sm text-muted-foreground">
          {new Date(data.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
