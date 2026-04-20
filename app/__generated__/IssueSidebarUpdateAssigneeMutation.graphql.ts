/**
 * @generated SignedSource<<1392b3ffbbb8e5e7768680ef655fc3ee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type IssueSidebarUpdateAssigneeMutation$variables = {
  assigneeId?: string | null | undefined;
  nodeId: string;
};
export type IssueSidebarUpdateAssigneeMutation$data = {
  readonly updateissuesCollection: {
    readonly affectedCount: number;
    readonly records: ReadonlyArray<{
      readonly assignee: {
        readonly avatar_url: string | null | undefined;
        readonly name: string;
        readonly nodeId: string;
      } | null | undefined;
      readonly assignee_id: string | null | undefined;
      readonly nodeId: string;
    }>;
  };
};
export type IssueSidebarUpdateAssigneeMutation = {
  response: IssueSidebarUpdateAssigneeMutation$data;
  variables: IssueSidebarUpdateAssigneeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "assigneeId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "nodeId"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nodeId",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "eq",
                "variableName": "nodeId"
              }
            ],
            "kind": "ObjectValue",
            "name": "nodeId"
          }
        ],
        "kind": "ObjectValue",
        "name": "filter"
      },
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "assignee_id",
            "variableName": "assigneeId"
          }
        ],
        "kind": "ObjectValue",
        "name": "set"
      }
    ],
    "concreteType": "issuesUpdateResponse",
    "kind": "LinkedField",
    "name": "updateissuesCollection",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "affectedCount",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "issues",
        "kind": "LinkedField",
        "name": "records",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "assignee_id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "users",
            "kind": "LinkedField",
            "name": "assignee",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "avatar_url",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueSidebarUpdateAssigneeMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "IssueSidebarUpdateAssigneeMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "76e92e69dde82b2596f223f7f82e5ec0",
    "id": null,
    "metadata": {},
    "name": "IssueSidebarUpdateAssigneeMutation",
    "operationKind": "mutation",
    "text": "mutation IssueSidebarUpdateAssigneeMutation(\n  $nodeId: ID!\n  $assigneeId: UUID\n) {\n  updateissuesCollection(filter: {nodeId: {eq: $nodeId}}, set: {assignee_id: $assigneeId}) {\n    affectedCount\n    records {\n      nodeId\n      assignee_id\n      assignee {\n        nodeId\n        name\n        avatar_url\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f48870751e827fd2e492d31125ee0348";

export default node;
