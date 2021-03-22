import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { BaseSchema } from "../base/base-schema";
import { InferType, Schema } from "../schema";

type ValuesSchemasBase = [Schema<unknown>, ...Array<Schema<unknown>>];
type BaseType = unknown[];

export class ArraySchema<
  ValuesSchemas extends ValuesSchemasBase
> extends BaseSchema<BaseType, InferType<ValuesSchemas[number]>[]> {
  private minLength = 0;
  private minLengthMessage?: string;

  private maxLength = Infinity;
  private maxLengthMessage?: string;

  constructor(valuesSchemas: ValuesSchemas, message?: string) {
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

    if (valuesSchemas.length === 0) {
      throw new Error("No schemas were provided");
    }

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

        let acceptedResultValue: unknown;
        let isValid = false;
        const errorsFromSchemaIteration: AnyErrorMessagesTree = [];

        for (const schema of valuesSchemas) {
          const result = schema.validate(element, options);

          if (result.errors) {
            errorsFromSchemaIteration.push(result.messagesTree);
            continue;
          } else {
            acceptedResultValue = result.value;
            isValid = true;
            break;
          }
        }

        if (isValid) {
          validatedArray.push(acceptedResultValue);
        } else {
          if (options?.abortEarly) {
            return {
              errors: true,
              messagesTree: {
                [index]: errorsFromSchemaIteration,
              },
            };
          } else {
            errors[index] = errorsFromSchemaIteration;
          }
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
  message?: string
): ArraySchema<ValuesSchemas> {
  return new ArraySchema<ValuesSchemas>(valuesSchemas, message);
}
