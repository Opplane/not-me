import { DefaultInvalidationMessagesManager } from "src/invalidation-messages/default-messages/default-invalition-messages-manager";
import { NullableTypes } from "src/utils/types/nullable-types";
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
  message: string;
};

type TransformFilter<V, R> = {
  type: FilterType.Transform;
  filterFn: (value: V) => R;
};

export abstract class BaseSchema<
  BaseType,
  Shape extends BaseType,
  NT extends NullableTypes
> implements Schema<Shape | NT> {
  _outputType!: Shape | NT;

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
          invalid: true,
          messagesTree: [
            this.isUndefinedMessage ||
              DefaultInvalidationMessagesManager.getDefaultMessages()?.base
                ?.isUndefined ||
              "Input is not defined",
          ] as any,
        };
      } else {
        return {
          invalid: false,
          value: input as any,
        };
      }
    }

    if (input === null) {
      if (!this.allowNull) {
        return {
          invalid: true,
          messagesTree: [
            this.isNullMessage ||
              DefaultInvalidationMessagesManager.getDefaultMessages()?.base
                ?.isNull ||
              "Input is null",
          ] as any,
        };
      } else {
        return {
          invalid: false,
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

    if (typeFilterResponse.invalid) {
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

      if (filterRes.invalid) {
        return filterRes as any;
      } else if (filterRes.value == null) {
        return filterRes as any;
      }
    }

    /*
      VALUE FILTERS
    */
    let value = shapedValue as Shape;

    for (const valueFilter of this.valueFilters) {
      if (valueFilter.type === FilterType.Test) {
        const valid = valueFilter.filterFn(value, options);

        if (valid || (!valid && !options?.abortEarly)) {
          continue;
        } else {
          return {
            invalid: true,
            messagesTree: [valueFilter.message] as any,
          };
        }
      } else if (valueFilter.type === FilterType.Transform) {
        value = valueFilter.filterFn(value);
      }
      throw new Error();
    }

    return {
      invalid: false,
      value,
    };
  }

  protected nullable(
    message?: string
  ): BaseSchema<BaseType, Shape, NullableTypes | null> {
    this.allowNull = true;
    this.isNullMessage = message;
    return this as any;
  }
  protected defined(
    message?: string
  ): BaseSchema<BaseType, Shape, Exclude<NullableTypes, undefined>> {
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

  private addTestFilter(filterFn: (value: Shape) => boolean, message: string) {
    this.valueFilters.push({
      type: FilterType.Test,
      filterFn,
      message,
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
    message: string
  ): Schema<Shape | NT> {
    this.addTestFilter(testFunction, message);
    return this as any;
  }

  transform<TransformFunction extends (value: Shape) => unknown>(
    testFunction: TransformFunction
  ): Schema<ReturnType<TransformFunction>> {
    this.addTransformFilter(testFunction);

    return this as any;
  }
}
