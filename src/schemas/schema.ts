import { AnyErrorMessagesTree } from "../error-messages/error-messages-tree";

export type RejectedValueValidationResult = {
  errors: true;
  messagesTree: AnyErrorMessagesTree<true>;
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
  _rejectedValueValidationResult: RejectedValueValidationResult;
  _acceptedValueValidationResult: AcceptedValueValidationResult<Output>;
  validate(
    input: unknown,
    options?: ValidationOptions
  ): ValidationResult<Output>;
};

export type InferType<
  S extends Schema<unknown>
> = S["_acceptedValueValidationResult"]["value"];
