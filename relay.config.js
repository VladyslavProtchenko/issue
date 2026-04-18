/** @type {import('relay-compiler').Config} */
module.exports = {
  src: './app',
  language: 'typescript',
  schema: './schema.graphql',
  artifactDirectory: './app/__generated__',
  excludes: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],

  // pg_graphql uses nodeId instead of id for the Node interface
  schemaConfig: {
    nodeInterfaceIdField: 'nodeId',
    nodeInterfaceIdVariableName: 'nodeId',
  },

  // pg_graphql custom scalars → TypeScript types
  customScalarTypes: {
    UUID: 'string',
    BigInt: 'string',
    BigFloat: 'string',
    Opaque: 'string',
    Datetime: 'string',
    JSON: 'string',
    Cursor: 'string',
  },

  eagerEsModules: false,
};
