export type DefaultInvalidationMessages = Partial<{
  object: Partial<{
    notAnObject: string;
  }>;
  base: Partial<{
    isNull: string;
    isUndefined: string;
  }>,
  equals: Partial<{
    notEqual: string
  }>
}>;
