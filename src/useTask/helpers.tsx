import React from "react";

import wait from "../wait";
import useTask, { UseTaskConfig } from "./index";
import { isCancellationError } from "./cancellation-error";

type CallBack = () => void;
type Work = (done: CallBack) => void;

export function SyncWork(done: CallBack) {
  done();
}

export async function AsyncWork(done: CallBack) {
  await wait(0);

  done();
}

export function* CancellableAsyncWork(done: CallBack) {
  yield wait(0);

  done();
}

export function PerformWork({
  done = () => {},
  taskConfig = undefined,
  work
}: {
  done?: CallBack;
  taskConfig?: UseTaskConfig;
  work: Work;
}) {
  const [performWork, workTaskState] = useTask(work, taskConfig);

  const handleClick = async () => {
    try {
      await performWork(done);
    } catch (e) {
      if (!isCancellationError(e)) {
        throw e;
      }
    }
  };

  return (
    <>
      <button onClick={handleClick}>Perform Work</button>
      <p data-testid="is-running">{new String(workTaskState.isRunning)}</p>
      <p data-testid="perform-count">{workTaskState.performCount}</p>
    </>
  );
}
