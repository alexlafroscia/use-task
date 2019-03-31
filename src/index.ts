import { useMemo, useState, useCallback, useRef } from "react";
import useWillUnmount from "@rooks/use-will-unmount";
import TaskInstance, { AnyFunction, perform } from "./instance";
import { addRunningTask } from "./test-helpers";

type KeepValue = "first" | "last" | "all";

type InternalTaskState<F extends AnyFunction> = {
  keep: KeepValue;
  instances: TaskInstance<F>[];
  lastSuccessful?: TaskInstance<F>;
};

type TaskState<F extends AnyFunction> = {
  isRunning: boolean;
  performCount: number;
  lastSuccessful?: TaskInstance<F>;
};

type Tuple<A, B> = [A, B];

function cancelAllInstances(instances: TaskInstance<any>[]): void {
  instances.filter(i => i.isRunning).forEach(i => i.cancel());
}

export type UseTaskConfig = {
  keep: KeepValue;
};

export default function useTask<T extends AnyFunction>(
  taskDefinition: T,
  { keep = "last" }: UseTaskConfig = { keep: "last" }
): Tuple<(...args: Parameters<T>) => TaskInstance<T>, TaskState<T>> {
  const [taskState, setTaskState] = useState<InternalTaskState<T>>({
    keep,
    instances: [],
    lastSuccessful: undefined
  });

  if (keep !== taskState.keep) {
    throw new Error("Cannot dynamically change how to handle concurrent tasks");
  }

  const derivedState = useMemo<TaskState<T>>(
    () => ({
      isRunning: taskState.instances.some(t => t.isRunning),
      performCount: taskState.instances.length,
      lastSuccessful: taskState.lastSuccessful
    }),
    [taskState.instances, taskState.lastSuccessful]
  );

  // Use a `ref` so that we cancel on the latest state, not the initial state
  const stateRef = useRef<InternalTaskState<T>>(taskState);
  stateRef.current = taskState;
  useWillUnmount(() => {
    cancelAllInstances(stateRef.current.instances);
  });

  const runCallback = useCallback(
    (...args) => {
      const instance = new TaskInstance(taskDefinition);

      setTaskState(state => ({
        ...state,
        instances: [...state.instances, instance]
      }));

      if (keep === "first" && derivedState.isRunning) {
        instance.cancel();
        return instance;
      }

      if (keep === "last" && derivedState.isRunning) {
        cancelAllInstances(taskState.instances);
      }

      const promiseToResult = perform(instance, args as Parameters<T>);

      addRunningTask(promiseToResult);

      promiseToResult.then(() => {
        if (!instance.isCancelled && !instance.error) {
          setTaskState(state => ({ ...state, lastSuccessful: instance }));
        }
      });

      return instance;
    },
    [derivedState.isRunning, keep, taskDefinition, taskState.instances]
  );

  return [runCallback, derivedState];
}

export { default as timeout } from "./timeout";
export { isCancellationError, ignoreCancellation } from "./cancellation-error";
