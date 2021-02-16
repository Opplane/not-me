import { DefaultErrorMessagesManager } from "src/error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

export class EqualsSchema<
  PossibleValues extends readonly unknown[]
> extends BaseSchema<PossibleValues[number], PossibleValues[number], never> {
  constructor(possibleValues: PossibleValues, message?: string) {
    super((input, options) => {
      if (possibleValues.includes(input)) {
        return {
          errors: false,
          value: input,
        };
      } else {
        return {
          errors: true,
          messagesTree: [
            message ||
              DefaultErrorMessagesManager.getDefaultMessages()?.equals
                ?.notEqual ||
              "Input is not equal to any of the allowed values",
          ],
        };
      }
    });

    this.nullable();
  }
}

export function equals<PossibleValues extends readonly unknown[]>(
  possibleValues: PossibleValues,
  message?: string
) {
  return new EqualsSchema<PossibleValues>(possibleValues, message);
}
