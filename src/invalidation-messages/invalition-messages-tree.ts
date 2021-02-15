import {
  getTypesafeObjectFieldPath,
  TypesafeObjectFieldPathPointer,
} from "../utils/get-typesafe-object-field-path";
import lodashGet from "lodash/get";

export type InvalitionMessagesTree =
  | undefined
  | string[]
  | { [key: string]: InvalitionMessagesTree }
  | { [key: number]: InvalitionMessagesTree };

export function getErrorMessagesFromField<Output>(
  messagesTree: InvalitionMessagesTree,
  pathGetter: (pointer: TypesafeObjectFieldPathPointer<Output>) => string
): string[] | undefined {
  const path = pathGetter(getTypesafeObjectFieldPath(messagesTree));

  const node: InvalitionMessagesTree = lodashGet(messagesTree, path);

  if (node instanceof Array) {
    return node;
  } else {
    return undefined;
  }
}
