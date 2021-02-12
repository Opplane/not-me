import { AsyncValidationNotAllowedError } from "src/async-validation-not-allowed-error";
import { InferType } from "src/types/infer-type";
import { throwError } from "src/utils/throw-error";
import { Schema, FilterUnknownResult } from "./schema";

export class ObjectSchema<
  SchemasObj extends { [key: string]: Schema<unknown> },
  ExtraTypes extends undefined | null = undefined
> extends Schema<
  { [K in keyof SchemasObj]: InferType<SchemasObj[K]> } | ExtraTypes
> {
  private allowNull = false;
  private allowUndefined = true;

  constructor(private schemaObj: SchemasObj) {
    super();

    this.filters.push((input: unknown, options) => {
      if (input === undefined) {
        if (!this.allowUndefined) {
          return {
            invalid: true,
            messagesTree: "Input is not defined",
          };
        } else {
          return {
            invalid: false,
            value: input,
          };
        }
      }

      if (typeof input !== "object") {
        return {
          invalid: true,
          messagesTree: "Input is not an object",
        };
      }

      if (input === null) {
        if (!this.allowNull) {
          return {
            invalid: true,
            messagesTree: "Input is null",
          };
        }
      }

      return {
        invalid: false,
        value: input,
      };
    });

    this.filters.push(
      (
        value: { [key: string]: unknown } | undefined | null,
        options
      ) => {
        if (value == null)
          return {
            invalid: false,
            value,
          };

        
        const invalidFieldsErrorMessages: { [key: string]: unknown } = {};

        const finalValue: { [key: string]: unknown } = {};

        for (const fieldKey of Object.keys(this.schemaObj)) {
          const fieldSchema = this.schemaObj[fieldKey] || throwError();
          const fieldResult = fieldSchema.validateSync(
            value[fieldKey],
            options
          );

          if (fieldResult.invalid) {
            if (options?.abortEarly) {
              return {
                invalid: true,
                messagesTree: {
                  [fieldKey]: fieldResult.messagesTree,
                },
              };
            } else {
              invalidFieldsErrorMessages[fieldKey] = fieldResult.messagesTree;
            }
          } else {
            finalValue[fieldKey] = fieldResult.value;
          }
        }

        if (Object.keys(invalidFieldsErrorMessages).length > 0) {
          return {
            invalid: true,
            messagesTree: invalidFieldsErrorMessages,
          };
        } else {
          return {
            invalid: false,
            value: finalValue,
          };
        }
      }
    );
  }

  nullable(): this {
    this.allowNull = true;
    return this;
  }

  defined(): this {
    this.allowUndefined = false;
    return this;
  }

  addFields<
    AddFieldsSchemasObj extends {
      [key: string]: ObjectSchema<{ [key: string]: Schema<unknown> }>;
    }
  >(
    addFieldsSchemaObj: AddFieldsSchemasObj
  ): ObjectSchema<SchemasObj & AddFieldsSchemasObj, ExtraTypes> {}
}

export function object<ObjectShape extends { [key: string]: unknown }>(
  schemaObj: { [K in keyof ObjectShape]: Schema<ObjectShape[K]> }
): ObjectSchema<{ [K in keyof ObjectShape]: Schema<ObjectShape[K]> }> {
  return new ObjectSchema(schemaObj);
}
