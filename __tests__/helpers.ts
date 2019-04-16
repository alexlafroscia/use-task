import Deferred from "../src/deferred";
import { AnyFunction, UseTaskResult } from "../src/types";

export class TestDeferred<T = undefined> extends Deferred<T> {
  resolve(result?: T) {
    // @ts-ignore
    super.resolve(result);
  }

  reject(reason: any) {
    super.reject(reason);
  }
}

interface TaskInstanceResultRef<T extends AnyFunction> {
  current: UseTaskResult<T>;
}

export function perform<T extends AnyFunction>(
  result: TaskInstanceResultRef<T>,
  ...args: Parameters<T>
) {
  return result.current[0](...args);
}

export function stateFor<T extends AnyFunction>(
  result: TaskInstanceResultRef<T>
) {
  return result.current[1];
}
