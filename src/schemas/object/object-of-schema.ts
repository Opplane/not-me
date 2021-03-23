import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { BaseSchema } from "../base/base-schema";
import { InferType, Schema } from "../schema";
import { BaseType, objectTypeFilter } from "./object-type-filter";

type FieldsSchemaBase = Schema<unknown>;

export class ObjectOfSchema<
  FieldsSchema extends FieldsSchemaBase
> extends BaseSchema<BaseType, { [key: string]: InferType<FieldsSchema> }> {
  constructor(fieldsSchema: FieldsSchema, message?: string) {
    super((input) => objectTypeFilter(input, message));

    this.addShapeFilter((input, options) => {
      const finalValue: { [key: string]: unknown } = {};
      const errors: { [key: string]: AnyErrorMessagesTree } = {};

      for (const fieldKey in input) {
        const fieldValue = input[fieldKey];

        const result = fieldsSchema.validate(fieldValue, options);

        if (result.errors) {
          if (options?.abortEarly) {
            return {
              errors: true,
              messagesTree: {
                [fieldKey]: result.messagesTree,
              },
            };
          } else {
            errors[fieldKey] = result.messagesTree;
          }
        } else {
          finalValue[fieldKey] = result.value;
        }
      }

      if (Object.keys(errors).length > 0) {
        return {
          errors: true,
          messagesTree: errors,
        };
      } else {
        return {
          errors: false,
          value: finalValue,
        };
      }
    });
  }
}

export function objectOf<FieldsSchema extends FieldsSchemaBase>(
  fieldsSchema: FieldsSchema,
  message?: string
): ObjectOfSchema<FieldsSchema> {
  return new ObjectOfSchema<FieldsSchema>(fieldsSchema, message);
}
