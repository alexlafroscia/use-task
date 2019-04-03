export function isCancellationError(error: any): error is CancellationError {
  return error instanceof CancellationError;
}

export function ignoreCancellation<T extends (...args) => any>(callback: T) {
  return async function(
    ...args: Parameters<T>
  ): Promise<ReturnType<T> | undefined> {
    try {
      return await callback(...args);
    } catch (e) {
      if (!isCancellationError(e)) {
        throw e;
      }
    }
  };
}

export default class CancellationError extends Error {
  constructor(message) {
    super(message);

    Object.setPrototypeOf(this, CancellationError.prototype);
  }
}
