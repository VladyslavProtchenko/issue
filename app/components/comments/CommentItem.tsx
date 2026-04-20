'use client';

import { useFragment, graphql } from 'react-relay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CommentItem_comment$key } from '../../__generated__/CommentItem_comment.graphql';

const fragment = graphql`
  fragment CommentItem_comment on comments {
    nodeId
    body
    created_at
    author {
      name
      avatar_url
    }
  }
`;

export function CommentItem({ comment }: { comment: CommentItem_comment$key }) {
  const data = useFragment(fragment, comment);

  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={data.author?.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs">
          {(data.author?.name ?? 'U').slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold">{data.author?.name ?? 'Unknown'}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(data.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{data.body}</p>
      </div>
    </div>
  );
}
