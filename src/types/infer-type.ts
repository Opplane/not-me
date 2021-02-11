import { Schema } from "src/schemas/schema";

export type InferType<S extends { _outputType: unknown }> = S["_outputType"];
