import { BaseSchema } from "../base/base-schema";
import { InferType, Schema } from "../schema";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { NullableTypes } from "../../utils/types/nullable-types";

type ValuesSchemasBase = [Schema<unknown>, ...Array<Schema<unknown>>];

export class OrSchema<
  ValuesSchemas extends ValuesSchemasBase
> extends BaseSchema<Exclude<InferType<ValuesSchemas[number]>, NullableTypes>> {
  constructor(valuesSchemas: ValuesSchemas) {
    if (valuesSchemas.length === 0) {
      throw new Error("No schemas provided");
    }

    super((input, options) => {
      let acceptedResultValue: unknown;
      let isValid = false;
      const errorsFromSchemaIteration: AnyErrorMessagesTree[] = [];

      for (const schema of valuesSchemas) {
        const result = schema.validate(input, options);

        if (result.errors) {
          errorsFromSchemaIteration.push(result.messagesTree);
          continue;
        } else {
          acceptedResultValue = result.value;
          isValid = true;
          break;
        }
      }

      if (isValid) {
        return {
          errors: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
          value: acceptedResultValue as any,
        };
      } else {
        return {
          errors: true,
          messagesTree: errorsFromSchemaIteration,
        };
      }
    });
  }
}

export function or<ValuesSchemas extends ValuesSchemasBase>(
  valuesSchemas: ValuesSchemas
): OrSchema<ValuesSchemas> {
  return new OrSchema<ValuesSchemas>(valuesSchemas);
}
