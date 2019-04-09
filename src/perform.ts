import { isCancellationError, timeout } from "./index";
import TaskInstance, { AnyFunction } from "./instance";

export default async function perform<F extends AnyFunction>(
  task: TaskInstance<F>,
  args: Parameters<F>
) {
  // Required to allow a user to catch an error even if it is
  // thrown synchronously within the task
  await timeout(0);

  let result = task.fn(...args);

  if (result && typeof result.next === "function") {
    let isFinished = false,
      lastResolvedValue;
    const generator = task.fn(...args);

    while (!isFinished) {
      // Is the task has been cancelled, we can stop consuming from the
      // generator
      if (task.current.isCancelled) {
        return;
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
