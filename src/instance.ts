import Deferred from "./deferred";
import CancellationError, { isCancellationError } from "./cancellation-error";
import timeout from "./timeout";

export type AnyFunction = (...args: any[]) => any;
type Generator = (...args: any[]) => IterableIterator<any>;

type Result<T extends AnyFunction> = T extends Generator
  ? ReturnType<T> extends IterableIterator<infer U>
    ? U
    : never
  : ReturnType<T>;

export async function perform<F extends AnyFunction>(
  task: TaskInstance<F>,
  args: Parameters<F>
) {
  task.begin();

  await timeout(0);

  let result = task.fn(...args);

  if (result && typeof result.next === "function") {
    let isFinished = false,
      lastResolvedValue;
    const generator = task.fn(...args);

    while (!isFinished) {
      // Is the task has been cancelled, we can stop consuming from the
      // generator
      if (task.isCancelled) {
        break;
      }

      // Advance the generator with the last resolved value, so that
      // a user can treat the `yield` like `async/await` and get the
      // last value out of it. We can also use this for nested tasks
      try {
        const { value, done } = generator.next(lastResolvedValue);

        if (value instanceof TaskInstance) {
          value.setParent(task);
        }

        lastResolvedValue = await value;
        isFinished = done;
      } catch (e) {
        if (isCancellationError(e)) {
          task.cancel(e);
        } else {
          task.reject(e);
        }

        return;
      }
    }

    result = lastResolvedValue;
  } else {
    // If a non-Generator function is provided, user is opting out of correct
    // cancellation behavior. At least for now, we don't want to prevent that
    result = await result;
  }

  task.resolve(result);
}

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

  private parentInstance?: TaskInstance<any>;
  private onCancelCallbacks: Array<AnyFunction> = [];

  constructor(fn: Func) {
    super();

    this.fn = fn;
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
    this.isRunning = true;
  }

  resolve(result: R) {
    this.isRunning = false;
    this.isComplete = true;
    this.result = result;

    if (this.subscribed) {
      super.resolve(result);
    }
  }

  reject(reason: any) {
    this.isRunning = false;
    this.isComplete = true;
    this.error = reason;

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
}

export default TaskInstance;
