import { DefaultInvalidationMessagesManager } from "src/invalidation-messages/default-messages/default-invalition-messages-manager";
import { InvalitionMessagesTree } from "src/invalidation-messages/invalition-messages-tree";
import {
  DefaultNullableTypes,
  NullableTypes,
} from "src/utils/types/nullable-types";
import { BaseSchema } from "../base-schema";
import { InferType, Schema } from "../schema";
import { objectTypeFilter } from "./object-type-filter";

type BaseType = { [key: string]: unknown };

type ValuesSchemasBase = [Schema<unknown>, ...Array<Schema<unknown>>];

export class ObjectOfSchema<
  ValuesSchemas extends ValuesSchemasBase,
  NT extends NullableTypes = DefaultNullableTypes
> extends BaseSchema<
  BaseType,
  { [key: string]: InferType<ValuesSchemas[number]> },
  NT
> {
  constructor(
    valuesSchema: ValuesSchemas,
    message?: string,
    fieldDoesNotMatchMessage?: string
  ) {
    super((input) => objectTypeFilter(input, message));

    this.addShapeFilter((input, options) => {
      const finalValue: { [key: string]: unknown } = {};
      const errors: { [key: string]: InvalitionMessagesTree } = {};

      for (const fieldKey in input) {
        const fieldValue = input[fieldKey];

        let validFieldResult:
          | { invalid: false; value: unknown }
          | undefined = undefined;

        for (const schema of valuesSchema) {
          const result = schema.validate(fieldValue);

          if (!result.invalid) {
            validFieldResult = result;
            break;
          }
        }

        if (!validFieldResult) {
          const messages = [
            fieldDoesNotMatchMessage ||
              DefaultInvalidationMessagesManager.getDefaultMessages()?.objectOf
                ?.fieldDoesNotMatch ||
              "Field did not match any of the provided schemas",
          ];

          if (options?.abortEarly) {
            return {
              invalid: true,
              messagesTree: {
                [fieldKey]: messages,
              },
            };
          } else {
            errors[fieldKey] = messages;
          }
        } else {
          finalValue[fieldKey] = validFieldResult.value;
        }
      }

      if (Object.keys(errors).length > 0) {
        return {
          invalid: true,
          messagesTree: errors,
        };
      } else {
        return {
          invalid: false,
          value: finalValue,
        };
      }
    });
  }
}

export function objectOf<ValuesSchemas extends ValuesSchemasBase>(
  valuesSchema: ValuesSchemas,
  message?: string,
  fieldDoesNotMatchMessage?: string
): ObjectOfSchema<ValuesSchemas> {
  return new ObjectOfSchema<ValuesSchemas>(
    valuesSchema,
    message,
    fieldDoesNotMatchMessage
  );
}
