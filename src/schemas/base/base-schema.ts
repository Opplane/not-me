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
  filterFn: (input: unknown) => ValidationResult<BaseType>;
};

type ShapeFilter<Type> = {
  type: FilterType.Shape;
  filterFn: (
    input: Type,
    options: ValidationOptions | undefined
  ) => ValidationResult<Type>;
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

function isNullable(input: unknown): input is undefined | null {
  return input === undefined || input === null;
}

export abstract class BaseSchema<
  BaseType,
  Shape extends BaseType = BaseType,
  NT extends NullableTypes = DefaultNullableTypes
> implements Schema<Shape | NT> {
  _rejectedValueValidationResult!: RejectedValueValidationResult;
  _acceptedValueValidationResult!: AcceptedValueValidationResult<Shape | NT>;
  _nullableTypes!: NT;

  private baseTypeFilter: BaseTypeFilter<BaseType>;
  private shapeFilters: ShapeFilter<BaseType>[] = [];
  private testFilters: Array<TestFilter<InferType<this>>> = [];
  private transformFilters: Array<TransformFilter<InferType<this>, any>> = [];

  private allowNull = false;
  private isNullMessage?: string;
  private allowUndefined = true;
  private isUndefinedMessage?: string;

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
          this.isUndefinedMessage ||
            DefaultErrorMessagesManager.getDefaultMessages()?.base
              ?.isUndefined ||
            "Input is not defined",
        ],
      } as this["_rejectedValueValidationResult"];
    }

    if (_currentValue === null && !this.allowNull) {
      return {
        errors: true,
        messagesTree: [
          this.isNullMessage ||
            DefaultErrorMessagesManager.getDefaultMessages()?.base?.isNull ||
            "Input is null",
        ],
      } as this["_rejectedValueValidationResult"];
    }

    if (!isNullable(_currentValue)) {
      /*
      BASE TYPE FILTER
    */
      let typedValue = _currentValue;

      const typeFilterResponse = this.baseTypeFilter.filterFn(typedValue);

      if (typeFilterResponse.errors) {
        return typeFilterResponse as any;
      } else {
        typedValue = typeFilterResponse.value;
      }

      /*
      SHAPE FILTERS
    */

      let shapedValue: BaseType;

      if (this.mapMode) {
        shapedValue = {} as BaseType;
        let shapedValueWithUnknownProperties = typedValue as BaseType;

        for (let i = 0; i < this.shapeFilters.length; i++) {
          const shapeFilter = this.shapeFilters[i] || throwError();

          const filterRes = shapeFilter.filterFn(
            shapedValueWithUnknownProperties,
            options
          );

          if (filterRes.errors) {
            return filterRes as this["_rejectedValueValidationResult"];
          } else {
            shapedValue = Object.assign(shapedValue, filterRes.value);
            shapedValueWithUnknownProperties = Object.assign(
              shapedValueWithUnknownProperties,
              filterRes.value
            );
          }
        }
      } else {
        shapedValue = typedValue as BaseType;

        for (let i = 0; i < this.shapeFilters.length; i++) {
          const shapeFilter = this.shapeFilters[i] || throwError();

          const filterRes = shapeFilter.filterFn(shapedValue, options);

          if (filterRes.errors) {
            return filterRes as this["_rejectedValueValidationResult"];
          } else {
            shapedValue = filterRes.value;
          }
        }
      }

      _currentValue = shapedValue;
    }

    /*
      TEST FILTERS
    */
    let testFiltersErrors: string[] = [];

    for (const testFilter of this.testFilters) {
      const valid = testFilter.filterFn(_currentValue as InferType<this>);

      if (!valid) {
        const messages = [testFilter.getMessage()];

        if (options?.abortEarly) {
          return {
            errors: true,
            messagesTree: messages as this["_rejectedValueValidationResult"]["messagesTree"],
          };
        } else {
          testFiltersErrors = [...testFiltersErrors, ...messages];
          continue;
        }
      } else {
        continue;
      }
    }

    if (testFiltersErrors.length > 0) {
      return {
        errors: true,
        messagesTree: testFiltersErrors,
      } as this["_rejectedValueValidationResult"];
    }

    /*
      TRANSFORM FILTERS
    */

    for (const transformFilter of this.transformFilters) {
      _currentValue = transformFilter.filterFn(
        _currentValue as InferType<this>
      );
    }

    return {
      errors: false,
      value: _currentValue,
    } as this["_acceptedValueValidationResult"];
  }

  nullable(message?: string): BaseSchema<BaseType, Shape, NT | null> {
    this.allowNull = true;
    this.isNullMessage = message;
    return this as any;
  }
  defined(
    message?: string
  ): BaseSchema<BaseType, Shape, Exclude<NT, undefined>> {
    this.allowUndefined = false;
    this.isUndefinedMessage = message;
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
    this.testFilters.push({
      type: FilterType.Test,
      filterFn,
      getMessage,
    });
  }

  private addTransformFilter(
    filterFn: TransformFilter<InferType<this>, any>["filterFn"]
  ): void {
    this.transformFilters.push({
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

    return this as any;
  }
}
