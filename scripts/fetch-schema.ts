import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql';
import { writeFileSync } from 'node:fs';

async function fetchSchema() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const response = await fetch(`${url}/graphql/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });

  const json = await response.json() as { data?: Parameters<typeof buildClientSchema>[0]; errors?: unknown[] };

  if (json.errors) {
    console.error('Introspection errors:', json.errors);
    process.exit(1);
  }

  if (!json.data) {
    console.error('No data in response');
    process.exit(1);
  }

  const schema = buildClientSchema(json.data);
  writeFileSync('./schema.graphql', printSchema(schema));
  console.log('schema.graphql updated');
}

fetchSchema();
