import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

export class BooleanSchema extends BaseSchema<boolean> {
  constructor(message?: string) {
    super((input) => {
      if (typeof input === "boolean") {
        return {
          errors: false,
          value: input,
        };
      } else {
        const typeErrorMessage = [
          message ||
            DefaultErrorMessagesManager.getDefaultMessages()?.boolean
              ?.notABoolean ||
            "Input is not a boolean",
        ];

        return {
          errors: true,
          messagesTree: typeErrorMessage,
        };
      }
    });
  }
}

export function boolean(message?: string): BooleanSchema {
  return new BooleanSchema(message);
}
