import { DefaultInvalidationMessagesManager } from "src/invalidation-messages/default-messages/default-invalition-messages-manager";
import { InvalitionMessagesTree } from "src/invalidation-messages/invalition-messages-tree";
import {
  DefaultNullableTypes,
  NullableTypes,
} from "src/utils/types/nullable-types";
import { BaseSchema } from "../base-schema";
import { FilterResult, InferType, Schema, ValidationOptions } from "../schema";
import { BaseType, objectTypeFilter } from "./object-type-filter";

type SchemaObjToShape<
  SchemasObj extends { [key: string]: Schema<any> | undefined }
> = {
  [K in keyof SchemasObj]: SchemasObj[K] extends Schema<any>
    ? InferType<SchemasObj[K]>
    : never;
};


export class ObjectSchema<
  SchemaObj extends { [key: string]: Schema<unknown> },
  NT extends NullableTypes = DefaultNullableTypes
> extends BaseSchema<BaseType, SchemaObjToShape<SchemaObj>, NT> {
  constructor(
    schemaObj: SchemaObj,
    message?: string
  ) {
    super((input, options) => {
      return objectTypeFilter(input, message)
    });

    this.addShapeFilter((value: BaseType, options) => {
      return this.validateObj(schemaObj, value, options);
    });
  }

  private validateObj<
    PartialSchemaObj extends {
      [key: string]: Schema<unknown> | any;
    }
  >(
    schemaObj: PartialSchemaObj,
    value: BaseType,
    options: ValidationOptions
  ): FilterResult<{ [key: string]: unknown }> {
    const finalValue: BaseType = {};

    const invalidFieldsErrorMessages: {
      [key: string]: InvalitionMessagesTree;
    } = {};

    for (const fieldKey of Object.keys(schemaObj)) {
      const fieldSchema = schemaObj[fieldKey];

      if (fieldSchema === undefined) continue;

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
          invalidFieldsErrorMessages[
            fieldKey
          ] = fieldResult.messagesTree as any;
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

  public nullable(): ObjectSchema<SchemaObj, NT | null> {
    return super.defined() as any;
  }

  public defined(): ObjectSchema<SchemaObj, Exclude<NT, undefined>> {
    return super.defined() as any;
  }

  union<
    SchemaFactory extends (
      value: SchemaObjToShape<SchemaObj>
    ) => { [key: string]: Schema<unknown> | undefined }
  >(
    schemaFactory: SchemaFactory
  ): ObjectSchema<
    Omit<SchemaObj, keyof ReturnType<SchemaFactory>> &
      ReturnType<SchemaFactory>,
    NT
  > {
    this.addShapeFilter((input, options) => {
      const schema = schemaFactory(input as any);

      const result = this.validateObj(schema, input, options);

      if (result.invalid) {
        return result;
      } else {
        return {
          invalid: false,
          value: {
            ...input,
            ...result.value,
          },
        };
      }
    });

    return this as any;
  }
}

export function object<SchemaObj extends { [key: string]: Schema<unknown> }>(
  schemaObj: SchemaObj,
  message?: string
): ObjectSchema<SchemaObj> {
  return new ObjectSchema<SchemaObj>(schemaObj, message);
}
