export function isAbortError(error: any): error is AbortError {
  return error instanceof AbortError;
}

export default class AbortError extends Error {
  name = "AbortError";

  constructor(message) {
    super(message);

    Object.setPrototypeOf(this, AbortError.prototype);
  }
}
