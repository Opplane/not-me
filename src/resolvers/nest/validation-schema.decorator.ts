import { SetMetadata } from "@nestjs/common";
import { Schema } from "../../schemas/schema";

export const VALIDATION_SCHEMA_KEY = "not-me-validation-schema";

/*
  
*/
export type SupportedValidationSchema = Schema<
  unknown[] | { [key: string]: unknown }
>;

/**
 * Schema must be an array or an object marked with .defined().
 *
 * NestJS parsers always parse everything out of the request as an object literal.
 * Even when the query parameters or bodies are undefined.
 */
export const ValidationSchema = (schema: SupportedValidationSchema) =>
  SetMetadata(VALIDATION_SCHEMA_KEY, schema);
