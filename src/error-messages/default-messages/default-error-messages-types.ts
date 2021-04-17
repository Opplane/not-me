type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type DefaultErrorMessages = DeepPartial<{
  object: {
    notAnObject: string;
  };
  array: {
    notAnArray: string;
    lessThanMinimum: string;
    moreThanMaximum: string;
  };
  base: {
    isNull: string;
    isUndefined: string;
  };
  equals: {
    notEqual: string;
  };
  number: {
    notANumber: string;
    isNotInteger: string;
  };
  string: {
    notAString: string;
    notFilled: string;
  };
  date: {
    notADate: string;
    invalidDate: string;
  };
  boolean: {
    notABoolean: string;
  };
}>;
