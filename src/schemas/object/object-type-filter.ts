import { DefaultInvalidationMessagesManager } from "src/invalidation-messages/default-messages/default-invalition-messages-manager";
import { FilterResult } from "../schema";

export type BaseType = { [key: string]: unknown };

export function objectTypeFilter(
  input: unknown,
  message?: string
): FilterResult<BaseType> {
  if (typeof input !== "object") {
    return {
      invalid: true,
      messagesTree: [
        message ||
          DefaultInvalidationMessagesManager.getDefaultMessages()?.object
            ?.notAnObject ||
          "Input is not an object",
      ],
    };
  }

  return {
    invalid: false,
    value: input as BaseType,
  };
}
