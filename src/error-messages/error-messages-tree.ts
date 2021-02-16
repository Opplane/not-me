import {
  getTypesafeObjectFieldPath,
  TypesafeObjectFieldPathPointer,
} from "../utils/get-typesafe-object-field-path";
import lodashGet from "lodash/get";

export type ErrorMessagesTree =
  | undefined
  | string[]
  | { [key: string]: ErrorMessagesTree };

export function getErrorMessagesFromField<Output>(
  messagesTree: ErrorMessagesTree,
  pathGetter: (pointer: TypesafeObjectFieldPathPointer<Output>) => string
): string[] | undefined {
  const path = pathGetter({
    ...getTypesafeObjectFieldPath(messagesTree),
    end: () => "",
  });

  let node: ErrorMessagesTree;

  if (path === "") {
    node = messagesTree;
  } else {
    node = lodashGet(messagesTree, path);
  }

  if (node instanceof Array) {
    return node;
  } else {
    return undefined;
  }
}
