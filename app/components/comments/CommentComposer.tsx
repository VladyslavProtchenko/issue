'use client';

import { useState } from 'react';
import { useMutation, graphql } from 'react-relay';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import { AuthDialog } from '@/app/components/AuthDialog';
import { commentSchema } from '@/app/lib/validation';
import type { CommentComposerMutation } from '../../__generated__/CommentComposerMutation.graphql';

const mutation = graphql`
  mutation CommentComposerMutation(
    $issueId: UUID!
    $authorId: UUID!
    $body: String!
  ) {
    insertIntocommentsCollection(
      objects: [{ issue_id: $issueId, author_id: $authorId, body: $body }]
    ) {
      records {
        nodeId
        ...CommentItem_comment
      }
    }
  }
`;

export function CommentComposer({
  issueId,
  issueNodeId,
}: {
  issueId: string;
  issueNodeId: string;
}) {
  const { user } = useCurrentUser();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [commit, isInFlight] = useMutation<CommentComposerMutation>(mutation);

  if (!user) {
    return (
      <>
        <button
          onClick={() => setAuthOpen(true)}
          className="w-full text-sm text-blue-500 hover:text-blue-600 transition-colors text-center cursor-pointer"
        >
          Login to leave a comment.
        </button>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = commentSchema.safeParse({ body });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);

    commit({
      variables: { issueId, authorId: user!.id, body: result.data.body },
      onCompleted: () => {
        setBody('');
      },
      onError: () => {
        toast.error('Failed to post comment. Please try again.');
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="h-7 w-7 mt-1 shrink-0">
          <AvatarImage src={user.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Leave a comment..."
            rows={3}
            disabled={isInFlight}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isInFlight || !body.trim()}
              className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background disabled:opacity-50"
            >
              {isInFlight ? 'Posting...' : 'Comment'}
            </button>
            <span className="text-xs text-muted-foreground">{user.name}</span>
          </div>
        </div>
      </div>
    </form>
  );
}
