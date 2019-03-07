import { useCallback, useReducer, useState } from "react";

const VALID_CONCURRENCY_TYPES = ["default", "drop"];
const TASK_POOL = new Set();

async function addRunningTask(task) {
  TASK_POOL.add(task);

  const result = await task;

  TASK_POOL.delete(task);

  return result;
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
  concurrency?: "default" | "drop";
};

export default function useTask<T extends Function>(
  task: T,
  { concurrency = "default" }: UseTaskConfig = {}
) {
  if (!VALID_CONCURRENCY_TYPES.includes(concurrency)) {
    throw new Error("Unknown concurrency type");
  }

  // Ensure that we don't change concurrency strategies after the task has been set up
  const [privateState] = useState({ concurrency });
  if (concurrency !== privateState.concurrency) {
    throw new Error("Cannot dynamically change concurrency type");
  }

  const [publicState, publicStateDispatch] = useReducer(publicStateReducer, {
    isRunning: false,
    performCount: 0,
    result: undefined
  });

  const runCallback = useCallback(
    async (...args) => {
      if (concurrency === "drop" && publicState.isRunning) {
        return;
      }

      publicStateDispatch({ type: "start" });

      const result = await addRunningTask(task(...args));

      publicStateDispatch({ type: "finish", result });
    },
    [task, publicState.isRunning]
  );

  return [runCallback, publicState];
}
