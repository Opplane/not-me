import {
  getTypesafeObjectFieldPath,
  TypesafeObjectFieldPathPointer,
} from "../utils/get-typesafe-object-field-path";
import lodashGet from "lodash/get";

export type AnyErrorMessagesTree<IsRootOfTree extends true | false = false> =
  | (IsRootOfTree extends true ? never : undefined)
  | string[]
  | { [key: string]: AnyErrorMessagesTree };

export function getErrorMessagesFromField<Output>(
  messagesTree: AnyErrorMessagesTree,
  pathGetter: (pointer: TypesafeObjectFieldPathPointer<Output>) => string
): string[] | undefined {
  const path = pathGetter({
    ...getTypesafeObjectFieldPath(messagesTree),
    end: () => "",
  });

  let node: AnyErrorMessagesTree;

  if (path === "") {
    node = messagesTree;
  } else {
    node = lodashGet(messagesTree, path) as AnyErrorMessagesTree;
  }

  if (node instanceof Array) {
    return node;
  } else {
    return undefined;
  }
}
