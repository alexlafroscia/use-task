import { useCallback } from "react";
import TaskInstance from "./instance";
import perform from "./perform";
import { useTaskStateReducer, useDerivedState } from "./state";
import {
  SignalReceivingFunction,
  UseTaskConfig,
  UseTaskWithSignalResult
} from "./types";
import useIsMounted from "./hooks/use-is-mounted";
import useUnmountWithState from "./hooks/use-unmount-with-state";
import { cancelAllInstances } from "./utils/cancellation";

export default function useTaskWithSignal<T extends SignalReceivingFunction>(
  taskDefinition: T,
  { keep = "last" }: UseTaskConfig = {}
): UseTaskWithSignalResult<T> {
  const [taskState, dispatch] = useTaskStateReducer<T>(keep);

  if (keep !== taskState.keep) {
    // eslint-disable-next-line no-console
    console.warn("Cannot dynamically change how to handle concurrent tasks");
  }

  const isMountedRef = useIsMounted();
  const derivedState = useDerivedState<T>(taskState);

  useUnmountWithState(taskState, currentTaskState => {
    cancelAllInstances(currentTaskState.instances);
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

      perform(instance, [
        instance.abortController.signal,
        ...args
      ] as Parameters<T>);

      return instance;
    },
    [
      derivedState.isRunning,
      keep,
      taskDefinition,
      taskState.instances,
      dispatch,
      isMountedRef
    ]
  );

  return [runCallback, derivedState];
}
