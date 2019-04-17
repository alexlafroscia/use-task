import TaskInstance from "./instance";

export default function cancelAllInstances(
  instances: TaskInstance<any>[]
): void {
  instances
    .filter(i => i.current.isRunning)
    .forEach(i => i.abortController.abort());
}
