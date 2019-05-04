import React, { useState } from "react";
import { withStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import useTask, { timeout } from "use-task";

const styles = (theme: Theme) => ({
  task: {
    alignItems: "center",
    display: "flex",
    marginBottom: theme.spacing.unit
  },
  clearAllButton: {
    marginLeft: theme.spacing.unit
  },
  progressBar: {
    flexGrow: 1
  },
  cancelButton: {
    marginLeft: theme.spacing.unit
  }
});

const ConcurrencyDemo = ({ keep, classes, ...rest }) => {
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
        className={classes.clearAllButton}
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
            className={classes.progressBar}
            color="secondary"
            variant="determinate"
            value={progressBar.completion}
          />
          <Button
            className={classes.cancelButton}
            size="small"
            disabled={!progressBar.task.current.isRunning}
            onClick={() => {
              progressBar.task.abortController.abort();
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
