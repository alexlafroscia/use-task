import Deferred from "../src/deferred";

export class TestDeferred<T = undefined> extends Deferred<T> {
  resolve(result?: T) {
    // @ts-ignore
    super.resolve(result);
  }

  reject(reason: any) {
    super.reject(reason);
  }
}

export function perform(result) {
  return result.current[0]();
}

export function stateFor(result) {
  return result.current[1];
}
