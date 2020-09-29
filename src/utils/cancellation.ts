import TaskInstance from "../instance";

export function cancelAllInstances(instances: TaskInstance<any>[]): void {
  instances
    .filter(i => i.current.isRunning)
    .forEach(i => i.abortController.abort());
}

export function cancelInstancesExceptLastN(
  instances: TaskInstance<any>[],
  count: number
): void {
  instances
    .filter(i => i.current.isRunning)
    .slice(0, count > 0 ? -count : undefined)
    .forEach(i => i.abortController.abort());
}
