import Deferred from "./deferred";
import CancellationError, { isCancellationError } from "./cancellation-error";

export type AnyFunction = (...args: any[]) => any;
type Generator = (...args: any[]) => IterableIterator<any>;

type Result<T extends AnyFunction> = T extends Generator
  ? ReturnType<T> extends IterableIterator<infer U>
    ? U
    : never
  : ReturnType<T>;

class TaskInstance<Func extends AnyFunction, R = Result<Func>> extends Deferred<
  R
> {
  fn: Func;

  result?: R;
  error?: Error;

  isCancelled = false;
  isRunning = false;
  isComplete = false;

  [Symbol.toStringTag] = "TaskInstance";

  private notifyStateChange: () => void;
  private parentInstance?: TaskInstance<any>;
  private onCancelCallbacks: Array<AnyFunction> = [];

  constructor(fn: Func, updateTaskState) {
    super();

    this.fn = fn;
    this.notifyStateChange = updateTaskState;
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

  begin() {
    this.updatePublicState({ isRunning: true });
  }

  resolve(result: R) {
    this.updatePublicState({
      isRunning: false,
      isComplete: true,
      result
    });

    if (this.subscribed) {
      super.resolve(result);
    }
  }

  reject(reason: any) {
    this.updatePublicState({
      isRunning: false,
      isComplete: true,
      error: reason
    });

    if (this.subscribed) {
      super.reject(reason);
    }
  }

  cancel(error = new CancellationError("Task Cancelled")) {
    if (this.isCancelled) {
      return;
    }

    this.isCancelled = true;
    this.reject(error);

    for (const callback of this.onCancelCallbacks) {
      callback(error);
    }
  }

  private updatePublicState(props) {
    Object.assign(this, props);

    this.notifyStateChange();
  }
}

export default TaskInstance;
