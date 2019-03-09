export function isCancellationError(error: any): error is CancellationError {
  return error instanceof CancellationError;
}

export default class CancellationError extends Error {
  constructor(message) {
    super(message);

    Object.setPrototypeOf(this, CancellationError.prototype);
  }
}
