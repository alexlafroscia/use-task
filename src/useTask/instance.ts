export async function perform<Arguments extends any[], ReturnValue>(
  task: TaskInstance<Arguments, ReturnValue>,
  args: Arguments
): Promise<ReturnValue> {
  task.isRunning = true;

  const result = await task.fn(...args);

  task.isRunning = false;

  return result;
}

class TaskInstance<Arguments extends any[], ReturnValue> {
  fn: (...args: Arguments) => ReturnValue;

  isRunning = false;

  constructor(fn: (...args: Arguments) => ReturnValue) {
    this.fn = fn;
  }
}

export default TaskInstance;
