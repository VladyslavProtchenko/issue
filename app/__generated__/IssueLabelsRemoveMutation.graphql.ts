/**
 * @generated SignedSource<<8eea391a253895392865106816b61fd6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type IssueLabelsRemoveMutation$variables = {
  issueId: string;
  labelId: string;
};
export type IssueLabelsRemoveMutation$data = {
  readonly deleteFromissue_labelsCollection: {
    readonly records: ReadonlyArray<{
      readonly nodeId: string;
    }>;
  };
};
export type IssueLabelsRemoveMutation = {
  response: IssueLabelsRemoveMutation$data;
  variables: IssueLabelsRemoveMutation$variables;
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
                "variableName": "issueId"
              }
            ],
            "kind": "ObjectValue",
            "name": "issue_id"
          },
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "eq",
                "variableName": "labelId"
              }
            ],
            "kind": "ObjectValue",
            "name": "label_id"
          }
        ],
        "kind": "ObjectValue",
        "name": "filter"
      }
    ],
    "concreteType": "issue_labelsDeleteResponse",
    "kind": "LinkedField",
    "name": "deleteFromissue_labelsCollection",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "nodeId",
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
    "name": "IssueLabelsRemoveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "IssueLabelsRemoveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f8184a15cc84362eb2b77cab0bfb842e",
    "id": null,
    "metadata": {},
    "name": "IssueLabelsRemoveMutation",
    "operationKind": "mutation",
    "text": "mutation IssueLabelsRemoveMutation(\n  $issueId: UUID!\n  $labelId: UUID!\n) {\n  deleteFromissue_labelsCollection(filter: {issue_id: {eq: $issueId}, label_id: {eq: $labelId}}) {\n    records {\n      nodeId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "625d5c5fac1658ddc2dd0d8a14d1fea6";

export default node;
