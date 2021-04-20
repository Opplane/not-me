import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { throwError } from "../../utils/throw-error";
import {
  DefaultNullableTypes,
  NullableTypes,
} from "../../utils/types/nullable-types";
import {
  ValidationResult,
  Schema,
  ValidationOptions,
  AcceptedValueValidationResult,
  RejectedValueValidationResult,
  InferType,
} from "../schema";

enum FilterType {
  BaseType = "base-type",
  Shape = "shape",
  Test = "test",
  Transform = "transform",
}

type BaseTypeFilter<BaseType> = {
  type: FilterType.BaseType;
  filterFn: (
    input: unknown,
    options: ValidationOptions
  ) => ValidationResult<BaseType>;
};

type ShapeFilter<Type> = {
  type: FilterType.Shape;
  filterFn: (input: Type, options: ValidationOptions) => ValidationResult<Type>;
};

type TestFilter<V> = {
  type: FilterType.Test;
  filterFn: (value: V) => boolean;
  getMessage: () => string;
};

type TransformFilter<V, R> = {
  type: FilterType.Transform;
  filterFn: (value: V) => R;
};

export abstract class BaseSchema<
  BaseType,
  Shape extends BaseType = BaseType,
  NT extends NullableTypes = DefaultNullableTypes
> implements Schema<Shape | NT> {
  _outputType!: Shape | NT;
  _nullableTypes!: NT;

  private baseTypeFilter: BaseTypeFilter<BaseType>;
  private shapeFilters: ShapeFilter<BaseType>[] = [];
  private otherFilters: Array<
    TestFilter<InferType<this>> | TransformFilter<InferType<this>, unknown>
  > = [];

  private allowNull = false;
  private nullNotAllowedMessage?: string;

  private allowUndefined = true;
  private undefinedNotAllowedMessage?: string;
  protected allowUndefinedInBaseTypeFilter = false;

  protected mapMode?: boolean;

  constructor(typeFilterFn: BaseTypeFilter<BaseType>["filterFn"]) {
    this.baseTypeFilter = {
      type: FilterType.BaseType,
      filterFn: typeFilterFn,
    };
  }

  validate(
    input: unknown,
    options: ValidationOptions = undefined
  ): ValidationResult<InferType<this>> {
    let _currentValue = input;

    if (_currentValue === undefined && !this.allowUndefined) {
      return {
        errors: true,
        messagesTree: [
          this.undefinedNotAllowedMessage ||
            DefaultErrorMessagesManager.getDefaultMessages().base
              ?.isUndefined ||
            "Input is not defined",
        ],
      } as RejectedValueValidationResult;
    }

    if (_currentValue === null && !this.allowNull) {
      return {
        errors: true,
        messagesTree: [
          this.nullNotAllowedMessage ||
            DefaultErrorMessagesManager.getDefaultMessages().base?.isNull ||
            "Input is null",
        ],
      } as RejectedValueValidationResult;
    }

    // Use loose equality operator '!=' to exclude null and undefined
    const notNullable = _currentValue != null;

    if (
      notNullable ||
      (_currentValue === undefined && this.allowUndefinedInBaseTypeFilter)
    ) {
      /*
      BASE TYPE FILTER
    */

      const typeFilterResponse = this.baseTypeFilter.filterFn(
        _currentValue,
        options
      );

      if (typeFilterResponse.errors) {
        return typeFilterResponse;
      } else {
        _currentValue = typeFilterResponse.value;
      }
    }

    if (notNullable) {
      /*
      SHAPE FILTERS
    */

      let shapedValue: BaseType;

      if (this.mapMode) {
        shapedValue = {} as BaseType;
        let shapedValueWithUnknownProperties = _currentValue as BaseType;

        for (let i = 0; i < this.shapeFilters.length; i++) {
          const shapeFilter = this.shapeFilters[i] || throwError();

          const filterRes = shapeFilter.filterFn(
            shapedValueWithUnknownProperties,
            options
          );

          if (filterRes.errors) {
            return filterRes;
          } else {
            shapedValue = Object.assign(shapedValue, filterRes.value);
            shapedValueWithUnknownProperties = Object.assign(
              shapedValueWithUnknownProperties,
              filterRes.value
            );
          }
        }
      } else {
        shapedValue = _currentValue as BaseType;

        for (let i = 0; i < this.shapeFilters.length; i++) {
          const shapeFilter = this.shapeFilters[i] || throwError();

          const filterRes = shapeFilter.filterFn(shapedValue, options);

          if (filterRes.errors) {
            return filterRes;
          } else {
            shapedValue = filterRes.value;
          }
        }
      }

      _currentValue = shapedValue;
    }

    /*
      OTHER FILTERS
    */
    let testFiltersErrors: string[] = [];

    for (const filter of this.otherFilters) {
      if (filter.type === FilterType.Test) {
        const valid = filter.filterFn(_currentValue as InferType<this>);

        if (!valid) {
          const messages = [filter.getMessage()];

          if (options?.abortEarly) {
            return {
              errors: true,
              messagesTree: messages,
            };
          } else {
            testFiltersErrors = [...testFiltersErrors, ...messages];
            continue;
          }
        } else {
          continue;
        }
      } else {
        _currentValue = filter.filterFn(_currentValue as InferType<this>);
      }
    }

    if (testFiltersErrors.length > 0) {
      return {
        errors: true,
        messagesTree: testFiltersErrors,
      };
    }

    return {
      errors: false,
      value: _currentValue,
    } as AcceptedValueValidationResult<InferType<this>>;
  }

  setMessageForWhenNullIsRejected(message: string): this {
    this.nullNotAllowedMessage = message;
    return this;
  }

  nullable(): BaseSchema<BaseType, Shape, NT | null> {
    this.allowNull = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
  defined(
    message?: string
  ): BaseSchema<BaseType, Shape, Exclude<NT, undefined>> {
    if (!this.allowUndefinedInBaseTypeFilter) {
      this.allowUndefined = false;
    }

    this.undefinedNotAllowedMessage = message;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  protected addShapeFilter(filterFn: ShapeFilter<BaseType>["filterFn"]): void {
    this.shapeFilters.push({
      type: FilterType.Shape,
      filterFn,
    });
  }

  private addTestFilter(
    filterFn: (value: InferType<this>) => boolean,
    getMessage: () => string
  ): void {
    this.otherFilters.push({
      type: FilterType.Test,
      filterFn,
      getMessage,
    });
  }

  private addTransformFilter(
    filterFn: TransformFilter<InferType<this>, unknown>["filterFn"]
  ): void {
    this.otherFilters.push({
      type: FilterType.Transform,
      filterFn,
    });
  }

  test(
    testFunction: (value: InferType<this>) => boolean,
    message: string | (() => string)
  ): Schema<InferType<this>> {
    this.addTestFilter(
      testFunction,
      typeof message === "string" ? () => message : message
    );
    return this;
  }

  transform<TransformFunction extends (value: InferType<this>) => unknown>(
    transformFunction: TransformFunction
  ): Schema<ReturnType<TransformFunction>> {
    this.addTransformFilter(transformFunction);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}
