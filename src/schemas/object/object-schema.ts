import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { BaseSchema } from "../base/base-schema";
import {
  ValidationResult,
  InferType,
  Schema,
  ValidationOptions,
} from "../schema";
import { BaseType, objectTypeFilter } from "./object-type-filter";

type SchemaObjToShape<
  SchemasObj extends { [key: string]: Schema<unknown> | undefined }
> = {
  [K in keyof SchemasObj]: SchemasObj[K] extends Schema<unknown>
    ? InferType<SchemasObj[K]>
    : never;
};

export class ObjectSchema<
  SchemaObj extends { [key: string]: Schema<unknown> }
> extends BaseSchema<BaseType, SchemaObjToShape<SchemaObj>> {
  constructor(schemaObj: SchemaObj, message?: string) {
    super((input) => {
      return objectTypeFilter(input, message);
    });

    this.addShapeFilter((value: BaseType, options) => {
      return this.validateObj(schemaObj, value, options);
    });

    this.mapMode = true;
  }

  private validateObj<
    PartialSchemaObj extends {
      [key: string]: Schema<unknown> | undefined;
    }
  >(
    schemaObj: PartialSchemaObj,
    value: BaseType,
    options: ValidationOptions
  ): ValidationResult<{ [key: string]: unknown }> {
    const finalValue: BaseType = {};

    const errorsFieldsErrorMessages: {
      [key: string]: AnyErrorMessagesTree;
    } = {};

    for (const fieldKey of Object.keys(schemaObj)) {
      const fieldSchema = schemaObj[fieldKey];

      if (fieldSchema === undefined) continue;

      const fieldResult = fieldSchema.validate(value[fieldKey], options);

      if (fieldResult.errors) {
        if (options?.abortEarly) {
          return {
            errors: true,
            messagesTree: {
              [fieldKey]: fieldResult.messagesTree,
            },
          };
        } else {
          errorsFieldsErrorMessages[fieldKey] = fieldResult.messagesTree;
        }
      } else {
        finalValue[fieldKey] = fieldResult.value;
      }
    }

    if (Object.keys(errorsFieldsErrorMessages).length > 0) {
      return {
        errors: true,
        messagesTree: errorsFieldsErrorMessages,
      };
    } else {
      return {
        errors: false,
        value: finalValue,
      };
    }
  }

  union<
    SchemaFactory extends (
      value: SchemaObjToShape<SchemaObj>
    ) => { [key: string]: Schema<unknown> | undefined }
  >(
    schemaFactory: SchemaFactory
  ): ObjectSchema<
    Omit<SchemaObj, keyof ReturnType<SchemaFactory>> & ReturnType<SchemaFactory>
  > {
    this.addShapeFilter((input, options) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const schema = schemaFactory(input as any);

      const result = this.validateObj(schema, input, options);

      if (result.errors) {
        return result;
      } else {
        return {
          errors: false,
          value: result.value,
        };
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export function object<SchemaObj extends { [key: string]: Schema<unknown> }>(
  schemaObj: SchemaObj,
  message?: string
): ObjectSchema<SchemaObj> {
  return new ObjectSchema<SchemaObj>(schemaObj, message);
}
