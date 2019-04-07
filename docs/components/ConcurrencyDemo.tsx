import React, { useState } from "react";
import styled from "@emotion/styled";
import useTask, { timeout } from "use-task";

import { TextButton } from "./Button";
import BaseProgressBar from "./ProgressBar";

const Task = styled.div`
  display: flex;
  margin-bottom: 10px;

  > ${TextButton} {
    margin-left: 10px;
  }
`;

const ProgressBar = styled(BaseProgressBar)`
  flex-grow: 1;
`;

const ConcurrencyDemo = ({ title, keep, ...rest }) => {
  const [progressBars, setProgressBars] = useState([]);

  const [fillProgressBar, fillProgressBarTask] = useTask(
    function*(setProgress) {
      let ticks = 0;

      while (ticks <= 100) {
        yield timeout(100);

        setProgress(ticks);

        ticks++;
      }
    },
    { keep }
  );

  return (
    <div {...rest}>
      <h2>{title}</h2>
      <button
        onClick={() => {
          const index = progressBars.length;
          const setProgress = completion => {
            setProgressBars(state =>
              state.map((current, i) =>
                i === index ? { completion, task: current.task } : current
              )
            );
          };

          const task = fillProgressBar(setProgress);
          setProgressBars(state => [...state, { completion: 0, task }]);
        }}
      >
        Create Progress Bar
      </button>

      <button
        onClick={() => {
          fillProgressBarTask.cancelAll();
          setProgressBars([]);
        }}
      >
        Clear Bars
      </button>
      <hr />
      {progressBars.map((progressBar, index) => (
        <Task key={index}>
          <ProgressBar color="red" completion={progressBar.completion} />
          <TextButton
            disabled={!progressBar.task.current.isRunning}
            onClick={() => {
              progressBar.task.cancel();
            }}
          >
            Cancel!
          </TextButton>
        </Task>
      ))}
    </div>
  );
};

export default ConcurrencyDemo;
