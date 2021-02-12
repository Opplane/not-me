import { InferType } from "src/types/infer-type";
import { throwError } from "src/utils/throw-error";
import {
  Schema,
  FilterUnknownResult,
  FilterResult,
  ValidationOptions,
} from "./schema";

type SchemaObjToObj<SchemasObj extends { [key: string]: Schema<any> | undefined }> = {
  [K in keyof SchemasObj]: SchemasObj[K] extends Schema<any> ? InferType<SchemasObj[K]> : never;
};

export class ObjectSchema<
  CurrentSchemaObj extends { [key: string]: Schema<any> },
  NullableTypes extends undefined | null = undefined
> extends Schema<
  | SchemaObjToObj<CurrentSchemaObj>
  | NullableTypes
> {
  constructor(private schemaObj: CurrentSchemaObj) {
    super();

    this.filters.push((input: unknown, options) => {
      if (typeof input !== "object") {
        return {
          invalid: true,
          messagesTree: "Input is not an object",
        };
      }

      return {
        invalid: false,
        value: input,
      };
    });

    this.filters.push((value: { [key: string]: unknown }, options) => {
      return this.validateObj(schemaObj, value, options);
    });
  }

  private validateObj<
    PartialSchemaObj extends {
      [key: string]: Schema<any> | undefined;
    }
  >(
    schemaObj: PartialSchemaObj,
    value: { [key: string]: unknown },
    options: ValidationOptions
  ): FilterUnknownResult {
    const finalValue: { [key: string]: unknown } = {};

    const invalidFieldsErrorMessages: { [key: string]: unknown } = {};

    for (const fieldKey of Object.keys(schemaObj)) {
      const fieldSchema = schemaObj[fieldKey] || throwError();
      const fieldResult = fieldSchema.validateSync(value[fieldKey], options);

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

  nullable(): ObjectSchema<CurrentSchemaObj, Exclude<NullableTypes, null>> {
    this.allowNull = true;
    return this as unknown as ObjectSchema<CurrentSchemaObj, Exclude<NullableTypes, null>>;
  }

  defined(): ObjectSchema<CurrentSchemaObj, Exclude<NullableTypes, undefined>> {
    this.allowUndefined = false;
    return this as unknown as ObjectSchema<
      CurrentSchemaObj,
      Exclude<NullableTypes, undefined>
    >;
  }

  addFields<
    AddedFieldsSchemasObj extends {
      [key: string]: Schema<any>;
    }
  >(
    addedFieldsSchemaObj: AddedFieldsSchemasObj
  ): ObjectSchema<CurrentSchemaObj & AddedFieldsSchemasObj, NullableTypes> {
    this.schemaObj = {
      ...this.schemaObj,
      ...addedFieldsSchemaObj,
    };

    return (this as unknown) as ObjectSchema<
      CurrentSchemaObj & AddedFieldsSchemasObj,
      NullableTypes
    >;
  }

  when<
    SchemaObjFactory extends (
      value: SchemaObjToObj<CurrentSchemaObj>
    ) => { [key: string]: Schema<any> | undefined }
  >(
    schemaFactory: SchemaObjFactory
  ): ObjectSchema<
    CurrentSchemaObj & ReturnType<SchemaObjFactory>,
    NullableTypes
  > {
    this.filters.push((value: SchemaObjToObj<CurrentSchemaObj>, options) => {
      const addedFieldsSchemaObj = schemaFactory(value);

      const result = this.validateObj(
        addedFieldsSchemaObj,
        value,
        options
      ) as FilterResult<SchemaObjToObj<ReturnType<SchemaObjFactory>>>;

      if (result.invalid) {
        return result;
      } else {
        return {
          invalid: false,
          value: {
            ...value,
            ...result.value,
          },
        };
      }
    });

    return (this as unknown) as ObjectSchema<
      CurrentSchemaObj & ReturnType<SchemaObjFactory>,
      NullableTypes
    >;
  }
}

export function object<ObjectShape extends { [key: string]: unknown }>(
  schemaObj: { [K in keyof ObjectShape]: Schema<ObjectShape[K]> }
): ObjectSchema<{ [K in keyof ObjectShape]: Schema<ObjectShape[K]> }> {
  return new ObjectSchema(schemaObj);
}
