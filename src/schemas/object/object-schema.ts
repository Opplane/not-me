import { DefaultInvalidationMessagesManager } from "src/default-messages/default-invalition-messages-manager";
import { InvalitionMessagesTree } from "src/default-messages/invalition-messages-tree";
import { DefaultNullableTypes, NullableTypes } from "src/utils/types/nullable-types";
import {
  BaseSchema
} from "../base-schema";
import { FilterResult, InferType, Schema, ValidationOptions } from "../schema";

type SchemaObjToShape<SchemasObj extends { [key: string]: Schema<any> | undefined }> = {
  [K in keyof SchemasObj]: SchemasObj[K] extends Schema<any> ? InferType<SchemasObj[K]> : never;
};

type Type = { [key: string]: unknown }

export class ObjectSchema<
  Shape extends {[key: string]: unknown},
  NT extends NullableTypes = DefaultNullableTypes
> extends BaseSchema<
  Type,
  Shape,
  NT
> {
  constructor(schemaObj: {[K in keyof Shape]: Schema<Shape[K]>}, message?: string) {
    super((input, options) => {
      if (typeof input !== "object") {
        return {
          invalid: true,
          messagesTree: [message || DefaultInvalidationMessagesManager.getDefaultMessages()?.object?.notAnObject ||"Input is not an object"],
        };
      }

      return {
        invalid: false,
        value: input as Type,
      };
    });

    this.addShapeFilter((value: Type, options) => {
      return this.validateObj(schemaObj, value, options);
    })
  }

  private validateObj<
    PartialSchemaObj extends {
      [key: string]: Schema<unknown> | any;
    }
  >(
    schemaObj: PartialSchemaObj,
    value: Type,
    options: ValidationOptions
  ): FilterResult<{[key: string]: unknown}> {
    const finalValue: Type = {};

    const invalidFieldsErrorMessages: {[key: string]: InvalitionMessagesTree} = {};

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

  public nullable(): ObjectSchema<Shape, NT | null> {
    return super.defined() as any
  }

  public defined(): ObjectSchema<Shape, Exclude<NT, undefined>> {
    return super.defined() as any
  }

  union<
    SchemaFactory extends (value: Shape) => {[key: string]: Schema<unknown> | undefined }
  >(
    schemaFactory: SchemaFactory
  ): ObjectSchema<Omit<Shape, keyof SchemaObjToShape<ReturnType<SchemaFactory>>> & SchemaObjToShape<ReturnType<SchemaFactory>>, NT> {
    this.addShapeFilter((input, options) => {
      const schema = schemaFactory(input as Shape)

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

export function object<Shape extends { [key: string]: unknown }>(
  schemaObj: {[K in keyof Shape]: Schema<Shape[K]>}
): ObjectSchema<Shape> {
  return new ObjectSchema(schemaObj);
}
