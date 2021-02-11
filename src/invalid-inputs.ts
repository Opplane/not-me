type ArrayFieldValidationError<T> = Array<InvalidFieldMessagesTree<T>>;

type ObjectFieldValidationError<T extends { [key: string]: unknown }> = {
  [K in keyof T]: InvalidFieldMessagesTree<T[K]> | undefined;
};

export type InvalidFieldMessagesTree<T> = T extends Array<unknown>
  ? ArrayFieldValidationError<T[number]>
  : T extends { [key: string]: unknown }
  ? ObjectFieldValidationError<T>
  : undefined | string[];
