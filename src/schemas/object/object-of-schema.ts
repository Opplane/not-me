import { DefaultErrorMessagesManager } from "src/error-messages/default-messages/default-error-messages-manager";
import { ErrorMessagesTree } from "src/error-messages/error-messages-tree";
import { BaseSchema } from "../base-schema";
import { FilterResult, InferType, Schema } from "../schema";
import { objectTypeFilter } from "./object-type-filter";

type BaseType = { [key: string]: unknown };

type ValuesSchemasBase = [Schema<unknown>, ...Array<Schema<unknown>>];

export class ObjectOfSchema<
  ValuesSchemas extends ValuesSchemasBase
> extends BaseSchema<
  BaseType,
  { [key: string]: InferType<ValuesSchemas[number]> }
> {
  constructor(
    valuesSchemas: ValuesSchemas,
    message?: string,
    fieldDoesNotMatchMessage?: string
  ) {
    super((input) => objectTypeFilter(input, message));

    this.addShapeFilter((input, options) => {
      const finalValue: { [key: string]: unknown } = {};
      const errors: { [key: string]: ErrorMessagesTree } = {};

      for (const fieldKey in input) {
        const fieldValue = input[fieldKey];

        let lastFieldResult: FilterResult<any> | undefined = undefined;

        for (const schema of valuesSchemas) {
          const result = schema.validate(fieldValue);
          lastFieldResult = result;

          if (!result.errors) {
            break;
          }
        }

        if (!lastFieldResult) {
          throw new Error("No schemas were provided");
        }

        if (lastFieldResult.errors) {
          const messages =
            valuesSchemas.length === 1
              ? lastFieldResult.messagesTree
              : [
                  fieldDoesNotMatchMessage ||
                    DefaultErrorMessagesManager.getDefaultMessages()?.objectOf
                      ?.fieldDoesNotMatch ||
                    "Field did not match any of the provided schemas",
                ];

          if (options?.abortEarly) {
            return {
              errors: true,
              messagesTree: {
                [fieldKey]: messages,
              },
            };
          } else {
            errors[fieldKey] = messages;
          }
        } else {
          finalValue[fieldKey] = lastFieldResult.value;
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

export function objectOf<ValuesSchemas extends ValuesSchemasBase>(
  valuesSchemas: ValuesSchemas,
  message?: string,
  fieldDoesNotMatchMessage?: string
): ObjectOfSchema<ValuesSchemas> {
  return new ObjectOfSchema<ValuesSchemas>(
    valuesSchemas,
    message,
    fieldDoesNotMatchMessage
  );
}
