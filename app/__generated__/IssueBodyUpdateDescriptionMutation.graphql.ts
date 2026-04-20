/**
 * @generated SignedSource<<1106abbaff39140d1789a4fe69e9160c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type IssueBodyUpdateDescriptionMutation$variables = {
  description: string;
  nodeId: string;
};
export type IssueBodyUpdateDescriptionMutation$data = {
  readonly updateissuesCollection: {
    readonly records: ReadonlyArray<{
      readonly description: string | null | undefined;
      readonly nodeId: string;
    }>;
  };
};
export type IssueBodyUpdateDescriptionMutation = {
  response: IssueBodyUpdateDescriptionMutation$data;
  variables: IssueBodyUpdateDescriptionMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "description"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "nodeId"
},
v2 = [
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
            "name": "description",
            "variableName": "description"
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
            "name": "description",
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
    "name": "IssueBodyUpdateDescriptionMutation",
    "selections": (v2/*: any*/),
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
    "name": "IssueBodyUpdateDescriptionMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "6f5b13fb54c3504024d7be7bb2198a00",
    "id": null,
    "metadata": {},
    "name": "IssueBodyUpdateDescriptionMutation",
    "operationKind": "mutation",
    "text": "mutation IssueBodyUpdateDescriptionMutation(\n  $nodeId: ID!\n  $description: String!\n) {\n  updateissuesCollection(filter: {nodeId: {eq: $nodeId}}, set: {description: $description}) {\n    records {\n      nodeId\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c0a04a97877df482b86219ab49acfbda";

export default node;
