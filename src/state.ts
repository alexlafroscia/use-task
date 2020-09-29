import { Reducer, useReducer, useMemo } from "react";
import TaskInstance from "./instance";
import {
  AnyFunction,
  KeepValue,
  Result,
  TaskInstanceState,
  TaskState
} from "./types";
import AbortError from "./utils/abort-error";
import { cancelAllInstances } from "./utils/cancellation";

export type InternalTaskState<F extends AnyFunction> = {
  keep: KeepValue;
  maxConcurrent: number;
  instances: TaskInstance<F>[];
  lastSuccessful?: TaskInstance<F>;
};

interface BaseAction<F extends AnyFunction> {
  type: string;
  instance: TaskInstance<F>;
}

interface Begin<F extends AnyFunction> extends BaseAction<F> {
  type: "BEGIN";
}

interface Run<F extends AnyFunction> extends BaseAction<F> {
  type: "RUN";
}

interface Complete<F extends AnyFunction> extends BaseAction<F> {
  type: "COMPLETE";
  result: Result<F>;
}

interface Error<F extends AnyFunction> extends BaseAction<F> {
  type: "ERROR";
  error: any;
}

interface Cancel<F extends AnyFunction> extends BaseAction<F> {
  type: "CANCEL";
  error: AbortError;
}

export type Action<F extends AnyFunction> =
  | Begin<F>
  | Run<F>
  | Complete<F>
  | Error<F>
  | Cancel<F>;

export type TaskStateReducer<F extends AnyFunction> = Reducer<
  InternalTaskState<F>,
  Action<F>
>;

function updateStateForInstance<F extends AnyFunction>(
  instances: TaskInstance<F>[],
  instanceToUpdate: TaskInstance<F>,
  callback: () => TaskInstanceState<Result<F>>
): TaskInstance<F>[] {
  return instances.map(instance => {
    if (instance === instanceToUpdate) {
      instance.current = callback();
    }

    return instance;
  });
}

function isWaitingToRun<F extends AnyFunction>(instance: TaskInstance<F>) {
  const { current } = instance;
  return !current.isRunning && !current.isComplete;
}

const reducer = (state, action: Action<any>) => {
  switch (action.type) {
    case "BEGIN":
      return { ...state, instances: [...state.instances, action.instance] };
    case "RUN":
      return {
        ...state,
        instances: updateStateForInstance(
          state.instances,
          action.instance,
          () => ({
            isComplete: false,
            isRunning: true,
            isCancelled: false
          })
        )
      };
    case "COMPLETE":
      return {
        ...state,
        instances: updateStateForInstance(
          state.instances,
          action.instance,
          () => ({
            isComplete: true,
            isRunning: false,
            isCancelled: false,
            result: action.result
          })
        ),
        lastSuccessful: action.instance
      };
    case "ERROR":
      return {
        ...state,
        instances: updateStateForInstance(
          state.instances,
          action.instance,
          () => ({
            isComplete: true,
            isRunning: false,
            isCancelled: false,
            error: action.error
          })
        )
      };
    case "CANCEL":
      return {
        ...state,
        instances: updateStateForInstance(
          state.instances,
          action.instance,
          () => ({
            isComplete: true,
            isRunning: false,
            isCancelled: true,
            error: action.error
          })
        )
      };
    default:
      throw new Error("Unexpected dispatch received");
  }
};

export function useTaskStateReducer<T extends AnyFunction>(
  keep: KeepValue,
  maxConcurrent: number
) {
  return useReducer<TaskStateReducer<T>>(reducer, {
    keep,
    maxConcurrent,
    instances: [],
    lastSuccessful: undefined
  });
}

export function useDerivedState<T extends AnyFunction>(
  taskState: InternalTaskState<T>
) {
  return useMemo<TaskState<T>>(
    () => ({
      isRunning: taskState.instances.some(t => t.current.isRunning),
      currentRunningCount: taskState.instances.filter(t => t.current.isRunning)
        .length,
      nextInstanceToRun: taskState.instances.find(isWaitingToRun),
      performCount: taskState.instances.length,
      lastSuccessful:
        taskState.lastSuccessful && taskState.lastSuccessful.current,
      cancelAll() {
        cancelAllInstances(taskState.instances);
      }
    }),
    [taskState.instances, taskState.lastSuccessful]
  );
}
