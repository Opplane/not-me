import { BaseSchema } from "../base/base-schema";
import { InferType, Schema } from "../schema";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";

type ValuesSchemasBase = [Schema<unknown>, ...Array<Schema<unknown>>];
type BaseType = unknown;

export class OrSchema<
  ValuesSchemas extends ValuesSchemasBase
> extends BaseSchema<BaseType, InferType<ValuesSchemas[number]>> {
  constructor(valuesSchemas: ValuesSchemas) {
    super((input) => {
      return {
        errors: false,
        value: input,
      };
    });

    if (valuesSchemas.length === 0) {
      throw new Error("No schemas were provided");
    }

    this.addShapeFilter((input, options) => {
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
          value: acceptedResultValue,
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
