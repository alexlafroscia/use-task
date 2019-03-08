import { useCallback, useReducer, useState } from "react";
import TaskInstance, { AnyFunction, perform } from "./instance";

const TASK_POOL = new Set();

async function addRunningTask<T>(task: T) {
  TASK_POOL.add(task);

  await task;

  TASK_POOL.delete(task);
}

/**
 * @param {number} interval how frequently to check if all tasks have completed
 */
export function waitForTaskCompletion(interval = 0) {
  return new Promise(resolve => {
    const timer = setInterval(() => {
      if (TASK_POOL.size === 0) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
  });
}

function publicStateReducer(state, action) {
  switch (action.type) {
    case "start":
      return { ...state, isRunning: true };
    case "finish":
      return {
        ...state,
        isRunning: false,
        lastSuccessful: action.instance,
        performCount: state.performCount + 1
      };
    default:
      throw new Error();
  }
}

type Tuple<A, B> = [A, B];

type PublicState<T> = {
  isRunning: boolean;
  performCount: number;
  lastSuccessful: T;
};

export type UseTaskConfig = {
  keep: "first" | "all";
};

export default function useTask<T extends AnyFunction>(
  task: T,
  { keep = "all" }: UseTaskConfig = { keep: "all" }
): Tuple<
  (...args: Parameters<T>) => TaskInstance<T>,
  PublicState<TaskInstance<T>>
> {
  // Ensure that we don't change concurrency strategies after the task has been set up
  const [privateState] = useState({ keep });
  if (keep !== privateState.keep) {
    throw new Error("Cannot dynamically change how to handle concurrent tasks");
  }

  const [publicState, publicStateDispatch] = useReducer(publicStateReducer, {
    isRunning: false,
    performCount: 0,
    lastSuccessful: undefined
  });

  const instance = new TaskInstance(task);

  const runCallback = useCallback(
    (...args) => {
      if (keep === "first" && publicState.isRunning) {
        instance.cancel();
        return instance;
      }

      publicStateDispatch({ type: "start" });

      const promiseToResult = perform(instance, args as Parameters<T>);

      addRunningTask(promiseToResult);

      promiseToResult.then(() => {
        publicStateDispatch({ type: "finish", instance });
      });

      return instance;
    },
    [instance, publicState.isRunning]
  );

  return [runCallback, publicState];
}
