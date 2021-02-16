import { DefaultErrorMessagesManager } from "src/error-messages/default-messages/default-error-messages-manager";
import {
  DefaultNullableTypes,
  NullableTypes,
} from "src/utils/types/nullable-types";
import { BaseSchema } from "../base/base-schema";

export class StringSchema<
  NT extends NullableTypes = DefaultNullableTypes
> extends BaseSchema<string, string, NT> {
  constructor(message?: string) {
    super((input) => {
      if (typeof input === "string") {
        return {
          errors: false,
          value: input,
        };
      } else {
        const typeErrorMessage = [
          message ||
            DefaultErrorMessagesManager.getDefaultMessages()?.string
              ?.notAString ||
            "Input is not a string",
        ];

        return {
          errors: true,
          messagesTree: typeErrorMessage,
        };
      }
    });
  }

  /**
   * Input must have any character other than spaces
   */
  filled(message?: string): StringSchema<never> {
    this.test(
      (input) => input.trim().length > 0,
      () =>
        message ||
        DefaultErrorMessagesManager.getDefaultMessages()?.string?.notAString ||
        "Field must be filled"
    );

    return this as any;
  }
}

export function string(message?: string): StringSchema {
  return new StringSchema(message);
}
