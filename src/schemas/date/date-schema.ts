import { DefaultErrorMessagesManager } from "src/error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base-schema";

export class DateSchema extends BaseSchema<Date> {
  constructor(message?: string) {
    super((input) => {
      const notADateMessages = [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages()?.date?.notADate ||
          "Input is not a date",
      ];

      const invalidDateMessages = [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages()?.date?.invalidDate ||
          "Input is not a valid date",
      ];

      if (input instanceof Date) {
        if (isNaN(input.getTime())) {
          return {
            errors: true,
            messagesTree: invalidDateMessages,
          };
        } else {
          return {
            errors: false,
            value: input,
          };
        }
      } else if (typeof input === "string") {
        const date = new Date(input);

        if (isNaN(date.getTime())) {
          return {
            errors: true,
            messagesTree: invalidDateMessages,
          };
        } else {
          return {
            errors: false,
            value: date,
          };
        }
      } else {
        return {
          errors: true,
          messagesTree: notADateMessages,
        };
      }
    });
  }
}

export function date(message?: string): DateSchema {
  return new DateSchema(message);
}
