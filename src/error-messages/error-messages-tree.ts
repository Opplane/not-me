import {
  getTypesafeObjectFieldPath,
  TypesafeObjectFieldPathPointer,
} from "../utils/get-typesafe-object-field-path";
import lodashGet from "lodash/get";

export type ErrorMessagesTree =
  | undefined
  | string[]
  | { [key: string]: ErrorMessagesTree }
  | { [key: number]: ErrorMessagesTree };

export function getErrorMessagesFromField<Output>(
  messagesTree: ErrorMessagesTree,
  pathGetter: (pointer: TypesafeObjectFieldPathPointer<Output>) => string
): string[] | undefined {
  const path = pathGetter(getTypesafeObjectFieldPath(messagesTree));

  const node: ErrorMessagesTree = lodashGet(messagesTree, path);

  if (node instanceof Array) {
    return node;
  } else {
    return undefined;
  }
}
