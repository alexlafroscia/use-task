import { useCallback, useReducer, useState } from "react";
import TaskInstance, { perform } from "./instance";

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
        result: action.result,
        performCount: state.performCount + 1
      };
    default:
      throw new Error();
  }
}

export type UseTaskConfig = {
  keep: "first" | "all";
};

export default function useTask<Arguments extends any[], ReturnValue>(
  task: (...args: Arguments) => ReturnValue,
  { keep = "all" }: UseTaskConfig = { keep: "all" }
) {
  // Ensure that we don't change concurrency strategies after the task has been set up
  const [privateState] = useState({ keep });
  if (keep !== privateState.keep) {
    throw new Error("Cannot dynamically change how to handle concurrent tasks");
  }

  const [publicState, publicStateDispatch] = useReducer(publicStateReducer, {
    isRunning: false,
    performCount: 0,
    result: undefined
  });

  const instance = new TaskInstance(task);

  const runCallback = useCallback(
    async (...args) => {
      if (keep === "first" && publicState.isRunning) {
        return;
      }

      publicStateDispatch({ type: "start" });

      const promiseToResult = perform(instance, args as Arguments);

      addRunningTask(promiseToResult);

      const result = await promiseToResult;

      publicStateDispatch({ type: "finish", result });

      return result;
    },
    [instance, publicState.isRunning]
  );

  return [runCallback, publicState];
}
