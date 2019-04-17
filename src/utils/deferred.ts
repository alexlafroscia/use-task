export default class Deferred<T> implements Promise<T> {
  protected subscribed = false;

  private promise: Promise<T>;
  private _resolve!: (result: T) => void;
  private _reject!: (reason: any) => void;

  [Symbol.toStringTag] = "Deferred";

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  protected resolve(result: T) {
    this._resolve(result);
  }

  protected reject(reason: any) {
    this._reject(reason);
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
    this.subscribed = true;

    return this.promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ) {
    this.subscribed = true;

    return this.promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null) {
    this.subscribed = true;

    return this.promise.finally(onfinally);
  }
}
