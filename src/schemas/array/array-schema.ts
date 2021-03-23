import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { BaseSchema } from "../base/base-schema";
import { InferType, Schema } from "../schema";

type ElementsSchemaBase = Schema<unknown>;
type BaseType = unknown[];

export class ArraySchema<
  ElementsSchema extends ElementsSchemaBase
> extends BaseSchema<BaseType, InferType<ElementsSchema>[]> {
  private minLength = 0;
  private minLengthMessage?: string;

  private maxLength = Infinity;
  private maxLengthMessage?: string;

  constructor(elementsSchema: ElementsSchema, message?: string) {
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

        const result = elementsSchema.validate(element, options);

        if (result.errors) {
          if (options?.abortEarly) {
            return {
              errors: true,
              messagesTree: {
                [index]: result.messagesTree,
              },
            };
          } else {
            errors[index] = result.messagesTree;
          }
        } else {
          validatedArray.push(result.value);
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

export function array<ElementsSchema extends ElementsSchemaBase>(
  elementsSchema: ElementsSchema,
  message?: string
): ArraySchema<ElementsSchema> {
  return new ArraySchema<ElementsSchema>(elementsSchema, message);
}
