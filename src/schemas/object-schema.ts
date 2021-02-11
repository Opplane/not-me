import { InferType } from "src/types/infer-type";
import { Schema } from "./schema";

export class ObjectSchema<
  SchemasObj extends { [key: string]: Schema<unknown> },
  Output extends
    | { [K in keyof SchemasObj]: InferType<SchemasObj[K]> }
    | undefined
    | null
> extends Schema<Output> {
  _outputType!: Output;

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
  }
}

export function object<ObjectShape extends { [key: string]: unknown }>(
  schemaObj: { [K in keyof ObjectShape]: Schema<ObjectShape[K]> }
): ObjectSchema<
  { [K in keyof ObjectShape]: Schema<ObjectShape[K]> },
  ObjectShape | undefined
> {
  return new ObjectSchema(schemaObj);
}
