export function isAbortError(error: any): error is AbortError {
  return error instanceof AbortError;
}

export function ignoreAbort<T extends (...args) => any>(callback: T) {
  return async function(
    ...args: Parameters<T>
  ): Promise<ReturnType<T> | undefined> {
    try {
      return await callback(...args);
    } catch (e) {
      if (!isAbortError(e)) {
        throw e;
      }
    }
  };
}

export default class AbortError extends Error {
  name = "AbortError";

  constructor(message) {
    super(message);

    Object.setPrototypeOf(this, AbortError.prototype);
  }
}
