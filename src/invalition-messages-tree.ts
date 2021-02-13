import { getTypesafeObjectFieldPath, TypesafeObjectFieldPathPointer } from "./utils/get-typesafe-object-field-path";
import lodashGet from 'lodash/get'

type ArrayFieldInvalidationMessages<T> = undefined | string | {
  [key: number]: InvalitionMessagesTree<T> | undefined;
};

type ObjectFieldInvalidationMessages<T extends { [key: string]: unknown }> = undefined | string | {
  [K in keyof T]: InvalitionMessagesTree<T[K]> | undefined;
};

export type InvalitionMessagesTree<T> = T extends Array<unknown>
  ? ArrayFieldInvalidationMessages<T[number]>
  : T extends { [key: string]: unknown }
  ? ObjectFieldInvalidationMessages<T>
  : string[] | undefined;


export function getErrorMessagesFromField<Output>(messagesTree: InvalitionMessagesTree<Output>, pathGetter: (pointer: TypesafeObjectFieldPathPointer<InvalitionMessagesTree<Output>>) => string) {
  const path = pathGetter(getTypesafeObjectFieldPath(messagesTree))
  
  return lodashGet(messagesTree, path)
}
