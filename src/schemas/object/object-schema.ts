import { InvalitionMessagesTree } from "src/invalition-messages-tree";
import { throwError } from "src/utils/throw-error";
import {
  BaseSchema, NullableTypes, DefaultNullableTypes,
} from "./base-schema";
import { FilterResult, InferType, Schema, ValidationOptions } from "./schema";

type SchemaObjToShape<SchemasObj extends { [key: string]: BaseSchema<any, any, any> | undefined }> = {
  [K in keyof SchemasObj]: SchemasObj[K] extends BaseSchema<any, any, any> ? InferType<SchemasObj[K]> : never;
};

type SchemaType = { [key: string]: unknown }

export class ObjectSchema<
  CurrentSchemaObj extends { [key: string]: BaseSchema<any, any, any> },
  NT extends NullableTypes = DefaultNullableTypes
> extends BaseSchema<
  SchemaType,
  SchemaObjToShape<CurrentSchemaObj>,
  NT
> {
  constructor(private schemaObj: CurrentSchemaObj) {
    super((input: unknown, options) => {
      if (typeof input !== "object") {
        return {
          invalid: true,
          messagesTree: "Input is not an object",
        };
      }

      return {
        invalid: false,
        value: input,
      };
    });

    this.addShapeFilter((value: SchemaType, options) => {
      return this.validateObj(schemaObj, value, options);
    })
  }

  private validateObj<
    PartialSchemaObj extends {
      [key: string]: Schema<any> | undefined;
    }
  >(
    schemaObj: PartialSchemaObj,
    value: SchemaType,
    options: ValidationOptions
  ): FilterResult<{[key: string]: unknown}> {
    const finalValue: SchemaType = {};

    const invalidFieldsErrorMessages: InvalitionMessagesTree<SchemaType> = {};

    for (const fieldKey of Object.keys(schemaObj)) {
      const fieldSchema = schemaObj[fieldKey] || throwError();
      const fieldResult = fieldSchema.validate(value[fieldKey], options);

      if (fieldResult.invalid) {
        if (options?.abortEarly) {
          return {
            invalid: true,
            messagesTree: {
              [fieldKey]: fieldResult.messagesTree,
            },
          };
        } else {
          invalidFieldsErrorMessages[fieldKey] = fieldResult.messagesTree;
        }
      } else {
        finalValue[fieldKey] = fieldResult.value;
      }
    }

    if (Object.keys(invalidFieldsErrorMessages).length > 0) {
      return {
        invalid: true,
        messagesTree: invalidFieldsErrorMessages,
      };
    } else {
      return {
        invalid: false,
        value: finalValue,
      };
    }
  }

  public nullable(): ObjectSchema<CurrentSchemaObj, NT | null> {
    return super.defined() as any
  }

  public defined(): ObjectSchema<CurrentSchemaObj, Exclude<NT, undefined>> {
    return super.defined() as any
  }

  mergeFields<
    MergedFieldsSchemaObj extends {
      [key: string]: Schema<any>;
    }
  >(
    addedFieldsSchemaObj: MergedFieldsSchemaObj
  ): ObjectSchema<Omit<CurrentSchemaObj, keyof MergedFieldsSchemaObj> & MergedFieldsSchemaObj, NT> {
    this.schemaObj = {
      ...this.schemaObj,
      ...addedFieldsSchemaObj,
    };

    return this as any
  }

  when<
    SchemaObjFactory extends (
      value: SchemaObjToShape<CurrentSchemaObj>
    ) => { [key: string]: Schema<any> | undefined }
  >(
    schemaFactory: SchemaObjFactory
  ): ObjectSchema<
    CurrentSchemaObj & ReturnType<SchemaObjFactory>,
    NullableTypes
  > {
    this.valueFilters.push((value: SchemaObjToShape<CurrentSchemaObj>, options) => {
      const addedFieldsSchemaObj = schemaFactory(value);

      const result = this.validateObj(
        addedFieldsSchemaObj,
        value,
        options
      ) as FilterResult<SchemaObjToShape<ReturnType<SchemaObjFactory>>>;

      if (result.invalid) {
        return result;
      } else {
        return {
          invalid: false,
          value: {
            ...value,
            ...result.value,
          },
        };
      }
    });

    return (this as unknown) as ObjectSchema<
      CurrentSchemaObj & ReturnType<SchemaObjFactory>,
      NullableTypes
    >;
  }
}

export function object<ObjectShape extends { [key: string]: unknown }>(
  schemaObj: { [K in keyof ObjectShape]: BaseSchema<ObjectShape[K]> }
): ObjectSchema<{ [K in keyof ObjectShape]: BaseSchema<ObjectShape[K]> }> {
  return new ObjectSchema(schemaObj);
}
