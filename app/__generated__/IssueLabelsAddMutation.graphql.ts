/**
 * @generated SignedSource<<231e2a59afd1630db5cd1473d653de7c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type IssueLabelsAddMutation$variables = {
  issueId: string;
  labelId: string;
};
export type IssueLabelsAddMutation$data = {
  readonly insertIntoissue_labelsCollection: {
    readonly records: ReadonlyArray<{
      readonly labels: {
        readonly color: string;
        readonly id: string;
        readonly name: string;
        readonly nodeId: string;
      } | null | undefined;
      readonly nodeId: string;
    }>;
  } | null | undefined;
};
export type IssueLabelsAddMutation = {
  response: IssueLabelsAddMutation$data;
  variables: IssueLabelsAddMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "issueId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "labelId"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nodeId",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "items": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "issue_id",
                "variableName": "issueId"
              },
              {
                "kind": "Variable",
                "name": "label_id",
                "variableName": "labelId"
              }
            ],
            "kind": "ObjectValue",
            "name": "objects.0"
          }
        ],
        "kind": "ListValue",
        "name": "objects"
      }
    ],
    "concreteType": "issue_labelsInsertResponse",
    "kind": "LinkedField",
    "name": "insertIntoissue_labelsCollection",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "issue_labels",
        "kind": "LinkedField",
        "name": "records",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "labels",
            "kind": "LinkedField",
            "name": "labels",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              (v1/*: any*/),
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
                "name": "color",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueLabelsAddMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "IssueLabelsAddMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "44ee0b8ff1437ba2c6d1df1e79d8f58c",
    "id": null,
    "metadata": {},
    "name": "IssueLabelsAddMutation",
    "operationKind": "mutation",
    "text": "mutation IssueLabelsAddMutation(\n  $issueId: UUID!\n  $labelId: UUID!\n) {\n  insertIntoissue_labelsCollection(objects: [{issue_id: $issueId, label_id: $labelId}]) {\n    records {\n      nodeId\n      labels {\n        id\n        nodeId\n        name\n        color\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f2392f9f51ac91c6351f2477bab1e884";

export default node;
