type Unwrap<T> = T extends Promise<infer U> ? U : T;

export type AnyFunction = (...args: any[]) => any;

export async function perform<F extends AnyFunction>(
  task: TaskInstance<F>,
  args: Parameters<F>
) {
  task.isRunning = true;

  const result = await task.fn(...args);

  task.isRunning = false;
  task.isComplete = true;

  task.result = result;
}

class TaskInstance<Func extends AnyFunction> {
  fn: Func;

  result?: Unwrap<ReturnType<Func>>;

  isCancelled = false;
  isRunning = false;
  isComplete = false;

  constructor(fn: Func) {
    this.fn = fn;
  }

  cancel() {
    this.isCancelled = true;
  }
}

export default TaskInstance;
