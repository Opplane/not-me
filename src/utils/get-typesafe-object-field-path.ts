export type TypesafeObjectFieldPathPointer<T> = {
  and<K extends keyof T>(keyOrIndex: K): TypesafeObjectFieldPathPointer<T[K]>;
  end(): string;
};

function getDeeperTypesafeObjectFieldPath<T>(previousRecursionPath: string) {
  return <K extends keyof T>(
    keyOrIndex: K
  ): TypesafeObjectFieldPathPointer<T[K]> => {
    let newPath: string;

    if (typeof keyOrIndex === "number") {
      newPath = `${previousRecursionPath}[${keyOrIndex}]`;
    } else if (typeof keyOrIndex === "string") {
      newPath = `${previousRecursionPath}${
        previousRecursionPath === "" ? "" : "."
      }${keyOrIndex}`;
    } else {
      throw new Error();
    }

    return {
      and: getDeeperTypesafeObjectFieldPath<T[K]>(newPath),
      end: () => newPath,
    };
  };
}

/*
    README:
    getTypesafeObjectFieldPath(values).and("houses").and(index).and("loanInterestPurchase").end()
    will return a lodash-like object path "houses[0].loanInterestPurchase"
    suitable for field names in most form libraries and also ensuring type safety
    if any of the key names in the object tree changes.

    Be sure to call .end() when you're done composing the path and want the path string returned.
*/
export function getTypesafeObjectFieldPath<T>(
  // Infer generic from argument, if any, to avoid having to pass a generic type manually
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _values?: T
): Pick<TypesafeObjectFieldPathPointer<T>, "and"> {
  return {
    and: getDeeperTypesafeObjectFieldPath<T>(""),
  };
}
