import { RefObject } from "react";
import { Action } from "./state";
import { AnyFunction, TaskInstanceState, Result } from "./types";
import AbortError from "./utils/abort-error";
import Deferred from "./utils/deferred";

class TaskInstance<Func extends AnyFunction> extends Deferred<Result<Func>>
  implements RefObject<TaskInstanceState<Result<Func>>> {
  fn: Func;

  [Symbol.toStringTag] = "TaskInstance";

  current: TaskInstanceState<Result<Func>> = {
    isRunning: true,
    isCancelled: false,
    isComplete: false
  };

  /**
   * Used to control the cancellation of the task instance
   */
  abortController: AbortController = new AbortController();

  private dispatch: (value: Action<Func>) => void;

  constructor(fn: Func, dispatch: (value: Action<Func>) => void) {
    super();

    this.fn = fn;
    this.dispatch = dispatch;

    dispatch({ type: "BEGIN", instance: this });

    this.abortController.signal.addEventListener("abort", () => {
      const error = new AbortError("Task aborted");

      this.dispatch({ type: "CANCEL", instance: this, error });

      if (this.subscribed) {
        super.reject(error);
      }
    });
  }

  resolve(result: Result<Func>) {
    if (this.current.isComplete) {
      return;
    }

    this.dispatch({ type: "COMPLETE", instance: this, result });

    if (this.subscribed) {
      super.resolve(result);
    }
  }

  reject(reason: any) {
    if (this.current.error) {
      return;
    }

    this.dispatch({ type: "ERROR", instance: this, error: reason });

    if (this.subscribed) {
      super.reject(reason);
    }
  }
}

export default TaskInstance;
