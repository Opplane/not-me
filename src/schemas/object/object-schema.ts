import { InvalitionMessagesTree } from "src/default-messages/invalition-messages-tree";
import { DefaultNullableTypes, NullableTypes } from "src/utils/types/nullable-types";
import {
  BaseSchema
} from "../base-schema";
import { FilterResult, InferType, Schema, ValidationOptions } from "../schema";

type SchemaObjToShape<SchemasObj extends { [key: string]: Schema<any> | undefined }> = {
  [K in keyof SchemasObj]: SchemasObj[K] extends Schema<any> ? InferType<SchemasObj[K]> : never;
};

type SchemaType = { [key: string]: unknown }

export class ObjectSchema<
  CurrentSchemaObj extends { [key: string]: Schema<any> },
  NT extends NullableTypes = DefaultNullableTypes
> extends BaseSchema<
  SchemaType,
  SchemaObjToShape<CurrentSchemaObj>,
  NT
> {
  constructor(private schemaObj: CurrentSchemaObj) {
    super((input, options) => {
      if (typeof input !== "object") {
        return {
          invalid: true,
          messagesTree: ["Input is not an object"],
        };
      }

      return {
        invalid: false,
        value: input as SchemaType,
      };
    });

    this.addShapeFilter((value: SchemaType, options) => {
      return this.validateObj(schemaObj, value, options);
    })
  }

  private validateObj<
    PartialSchemaObj extends {
      [key: string]: Schema<any>;
    }
  >(
    schemaObj: PartialSchemaObj,
    value: SchemaType,
    options: ValidationOptions
  ): FilterResult<{[key: string]: unknown}> {
    const finalValue: SchemaType = {};

    const invalidFieldsErrorMessages: InvalitionMessagesTree<SchemaType> = {};

    for (const fieldKey of Object.keys(schemaObj)) {
      const fieldSchema = schemaObj[fieldKey];

      if(fieldSchema === undefined) continue;

      const fieldResult = fieldSchema.validate(value[fieldKey], options);

      if (fieldResult.invalid) {
        if (options?.abortEarly) {
          return {
            invalid: true,
            messagesTree: {
              [fieldKey]: fieldResult.messagesTree,
            } as any,
          };
        } else {
          invalidFieldsErrorMessages[fieldKey] = fieldResult.messagesTree as any;
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

  union<
    Union extends { [key: string]: Schema<unknown> }
  >(
    schemaFactory: (value: CurrentSchemaObj) => Union
  ): ObjectSchema<Omit<CurrentSchemaObj, keyof Union> & Union, NT> {
    this.addShapeFilter((input, options) => {
      const schema = schemaFactory(input as CurrentSchemaObj)

      const result = this.validateObj(schema, input, options)

      if(result.invalid) {
        return result
      } else {
        return {
          invalid: false,
          value: {
            ...input,
            ...result.value
          }
        }
      }
    })

    return this as any
  }
}

export function object<ObjectShape extends { [key: string]: unknown }>(
  schemaObj: { [K in keyof ObjectShape]: Schema<ObjectShape[K]> }
): ObjectSchema<{ [K in keyof ObjectShape]: Schema<ObjectShape[K]> }> {
  return new ObjectSchema(schemaObj);
}
