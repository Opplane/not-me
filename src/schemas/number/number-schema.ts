import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

export class NumberSchema extends BaseSchema<number> {
  constructor(message?: string) {
    super((input) => {
      const typeErrorMessage = [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages().number?.notANumber ||
          "Input is not a number",
      ];

      if (typeof input === "number" || typeof input === "string") {
        const number = typeof input === "number" ? input : Number(input);

        if (isNaN(number)) {
          return {
            errors: true,
            messagesTree: typeErrorMessage,
          };
        } else {
          return {
            errors: false,
            value: number,
          };
        }
      } else {
        return {
          errors: true,
          messagesTree: typeErrorMessage,
        };
      }
    });
  }

  integer(message?: string): this {
    this.test(
      (input) => Number.isInteger(input),
      () =>
        message ||
        DefaultErrorMessagesManager.getDefaultMessages().number?.isNotInteger ||
        "Input is not an integer"
    );

    return this;
  }
}

export function number(message?: string): NumberSchema {
  return new NumberSchema(message);
}
