import { InvalidFieldMessagesTree } from "../invalid-inputs";

export type ValidationOptions = { abortEarly?: boolean } | undefined;

type FilterUnknownResult =
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

type AsyncFilter = (
  input: any,
  options?: ValidationOptions
) => Promise<FilterUnknownResult>;
type SyncFilter = (
  input: any,
  options?: ValidationOptions
) => FilterUnknownResult;
type Filter = AsyncFilter | SyncFilter;

export abstract class Schema<Output> {
  abstract _outputType: Output;
  protected filters: Filter[] = [];

  validateSync(
    input: unknown,
    options?: ValidationOptions
  ): FilterResult<Output> {
    let currentValue = input;

    for (const filter of this.filters) {
      const filterRes = filter(currentValue);

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

  async validate(
    input: unknown,
    options?: ValidationOptions
  ): Promise<FilterResult<Output>> {
    let currentValue = input;

    for (const filter of this.filters) {
      const promisableFilterRes = filter(currentValue);

      let filterRes;

      if (promisableFilterRes instanceof Promise) {
        filterRes = await promisableFilterRes;
      } else {
        filterRes = promisableFilterRes;
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
