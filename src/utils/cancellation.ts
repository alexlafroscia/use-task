import TaskInstance from "../instance";

export function cancelAllInstances(instances: TaskInstance<any>[]): void {
  instances
    .filter(i => i.current.isRunning)
    .forEach(i => i.abortController.abort());
}
