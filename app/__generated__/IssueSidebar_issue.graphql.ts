/**
 * @generated SignedSource<<82c2a64d1af9d8a2a5b89bcb769e0b75>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type issue_priority = "high" | "low" | "medium" | "none" | "urgent" | "%future added value";
export type issue_status = "backlog" | "cancelled" | "done" | "in_progress" | "todo" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type IssueSidebar_issue$data = {
  readonly assignee: {
    readonly avatar_url: string | null | undefined;
    readonly name: string;
    readonly nodeId: string;
  } | null | undefined;
  readonly assignee_id: string | null | undefined;
  readonly id: string;
  readonly nodeId: string;
  readonly priority: issue_priority;
  readonly status: issue_status;
  readonly " $fragmentSpreads": FragmentRefs<"IssueLabels_issue">;
  readonly " $fragmentType": "IssueSidebar_issue";
};
export type IssueSidebar_issue$key = {
  readonly " $data"?: IssueSidebar_issue$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueSidebar_issue">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nodeId",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueSidebar_issue",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "priority",
      "storageKey": null
    },
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
        (v0/*: any*/),
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueLabels_issue"
    }
  ],
  "type": "issues",
  "abstractKey": null
};
})();

(node as any).hash = "a74230fab7bc9b254a4bc4f3e318bd46";

export default node;
