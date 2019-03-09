import Deferred from "./deffered";
import CancellationError from "./cancellation-error";

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

  let result;

  if (task.fn.constructor.name === "GeneratorFunction") {
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
      const { value, done } = generator.next(lastResolvedValue);

      lastResolvedValue = await value;
      isFinished = done;
    }

    result = lastResolvedValue;
  } else {
    // If a non-Generator function is provided, user is opting out of correct
    // cancellation behavior. At least for now, we don't want to prevent that
    result = await task.fn(...args);
  }

  if (!task.isCancelled) {
    task.complete(result);
  }
}

class TaskInstance<Func extends AnyFunction, R = Result<Func>> extends Deferred<
  R
> {
  fn: Func;

  result?: R;

  isCancelled = false;
  isRunning = false;
  isComplete = false;

  [Symbol.toStringTag] = "TaskInstance";

  constructor(fn: Func) {
    super();

    this.fn = fn;
  }

  begin() {
    this.isRunning = true;
  }

  complete(result: R) {
    this.isRunning = false;
    this.isComplete = true;
    this.resolve(result);
  }

  cancel() {
    const error = new CancellationError("Task Cancelled");

    this.isCancelled = true;
    this.reject(error);
  }
}

export default TaskInstance;
