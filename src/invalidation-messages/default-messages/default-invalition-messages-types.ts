export type DefaultInvalidationMessages = Partial<{
  object: Partial<{
    notAnObject: string;
  }>;
  objectOf: Partial<{
    fieldDoesNotMatch: string;
  }>;
  base: Partial<{
    isNull: string;
    isUndefined: string;
  }>;
  equals: Partial<{
    notEqual: string;
  }>;
}>;
