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
  number: Partial<{
    notANumber: string;
    isNotInteger: string;
  }>;
  string: Partial<{
    notAString: string;
    notFilled: string;
  }>;
  date: Partial<{
    notADate: string;
    invalidDate: string;
  }>;
  boolean: Partial<{
    notABoolean: string;
  }>;
}>;
