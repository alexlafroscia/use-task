export default class Deferred<T> implements Promise<T> {
  private promise: Promise<T>;
  resolve!: (result: T) => void;
  reject!: (reason: any) => void;

  [Symbol.toStringTag] = "Deferred";

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ) {
    return this.promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null) {
    return this.promise.finally(onfinally);
  }
}
