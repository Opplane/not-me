export class AsyncValidationNotAllowedError extends Error {
  constructor() {
    super("Async validations are not allowed when calling validateSync()")
  }
}