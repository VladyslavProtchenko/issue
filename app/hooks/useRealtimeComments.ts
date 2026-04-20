'use client';

import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { commitLocalUpdate, ConnectionHandler } from 'relay-runtime';
import { getSupabaseClient } from '@/app/lib/supabase/client';

// pg_graphql nodeId format: base64(JSON.stringify(["public", table, pkValue]))
function pgNodeId(table: string, id: string): string {
  return btoa(JSON.stringify(['public', table, id]));
}

type RealtimeComment = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  author: { name: string; avatar_url: string | null } | null;
};

export function useRealtimeComments(issueId: string, issueNodeId: string) {
  const environment = useRelayEnvironment();

  useEffect(() => {
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel(`comments:${issueId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `issue_id=eq.${issueId}` },
        async (payload) => {
          const raw = payload.new as { id: string; body: string; created_at: string; author_id: string };

          const { data: author } = await supabase
            .from('users')
            .select('name, avatar_url')
            .eq('id', raw.author_id)
            .single();

          const comment: RealtimeComment = { ...raw, author };
          const nodeId = pgNodeId('comments', comment.id);

          commitLocalUpdate(environment, (store) => {
            const issueRecord = store.get(issueNodeId);
            if (!issueRecord) return;

            const connection = ConnectionHandler.getConnection(issueRecord, 'CommentThread_comments');
            if (!connection) return;

            // Skip if already present in the connection (added by mutation updater)
            const edges = connection.getLinkedRecords('edges') ?? [];
            const inConnection = edges.some(
              (edge) => edge?.getLinkedRecord('node')?.getValue('nodeId') === nodeId,
            );
            if (inConnection) return;

            // Create or reuse the store record
            const record = store.get(nodeId) ?? store.create(nodeId, 'comments');
            record.setValue(nodeId, 'nodeId');
            record.setValue(comment.body, 'body');
            record.setValue(comment.created_at, 'created_at');

            if (comment.author) {
              const authorNodeId = pgNodeId('users', comment.author_id);
              const authorRecord = store.get(authorNodeId) ?? store.create(authorNodeId, 'users');
              authorRecord.setValue(comment.author.name, 'name');
              authorRecord.setValue(comment.author.avatar_url ?? null, 'avatar_url');
              record.setLinkedRecord(authorRecord, 'author');
            }

            const edge = ConnectionHandler.createEdge(store, connection, record, 'commentsEdge');
            ConnectionHandler.insertEdgeBefore(connection, edge);
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [issueId, issueNodeId, environment]);
}
