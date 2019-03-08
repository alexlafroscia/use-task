import { useCallback, useMemo, useState } from "react";
import TaskInstance, { AnyFunction, perform } from "./instance";
import { addRunningTask } from "./test-helpers";

type KeepValue = "first" | "all";

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

export type UseTaskConfig = {
  keep: KeepValue;
};

export default function useTask<T extends AnyFunction>(
  taskDefinition: T,
  { keep = "all" }: UseTaskConfig = { keep: "all" }
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

  const instance = new TaskInstance(taskDefinition);

  const runCallback = useCallback(
    (...args) => {
      setTaskState(state => ({
        ...state,
        instances: [...state.instances, instance]
      }));

      if (keep === "first" && derivedState.isRunning) {
        instance.cancel();
        return instance;
      }

      const promiseToResult = perform(instance, args as Parameters<T>);

      addRunningTask(promiseToResult);

      promiseToResult.then(() => {
        setTaskState(state => ({ ...state, lastSuccessful: instance }));
      });

      return instance;
    },
    [instance, derivedState.isRunning]
  );

  return [runCallback, derivedState];
}
