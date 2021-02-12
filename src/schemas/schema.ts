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

export type FilterResult<Output> =
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
  protected allowNull = false;
  protected allowUndefined = true;

  validateSync(
    input: unknown,
    options: ValidationOptions = undefined
  ): FilterResult<Output> {
    if (input === undefined) {
      if (!this.allowUndefined) {
        return {
          invalid: true,
          messagesTree: "Input is not defined",
        } as FilterUnknownResult as FilterResult<Output>;
      } else {
        return {
          invalid: false,
          value: input,
        } as FilterUnknownResult as  FilterResult<Output>;
      }
    }

    if (input === null) {
      if (!this.allowNull) {
        return {
          invalid: true,
          messagesTree: "Input is null",
        } as FilterUnknownResult as  FilterResult<Output>;
      }
    }

    let currentValue = input;

    for (const filter of this.filters) {
      const filterRes = filter(currentValue, options);

      if (filterRes.invalid) {
        return filterRes as FilterResult<Output>;
      } else if (filterRes.value == null) {
        return filterRes as FilterResult<Output>
      }
    }

    return {
      invalid: false,
      value: currentValue,
    } as FilterResult<Output>;
  }

  abstract nullable(): Schema<any>
  abstract defined(): Schema<any>
}
