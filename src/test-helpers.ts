const TASK_POOL = new Set();

export async function addRunningTask<T>(task: T) {
  TASK_POOL.add(task);

  await task;

  TASK_POOL.delete(task);
}

/**
 * @param {number} interval how frequently to check if all tasks have completed
 */
export function waitForTaskCompletion(interval = 0) {
  return new Promise(resolve => {
    const timer = setInterval(() => {
      if (TASK_POOL.size === 0) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
  });
}
