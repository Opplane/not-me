import {
  getTypesafeObjectFieldPath,
  TypesafeObjectFieldPathPointer,
} from "../utils/get-typesafe-object-field-path";
import lodashGet from "lodash/get";

export type InvalitionMessagesTree =
  | undefined
  | string[]
  | { [key: number]: InvalitionMessagesTree }
  | { [key: number]: InvalitionMessagesTree };

export function getErrorMessagesFromField<Output>(
  messagesTree: InvalitionMessagesTree,
  pathGetter: (pointer: TypesafeObjectFieldPathPointer<Output>) => string
) {
  const path = pathGetter(getTypesafeObjectFieldPath(messagesTree));

  return lodashGet(messagesTree, path);
}
