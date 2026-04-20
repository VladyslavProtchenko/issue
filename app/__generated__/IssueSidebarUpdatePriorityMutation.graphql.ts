/**
 * @generated SignedSource<<6d963b1b21f75411df88a78d9faae033>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type issue_priority = "high" | "low" | "medium" | "none" | "urgent" | "%future added value";
export type IssueSidebarUpdatePriorityMutation$variables = {
  nodeId: string;
  priority: issue_priority;
};
export type IssueSidebarUpdatePriorityMutation$data = {
  readonly updateissuesCollection: {
    readonly affectedCount: number;
    readonly records: ReadonlyArray<{
      readonly nodeId: string;
      readonly priority: issue_priority;
    }>;
  };
};
export type IssueSidebarUpdatePriorityMutation = {
  response: IssueSidebarUpdatePriorityMutation$data;
  variables: IssueSidebarUpdatePriorityMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "nodeId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "priority"
  }
],
v1 = [
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
            "name": "priority",
            "variableName": "priority"
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "nodeId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "priority",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueSidebarUpdatePriorityMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "IssueSidebarUpdatePriorityMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e600696c84f6a01250c7285757edee06",
    "id": null,
    "metadata": {},
    "name": "IssueSidebarUpdatePriorityMutation",
    "operationKind": "mutation",
    "text": "mutation IssueSidebarUpdatePriorityMutation(\n  $nodeId: ID!\n  $priority: issue_priority!\n) {\n  updateissuesCollection(filter: {nodeId: {eq: $nodeId}}, set: {priority: $priority}) {\n    affectedCount\n    records {\n      nodeId\n      priority\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e1263ece4cfc4a6ba616d7437ddcb94f";

export default node;
