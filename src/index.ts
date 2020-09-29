import { useCallback } from "react";
import TaskInstance from "./instance";
import perform from "./perform";
import { useTaskStateReducer, useDerivedState } from "./state";
import { AnyFunction, UseTaskConfig, UseTaskResult } from "./types";
import useIsMounted from "./hooks/use-is-mounted";
import useUnmountWithState from "./hooks/use-unmount-with-state";
import {
  cancelAllInstances,
  cancelInstancesExceptLastN
} from "./utils/cancellation";

export default function useTask<T extends AnyFunction>(
  taskDefinition: T,
  {
    keep = "last",
    maxConcurrent = keep === "all" ? Infinity : 1
  }: UseTaskConfig = {}
): UseTaskResult<T> {
  const [taskState, dispatch] = useTaskStateReducer<T>(keep, maxConcurrent);

  if (keep !== taskState.keep) {
    // eslint-disable-next-line no-console
    console.warn("Cannot dynamically change how to handle concurrent tasks");
  }

  const isMountedRef = useIsMounted();
  const derivedState = useDerivedState<T>(taskState);
  const { currentRunningCount, nextInstanceToRun } = derivedState;

  useUnmountWithState(taskState, currentTaskState => {
    cancelAllInstances(currentTaskState.instances);
  });

  if (currentRunningCount < maxConcurrent && nextInstanceToRun) {
    perform(nextInstanceToRun, nextInstanceToRun.args);
  }

  const runCallback = useCallback(
    (...args) => {
      const instance = new TaskInstance(
        taskDefinition,
        args as Parameters<T>,
        action => {
          if (isMountedRef.current) {
            dispatch(action);
          }
        }
      );

      if (keep === "first" && currentRunningCount >= maxConcurrent) {
        instance.abortController.abort();
        return instance;
      }

      if (keep === "last" && currentRunningCount >= maxConcurrent) {
        cancelInstancesExceptLastN(taskState.instances, maxConcurrent - 1);
      }

      return instance;
    },
    [
      derivedState.isRunning,
      keep,
      maxConcurrent,
      taskDefinition,
      taskState.instances,
      dispatch,
      isMountedRef
    ]
  );

  return [runCallback, derivedState];
}

export { default as useTaskWithSignal } from "./with-signal";
export { default as timeout } from "./utils/timeout";
export { isAbortError } from "./utils/abort-error";
