export type DefaultErrorMessages = Partial<{
  object: Partial<{
    notAnObject: string;
  }>;
  objectOf: Partial<{
    fieldDoesNotMatch: string;
  }>;
  array: Partial<{
    notAnArray: string;
    fieldDoesNotMatch: string;
    lessThanMinimum: string;
    moreThanMaximum: string;
  }>;
  base: Partial<{
    isNull: string;
    isUndefined: string;
  }>;
  equals: Partial<{
    notEqual: string;
  }>;
}>;
