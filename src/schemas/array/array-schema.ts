import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { BaseSchema } from "../base/base-schema";
import { ValidationResult, InferType, Schema } from "../schema";

type ValuesSchemasBase = [Schema<unknown>, ...Array<Schema<unknown>>];
type BaseType = unknown[];

export class ArraySchema<
  ValuesSchemas extends ValuesSchemasBase
> extends BaseSchema<BaseType, InferType<ValuesSchemas[number]>[]> {
  private minLength = 0;
  private minLengthMessage?: string;

  private maxLength = Infinity;
  private maxLengthMessage?: string;

  constructor(
    valuesSchemas: ValuesSchemas,
    message?: string,
    fieldDoesNotMatchMessage?: string
  ) {
    super((input) => {
      if (input instanceof Array) {
        return {
          errors: false,
          value: input,
        };
      } else {
        return {
          errors: true,
          messagesTree: [
            message ||
              DefaultErrorMessagesManager.getDefaultMessages()?.array
                ?.notAnArray ||
              "Input is not an array",
          ],
        };
      }
    });

    this.addShapeFilter((input, options) => {
      const errors: { [key: number]: AnyErrorMessagesTree } = {};

      const validatedArray = [];

      if (input.length < this.minLength) {
        return {
          errors: true,
          messagesTree: [
            this.minLengthMessage ||
              DefaultErrorMessagesManager.getDefaultMessages()?.array
                ?.lessThanMinimum ||
              "Array has less elements than expected",
          ],
        };
      } else if (input.length > this.maxLength) {
        return {
          errors: true,
          messagesTree: [
            this.maxLengthMessage ||
              DefaultErrorMessagesManager.getDefaultMessages()?.array
                ?.moreThanMaximum ||
              "Array has more elements than expected",
          ],
        };
      }

      for (let index = 0; index < input.length; index++) {
        const element = input[index];

        let lastFieldResult: ValidationResult<unknown> | undefined = undefined;

        for (const schema of valuesSchemas) {
          const result = schema.validate(element);

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
                [index]: messages,
              },
            };
          } else {
            errors[index] = messages;
          }
        } else {
          validatedArray.push(lastFieldResult.value);
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
          value: validatedArray,
        };
      }
    });
  }

  min(length: number, message?: string): this {
    this.minLength = length;
    this.minLengthMessage = message;

    return this;
  }

  max(length: number, message?: string): this {
    this.maxLength = length;
    this.maxLengthMessage = message;

    return this;
  }
}

export function array<ValuesSchemas extends ValuesSchemasBase>(
  valuesSchemas: ValuesSchemas,
  message?: string,
  fieldDoesNotMatchMessage?: string
): ArraySchema<ValuesSchemas> {
  return new ArraySchema<ValuesSchemas>(
    valuesSchemas,
    message,
    fieldDoesNotMatchMessage
  );
}
