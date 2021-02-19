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
  private valueFilters: Array<
    TestFilter<Shape> | TransformFilter<any, any>
  > = [];

  private allowNull = false;
  private isNullMessage?: string;
  private allowUndefined = true;
  private isUndefinedMessage?: string;
  private defaultValue?: InferType<this>;

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
    if (input === undefined) {
      if (this.defaultValue !== undefined) {
        return {
          errors: false,
          value: this.defaultValue,
        };
      }

      if (!this.allowUndefined) {
        return {
          errors: true,
          messagesTree: [
            this.isUndefinedMessage ||
              DefaultErrorMessagesManager.getDefaultMessages()?.base
                ?.isUndefined ||
              "Input is not defined",
          ],
        } as this["_rejectedValueValidationResult"];
      } else {
        return {
          errors: false,
          value: input as any,
        };
      }
    }

    if (input === null) {
      if (!this.allowNull) {
        return {
          errors: true,
          messagesTree: [
            this.isNullMessage ||
              DefaultErrorMessagesManager.getDefaultMessages()?.base?.isNull ||
              "Input is null",
          ],
        } as this["_rejectedValueValidationResult"];
      } else {
        return {
          errors: false,
          value: input as any,
        };
      }
    }

    /*
      BASE TYPE FILTER
    */
    let typedValue = input;

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

    /*
      VALUE FILTERS
    */
    let value = shapedValue as Shape;

    let valueFilterErrors: string[] = [];

    for (const valueFilter of this.valueFilters) {
      if (valueFilter.type === FilterType.Test) {
        const valid = valueFilter.filterFn(value);

        if (!valid) {
          const messages = [valueFilter.getMessage()];

          if (options?.abortEarly) {
            return {
              errors: true,
              messagesTree: messages as this["_rejectedValueValidationResult"]["messagesTree"],
            };
          } else {
            valueFilterErrors = [...valueFilterErrors, ...messages];
            continue;
          }
        } else {
          continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (valueFilter.type === FilterType.Transform) {
        value = valueFilter.filterFn(value);
        continue;
      }

      throw new Error();
    }

    if (valueFilterErrors.length > 0) {
      return {
        errors: true,
        messagesTree: valueFilterErrors,
      } as this["_rejectedValueValidationResult"];
    } else {
      return {
        errors: false,
        value,
      };
    }
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
    filterFn: (value: Shape) => boolean,
    getMessage: () => string
  ): void {
    this.valueFilters.push({
      type: FilterType.Test,
      filterFn,
      getMessage,
    });
  }

  private addTransformFilter(
    filterFn: TransformFilter<Shape, any>["filterFn"]
  ): void {
    this.valueFilters.push({
      type: FilterType.Transform,
      filterFn,
    });
  }

  test(
    testFunction: (value: Shape) => boolean,
    message: string | (() => string)
  ): this {
    this.addTestFilter(
      testFunction,
      typeof message === "string" ? () => message : message
    );
    return this;
  }

  transform<TransformFunction extends (value: Shape) => unknown>(
    testFunction: TransformFunction
  ): BaseSchema<
    ReturnType<TransformFunction>,
    ReturnType<TransformFunction>,
    NT
  > {
    this.addTransformFilter(testFunction);

    return this as any;
  }

  default(value: InferType<this>): this {
    this.defaultValue = value;

    return this;
  }
}
