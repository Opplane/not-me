import { DefaultErrorMessagesManager } from "src/error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base-schema";

export class NumberSchema extends BaseSchema<number> {
  constructor(message?: string) {
    super((input) => {
      const typeErrorMessage = [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages()?.number
            ?.notANumber ||
          "Input is not a number",
      ];

      if (typeof input === "number" || typeof input === "string") {
        const number = Number(input);

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

  integer(message?: string) {
    this.test(
      (input) => Number.isInteger(input),
      () =>
        message ||
        DefaultErrorMessagesManager.getDefaultMessages()?.number
          ?.isNotInteger ||
        "Input is not an integer"
    );

    return this;
  }
}

export function number(message?: string) {
  return new NumberSchema(message);
}
