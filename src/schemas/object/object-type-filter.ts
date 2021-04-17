import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { ValidationResult } from "../schema";

export type BaseType = { [key: string]: unknown };

export function objectTypeFilter(
  input: unknown,
  message?: string
): ValidationResult<BaseType> {
  if (typeof input !== "object") {
    return {
      errors: true,
      messagesTree: [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages().object
            ?.notAnObject ||
          "Input is not an object",
      ],
    };
  }

  return {
    errors: false,
    value: input as BaseType,
  };
}
