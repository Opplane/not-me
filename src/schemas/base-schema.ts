import { DefaultInvalidationMessagesManager } from "src/default-messages/default-invalition-messages-manager";
import { NullableTypes } from "src/utils/types/nullable-types";
import { FilterResult, Schema, ValidationOptions } from "./schema";

enum FilterType {
  Type = 'type',
  Shape = 'shape',
  Test = 'test',
  Transform = 'transform'
}

type TypeFilter<Type> = {
  type: FilterType.Type,
  filterFn: (input: unknown, options: ValidationOptions | undefined) => FilterResult<Type>,
}

type ShapeFilter<Type> = {
  type: FilterType.Shape,
  filterFn: (input: Type, options: ValidationOptions | undefined) => FilterResult<Type>,
}

type TestFilter<V> = {
  type: FilterType.Test,
  filterFn: (value: V, options: ValidationOptions | undefined) => boolean,
  message: string
}

type TransformFilter<V, R> = {
  type: FilterType.Transform,
  filterFn: (value: V) => R
}



export abstract class BaseSchema<Type, Shape extends Type, NT extends NullableTypes> implements Schema<Shape | NT> {
  _outputType!: Shape | NT;

  private typeFilter: TypeFilter<Type>;
  private shapeFilters: ShapeFilter<Type>[] = []
  private valueFilters: Array<TestFilter<Shape> | TransformFilter<any, any>> = [];

  private allowNull = false;
  private isNullMessage?: string;
  private allowUndefined = true;
  private isUndefinedMessage?: string;

  constructor(
    typeFilterFn: TypeFilter<Type>['filterFn']
  ) {
    this.typeFilter = {
      type: FilterType.Type,
      filterFn: typeFilterFn
    }
  }

  validate(
    input: unknown,
    options: ValidationOptions = undefined
  ): FilterResult<Shape> {
    if (input === undefined) {
      if (!this.allowUndefined) {
        return {
          invalid: true,
          messagesTree: [this.isUndefinedMessage || DefaultInvalidationMessagesManager.getDefaultMessages()?.base?.isUndefined || "Input is null"] as any,
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
          messagesTree: [this.isNullMessage || DefaultInvalidationMessagesManager.getDefaultMessages()?.base?.isNull || "Input is null"] as any,
        };
      } else {
        return {
          invalid: false,
          value: input as any,
        };
      }
    }

    /*
      TYPE FILTER
    */
    let typedValue = input;

    const typeFilterResponse = this.typeFilter.filterFn(typedValue, options)

    if(typeFilterResponse.invalid) {
      return typeFilterResponse as any
    } else {
      typedValue = typeFilterResponse.value
    }

    /*
      SHAPE FILTERS
    */
    
    let shapedValue = typedValue as Type

    for (const shapeFilter of this.shapeFilters) {
      const filterRes = shapeFilter.filterFn(shapedValue, options);

      if (filterRes.invalid) {
        return filterRes as any;
      } else if (filterRes.value == null) {
        return filterRes as any
      }
    }

    /*
      VALUE FILTERS
    */
    let value = shapedValue as Shape;

    for (const valueFilter of this.valueFilters) {
      if(valueFilter.type === FilterType.Test) {
        const valid = valueFilter.filterFn(value, options);

        if(valid || (!valid && !options?.abortEarly)) {
          continue;
        } else {
          return {
            invalid: true,
            messagesTree: [valueFilter.message] as any
          }
        }
      } else if (valueFilter.type === FilterType.Transform) {
        value = valueFilter.filterFn(value)
      }
      throw new Error()
    }

    return {
      invalid: false,
      value,
    };
  }

  protected nullable(message?: string): BaseSchema<Type, Shape, NullableTypes | null> {
    this.allowNull = true;
    this.isNullMessage = message;
    return this as any
  }
  protected defined(message?: string): BaseSchema<Type, Shape, Exclude<NullableTypes, undefined>> {
    this.allowUndefined = false
    this.isUndefinedMessage = message
    return this as any
  }

  addShapeFilter(filterFn: ShapeFilter<Type>['filterFn']) {
    this.shapeFilters.push({
      type: FilterType.Shape,
      filterFn
    })
  }

  addTestFilter(filterFn: (value: Shape) => boolean, message: string) {
    this.valueFilters.push({
      type: FilterType.Test,
      filterFn,
      message
    })
  }
  addTransformFilter(filterFn: TransformFilter<Shape, any>['filterFn'],) {
    this.valueFilters.push({
      type: FilterType.Transform,
      filterFn,
    })
  }


}
