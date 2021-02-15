import { DefaultErrorMessagesManager } from "src/error-messages/default-messages/default-error-messages-manager";
import { ErrorMessagesTree } from "src/error-messages/error-messages-tree";
import {
  DefaultNullableTypes,
  NullableTypes,
} from "src/utils/types/nullable-types";
import { FilterResult, Schema, ValidationOptions } from "./schema";

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
    options: ValidationOptions | undefined
  ) => FilterResult<BaseType>;
};

type ShapeFilter<Type> = {
  type: FilterType.Shape;
  filterFn: (
    input: Type,
    options: ValidationOptions | undefined
  ) => FilterResult<Type>;
};

type TestFilter<V> = {
  type: FilterType.Test;
  filterFn: (value: V, options: ValidationOptions | undefined) => boolean;
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
  private valueFilters: Array<
    TestFilter<Shape> | TransformFilter<any, any>
  > = [];

  private allowNull = false;
  private isNullMessage?: string;
  private allowUndefined = true;
  private isUndefinedMessage?: string;

  constructor(typeFilterFn: BaseTypeFilter<BaseType>["filterFn"]) {
    this.baseTypeFilter = {
      type: FilterType.BaseType,
      filterFn: typeFilterFn,
    };
  }

  validate(
    input: unknown,
    options: ValidationOptions = undefined
  ): FilterResult<Shape> {
    if (input === undefined) {
      if (!this.allowUndefined) {
        return {
          errors: true,
          messagesTree: [
            this.isUndefinedMessage ||
              DefaultErrorMessagesManager.getDefaultMessages()?.base
                ?.isUndefined ||
              "Input is not defined",
          ],
        };
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
        };
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

    const typeFilterResponse = this.baseTypeFilter.filterFn(
      typedValue,
      options
    );

    if (typeFilterResponse.errors) {
      return typeFilterResponse as any;
    } else {
      typedValue = typeFilterResponse.value;
    }

    /*
      SHAPE FILTERS
    */

    let shapedValue = typedValue as BaseType;

    for (const shapeFilter of this.shapeFilters) {
      const filterRes = shapeFilter.filterFn(shapedValue, options);

      if (filterRes.errors) {
        return filterRes;
      } else if (filterRes.value == null) {
        return filterRes as any;
      }
    }

    /*
      VALUE FILTERS
    */
    let value = shapedValue as Shape;

    let valueFilterErrors: string[] = [];

    for (const valueFilter of this.valueFilters) {
      if (valueFilter.type === FilterType.Test) {
        const valid = valueFilter.filterFn(value, options);

        if (!valid) {
          const messages = [valueFilter.getMessage()];

          if (options?.abortEarly) {
            return {
              errors: true,
              messagesTree: messages,
            };
          } else {
            valueFilterErrors = [...valueFilterErrors, ...messages];
            continue;
          }
        } else {
          continue;
        }
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
      };
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

  protected addShapeFilter(filterFn: ShapeFilter<BaseType>["filterFn"]) {
    this.shapeFilters.push({
      type: FilterType.Shape,
      filterFn,
    });
  }

  private addTestFilter(
    filterFn: (value: Shape) => boolean,
    getMessage: () => string
  ) {
    this.valueFilters.push({
      type: FilterType.Test,
      filterFn,
      getMessage,
    });
  }

  private addTransformFilter(
    filterFn: TransformFilter<Shape, any>["filterFn"]
  ) {
    this.valueFilters.push({
      type: FilterType.Transform,
      filterFn,
    });
  }

  test(
    testFunction: (value: Shape) => boolean,
    message: string | (() => string)
  ): BaseSchema<Shape | NT> {
    this.addTestFilter(
      testFunction,
      typeof message === "string" ? () => message : message
    );
    return this as any;
  }

  transform<TransformFunction extends (value: Shape) => unknown>(
    testFunction: TransformFunction
  ): BaseSchema<ReturnType<TransformFunction>> {
    this.addTransformFilter(testFunction);

    return this as any;
  }
}
