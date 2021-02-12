import { InvalidFieldMessagesTree } from "../invalid-inputs";

export type ValidationOptions = { abortEarly?: boolean } | undefined;

export type FilterUnknownResult =
  | {
      invalid: true;
      messagesTree: unknown;
    }
  | {
      invalid: false;
      value: unknown;
    };

type FilterResult<Output> =
  | {
      invalid: true;
      messagesTree: InvalidFieldMessagesTree<Output>;
    }
  | {
      invalid: false;
      value: Output;
    };

type Filter = (
  input: any,
  options: ValidationOptions | undefined
) => FilterUnknownResult;

export abstract class Schema<Output> {
  _outputType!: Output;
  protected filters: Filter[] = [];

  validateSync(
    input: unknown,
    options: ValidationOptions = undefined
  ): FilterResult<Output> {
    let currentValue = input;

    for (const filter of this.filters) {
      const filterRes = filter(currentValue, options);

      if (filterRes instanceof Promise) {
        throw new Error(
          "Async validations are not allowed when calling validateSync()"
        );
      }

      if (filterRes.invalid) {
        return filterRes as FilterResult<Output>;
      }
    }

    return {
      invalid: false,
      value: currentValue,
    } as FilterResult<Output>;
  }
}
