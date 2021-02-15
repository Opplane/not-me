import { ErrorMessagesTree } from "src/error-messages/error-messages-tree";

export type FilterResult<Output> =
  | {
      errors: true;
      messagesTree: ErrorMessagesTree;
    }
  | {
      errors: false;
      value: Output;
    };

export type ValidationOptions = { abortEarly?: boolean } | undefined;

export type Schema<Output> = {
  _outputType: Output;
  validate(input: unknown, options?: ValidationOptions): FilterResult<Output>;
};

export type InferType<S extends Schema<unknown>> = S["_outputType"];
