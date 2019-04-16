import { useMemo, useCallback, useReducer, useRef } from "react";
import useWillUnmount from "@rooks/use-will-unmount";
import TaskInstance, {
  TaskInstanceState,
  Result,
  AnyFunction
} from "./instance";
import perform from "./perform";
import reducer, { InternalTaskState, TaskStateReducer } from "./state";

export type KeepValue = "first" | "last" | "all";

type TaskState<F extends AnyFunction> = {
  isRunning: boolean;
  performCount: number;
  lastSuccessful?: TaskInstanceState<Result<F>>;
  cancelAll: () => void;
};

type Tuple<A, B> = [A, B];

function cancelAllInstances(instances: TaskInstance<any>[]): void {
  instances
    .filter(i => i.current.isRunning)
    .forEach(i => i.abortController.abort());
}

export type UseTaskConfig = {
  keep: KeepValue;
};

export default function useTask<T extends AnyFunction>(
  taskDefinition: T,
  { keep = "last" }: UseTaskConfig = { keep: "last" }
): Tuple<(...args: Parameters<T>) => TaskInstance<T>, TaskState<T>> {
  const [taskState, dispatch] = useReducer<TaskStateReducer<T>>(reducer, {
    keep,
    instances: [],
    lastSuccessful: undefined
  });

  if (keep !== taskState.keep) {
    // eslint-disable-next-line no-console
    console.warn("Cannot dynamically change how to handle concurrent tasks");
  }

  const derivedState = useMemo<TaskState<T>>(
    () => ({
      isRunning: taskState.instances.some(t => t.current.isRunning),
      performCount: taskState.instances.length,
      lastSuccessful:
        taskState.lastSuccessful && taskState.lastSuccessful.current,
      cancelAll() {
        cancelAllInstances(taskState.instances);
      }
    }),
    [taskState.instances, taskState.lastSuccessful]
  );

  const stateRef = useRef<InternalTaskState<T>>(taskState);
  const isMountedRef = useRef(true);
  stateRef.current = taskState;
  useWillUnmount(() => {
    isMountedRef.current = false;
    cancelAllInstances(stateRef.current.instances);
  });

  const runCallback = useCallback(
    (...args) => {
      const instance = new TaskInstance(taskDefinition, action => {
        if (isMountedRef.current) {
          dispatch(action);
        }
      });

      if (keep === "first" && derivedState.isRunning) {
        instance.abortController.abort();
        return instance;
      }

      if (keep === "last" && derivedState.isRunning) {
        cancelAllInstances(taskState.instances);
      }

      perform(instance, args as Parameters<T>);

      return instance;
    },
    [derivedState.isRunning, keep, taskDefinition, taskState.instances]
  );

  return [runCallback, derivedState];
}

export { default as timeout } from "./timeout";
export { isAbortError } from "./abort-error";
