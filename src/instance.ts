import React from "react";

import Deferred from "./deferred";
import CancellationError, { isCancellationError } from "./cancellation-error";
import { Action } from "./state";

export type AnyFunction = (...args: any[]) => any;
type Generator = (...args: any[]) => IterableIterator<any>;

export type Result<T extends AnyFunction> = T extends Generator
  ? ReturnType<T> extends IterableIterator<infer U>
    ? U
    : never
  : ReturnType<T>;

export interface TaskInstanceState<T> {
  isRunning: boolean;
  isComplete: boolean;
  isCancelled: boolean;
  result?: T;
  error?: any;
}

class TaskInstance<Func extends AnyFunction> extends Deferred<Result<Func>>
  implements React.RefObject<TaskInstanceState<Result<Func>>> {
  fn: Func;

  [Symbol.toStringTag] = "TaskInstance";

  current: TaskInstanceState<Result<Func>> = {
    isRunning: true,
    isCancelled: false,
    isComplete: false
  };

  private dispatch: (value: Action<Func>) => void;
  private parentInstance?: TaskInstance<any>;
  private onCancelCallbacks: Array<AnyFunction> = [];

  constructor(fn: Func, dispatch: (value: Action<Func>) => void) {
    super();

    this.fn = fn;
    this.dispatch = dispatch;

    dispatch({ type: "BEGIN", instance: this });
  }

  /**
   * Subscribe to a task instance being cancelled
   * @param cb callback that will be run if this task is cancelled
   */
  onCancel(cb: AnyFunction) {
    this.onCancelCallbacks.push(cb);
  }

  /**
   * Set a parent task instance on a task
   *
   * A parent task is one that, when performed, executes another task
   *
   * This establishes a relationship where, in a case where a parent
   * task is cancelled, the "child" task is also cancelled
   *
   * @param parent parent task instance
   */
  setParent(parent: TaskInstance<any>) {
    this.parentInstance = parent;

    this.parentInstance.onCancel(e => {
      if (isCancellationError(e)) {
        this.cancel(e);
      } else {
        throw e;
      }
    });
  }

  resolve(result: Result<Func>) {
    this.dispatch({ type: "COMPLETE", instance: this, result });

    if (this.subscribed) {
      super.resolve(result);
    }
  }

  reject(reason: any) {
    if (isCancellationError(reason)) {
      this.dispatch({ type: "CANCEL", instance: this, error: reason });
    } else {
      this.dispatch({ type: "ERROR", instance: this, error: reason });
    }

    if (this.subscribed) {
      super.reject(reason);
    }
  }

  cancel(error = new CancellationError("Task Cancelled")) {
    if (this.current.isCancelled) {
      return;
    }

    for (const callback of this.onCancelCallbacks) {
      callback(error);
    }

    this.reject(error);
  }
}

export default TaskInstance;
