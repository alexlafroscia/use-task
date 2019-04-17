import { useMemo, useCallback, useReducer, useRef } from "react";
import useWillUnmount from "@rooks/use-will-unmount";
import cancelAllInstances from "./cancel-all";
import TaskInstance from "./instance";
import perform from "./perform";
import { AnyFunction, UseTaskConfig, UseTaskResult, TaskState } from "./types";
import reducer, { InternalTaskState, TaskStateReducer } from "./state";

export default function useTask<T extends AnyFunction>(
  taskDefinition: T,
  { keep = "last" }: UseTaskConfig = {}
): UseTaskResult<T> {
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
