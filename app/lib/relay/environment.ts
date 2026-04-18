import { Environment, Network, RecordSource, Store } from 'relay-runtime';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const GRAPHQL_URL = `${URL}/graphql/v1`;

async function fetchFn(request: { text: string | null }, variables: Record<string, unknown>) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({ query: request.text, variables }),
  });

  return response.json();
}

export function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
    // pg_graphql uses nodeId (base64) instead of id for the Node interface
    getDataID: (node) => (node as Record<string, unknown>).nodeId as string,
  });
}
