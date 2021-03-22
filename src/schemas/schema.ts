import { AnyErrorMessagesTree } from "../error-messages/error-messages-tree";

export type RejectedValueValidationResult = {
  errors: true;
  messagesTree: AnyErrorMessagesTree;
};

export type AcceptedValueValidationResult<Output> = {
  errors: false;
  value: Output;
};

export type ValidationResult<Output> =
  | RejectedValueValidationResult
  | AcceptedValueValidationResult<Output>;

export type ValidationOptions = { abortEarly?: boolean } | undefined;

export type Schema<Output> = {
  _outputType: Output;
  validate(
    input: unknown,
    options?: ValidationOptions
  ): ValidationResult<Output>;
  test(
    testFunction: (value: Output) => boolean,
    message: string | (() => string)
  ): Schema<Output>;
  transform<TransformFunction extends (value: Output) => unknown>(
    transformFunction: TransformFunction
  ): Schema<ReturnType<TransformFunction>>;
};

export type InferType<S extends Schema<unknown>> = S["_outputType"];
