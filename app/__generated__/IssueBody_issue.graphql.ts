/**
 * @generated SignedSource<<448c08b4d76a64f7fb45812e83eab0a7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBody_issue$data = {
  readonly description: string | null | undefined;
  readonly nodeId: string;
  readonly " $fragmentType": "IssueBody_issue";
};
export type IssueBody_issue$key = {
  readonly " $data"?: IssueBody_issue$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBody_issue">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBody_issue",
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
  "type": "issues",
  "abstractKey": null
};

(node as any).hash = "cc05b5881e65fa2a0f7c6d8bd7080482";

export default node;
