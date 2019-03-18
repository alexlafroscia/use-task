import React from "react";

import useTask, { UseTaskConfig, timeout, ignoreCancellation } from "./index";

type CallBack = () => void;
type Work = (done: CallBack) => void;

export function SyncWork(done: CallBack) {
  done();
}

export async function AsyncWork(done: CallBack) {
  await timeout();

  done();
}

export function* CancellableAsyncWork(done: CallBack) {
  yield timeout();

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

  const handleClick = ignoreCancellation(async () => {
    await performWork(done);
  });

  return (
    <>
      <button onClick={handleClick}>Perform Work</button>
      <p data-testid="is-running">{new String(workTaskState.isRunning)}</p>
      <p data-testid="perform-count">{workTaskState.performCount}</p>
    </>
  );
}
