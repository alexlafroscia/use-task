import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import useTask, { timeout } from "use-task";

const styles = () => ({
  task: {
    alignItems: "center",
    display: "flex",
    marginBottom: 10
  }
});

const ConcurrencyDemo = ({ title, keep, classes, ...rest }) => {
  const [fillProgressBar, fillProgressBarTask] = useTask(
    function*(setProgress) {
      let ticks = 0;

      while (ticks <= 100) {
        yield timeout(40);

        setProgress(ticks);

        ticks++;
      }
    },
    { keep }
  );

  const [progressBars, setProgressBars] = useState<
    {
      completion: number;
      task: ReturnType<typeof fillProgressBar>;
    }[]
  >([]);

  return (
    <div {...rest}>
      <h2>{title}</h2>
      <Button
        size="small"
        variant="contained"
        color="primary"
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
      </Button>

      <Button
        size="small"
        onClick={() => {
          fillProgressBarTask.cancelAll();
          setProgressBars([]);
        }}
      >
        Clear Bars
      </Button>
      <hr />
      {progressBars.map((progressBar, index) => (
        <div className={classes.task} key={index}>
          <LinearProgress
            style={{ flexGrow: 1 }}
            color="secondary"
            variant="determinate"
            value={progressBar.completion}
          />
          <Button
            style={{ marginLeft: 10 }}
            size="small"
            disabled={!progressBar.task.current.isRunning}
            onClick={() => {
              progressBar.task.cancel();
            }}
          >
            Cancel!
          </Button>
        </div>
      ))}
    </div>
  );
};

export default withStyles(styles)(ConcurrencyDemo);
