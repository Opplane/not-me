import { FilterResult, Schema, ValidationOptions } from "./schema";

type FilterAnyResult =
  | {
      invalid: true;
      messagesTree: any;
    }
  | {
      invalid: false;
      value: any;
    };

enum FilterType {
  Type = 'type',
  Shape = 'shape',
  Test = 'test',
  Transform = 'transform'
}

type TypeFilter = {
  type: FilterType.Type,
  filterFn: (input: unknown, options: ValidationOptions | undefined) => FilterAnyResult,
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

export type NullableTypes = undefined | null
export type DefaultNullableTypes = undefined

export abstract class BaseSchema<Type, Shape, NT extends NullableTypes> implements Schema<Shape | NT> {
  _outputType!: Shape;

  private typeFilter: TypeFilter;
  private shapeFilters: ShapeFilter<any>[] = []
  private valueFilters: Array<TestFilter<any> | TransformFilter<any, any>> = [];

  private allowNull = false;
  private allowUndefined = true;

  constructor(
    typeFilterFn: TypeFilter['filterFn']
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
          messagesTree: "Input is not defined",
        } as FilterAnyResult;
      } else {
        return {
          invalid: false,
          value: input,
        } as FilterAnyResult;
      }
    }

    if (input === null) {
      if (!this.allowNull) {
        return {
          invalid: true,
          messagesTree: "Input is null",
        } as FilterAnyResult;
      } else {
        return {
          invalid: false,
          value: input,
        } as FilterAnyResult;
      }
    }

    /*
      TYPE FILTER
    */
    let currentValue = input;

    const typeFilterResponse = this.typeFilter.filterFn(currentValue, options)

    if(typeFilterResponse.invalid) {
      return typeFilterResponse
    } else {
      currentValue = typeFilterResponse.value
    }

    /*
      SHAPE FILTERS
    */
    for (const shapeFilter of this.shapeFilters) {
      const filterRes = shapeFilter.filterFn(currentValue, options);

      if (filterRes.invalid) {
        return filterRes;
      } else if (filterRes.value == null) {
        return filterRes
      }
    }

    /*
      VALUE FILTERS
    */
    for (const valueFilter of this.valueFilters) {
      if(valueFilter.type === FilterType.Test) {
        const valid = valueFilter.filterFn(currentValue, options);

        if(valid || (!valid && !options?.abortEarly)) {
          continue;
        } else {
          return {
            invalid: true,
            messagesTree: valueFilter.message
          }
        }
      } else if (valueFilter.type === FilterType.Transform) {
        currentValue = valueFilter.filterFn(currentValue)
      }
      throw new Error()
    }

    return {
      invalid: false,
      value: currentValue,
    } as FilterAnyResult;
  }

  protected nullable(): BaseSchema<Type, Shape, NullableTypes | null> {
    this.allowNull = true;
    return this as any
  }
  protected defined(): BaseSchema<Type, Shape, Exclude<NullableTypes, undefined>> {
    this.allowUndefined = false
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
