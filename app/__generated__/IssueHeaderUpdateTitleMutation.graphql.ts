/**
 * @generated SignedSource<<586e866cf3711084097c94fcc13b2df2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type IssueHeaderUpdateTitleMutation$variables = {
  nodeId: string;
  title: string;
};
export type IssueHeaderUpdateTitleMutation$data = {
  readonly updateissuesCollection: {
    readonly records: ReadonlyArray<{
      readonly nodeId: string;
      readonly title: string;
    }>;
  };
};
export type IssueHeaderUpdateTitleMutation = {
  response: IssueHeaderUpdateTitleMutation$data;
  variables: IssueHeaderUpdateTitleMutation$variables;
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
    "name": "title"
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
            "name": "title",
            "variableName": "title"
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
            "name": "title",
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
    "name": "IssueHeaderUpdateTitleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "IssueHeaderUpdateTitleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "47fea32c1d34f7849d34fab3245958a7",
    "id": null,
    "metadata": {},
    "name": "IssueHeaderUpdateTitleMutation",
    "operationKind": "mutation",
    "text": "mutation IssueHeaderUpdateTitleMutation(\n  $nodeId: ID!\n  $title: String!\n) {\n  updateissuesCollection(filter: {nodeId: {eq: $nodeId}}, set: {title: $title}) {\n    records {\n      nodeId\n      title\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5c4ae2face27123f0402a7a4d68c2002";

export default node;
