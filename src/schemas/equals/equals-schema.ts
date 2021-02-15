import { DefaultInvalidationMessagesManager } from "src/invalidation-messages/default-messages/default-invalition-messages-manager";
import { BaseSchema } from "../base-schema";

export class EqualsSchema<
  PossibleValues extends readonly unknown[]
> extends BaseSchema<PossibleValues[number], PossibleValues[number], never> {
  constructor(possibleValues: PossibleValues, message?: string) {
    super((input, options) => {
      if (possibleValues.includes(input)) {
        return {
          invalid: false,
          value: input,
        };
      } else {
        return {
          invalid: true,
          messagesTree: [
            message ||
              DefaultInvalidationMessagesManager.getDefaultMessages()?.equals
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
