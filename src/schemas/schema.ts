import { InvalitionMessagesTree } from "src/invalidation-messages/invalition-messages-tree";

export type FilterResult<Output> =
  | {
      invalid: true;
      messagesTree: InvalitionMessagesTree;
    }
  | {
      invalid: false;
      value: Output;
    };

export type ValidationOptions = { abortEarly?: boolean } | undefined;

export type Schema<Output> = {
  _outputType: Output;
  validate(input: unknown, options?: ValidationOptions): FilterResult<Output>;
};

export type InferType<S extends { _outputType: unknown }> = S["_outputType"];
