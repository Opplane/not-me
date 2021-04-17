import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

export class EqualsSchema<
  PossibleValues extends readonly unknown[]
> extends BaseSchema<PossibleValues[number]> {
  constructor(possibleValues: PossibleValues, message?: string) {
    super((input) => {
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
              DefaultErrorMessagesManager.getDefaultMessages().equals
                ?.notEqual ||
              "Input is not equal to any of the allowed values",
          ],
        };
      }
    });
  }
}

export function equals<PossibleValues extends readonly unknown[]>(
  possibleValues: PossibleValues,
  message?: string
): EqualsSchema<PossibleValues> {
  return new EqualsSchema<PossibleValues>(possibleValues, message);
}
