/* eslint-disable require-yield */

import React, { useEffect } from "react";
import { act } from "react-dom/test-utils";
import { cleanup, fireEvent, render } from "react-testing-library";
import "jest-dom/extend-expect";

import useTask from "../index";
import { waitForTaskCompletion } from "../test-helpers";

afterEach(cleanup);

test("it can handle an error thrown immediately in a task", async () => {
  const error = new Error("Something went wrong");
  const handleError = jest.fn();

  let taskInstance;

  function ErrorInWork() {
    const [doIt] = useTask(function*() {
      throw error;
    });

    return (
      <button
        onClick={async () => {
          try {
            taskInstance = doIt();
            await taskInstance;
          } catch (e) {
            handleError(e);
          }
        }}
      >
        Perform Work
      </button>
    );
  }

  const { getByText } = render(<ErrorInWork />);

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  await waitForTaskCompletion();

  // Check task state
  expect(taskInstance.isComplete).toBe(true);
  expect(taskInstance.isRunning).toBe(false);
  expect(taskInstance.isCancelled).toBe(false);

  // Check access to error object
  expect(taskInstance.error).toBe(error);

  // Check `perform` surfacing the error
  expect(handleError).toBeCalledWith(error);
});

test("it can handle a promise rejection in a test", async () => {
  const error = new Error("Something went wrong");
  const handleError = jest.fn();

  let taskInstance;

  function ErrorInWork() {
    const [doIt] = useTask(function*() {
      yield Promise.reject(error);
    });

    return (
      <button
        onClick={async () => {
          try {
            taskInstance = doIt();
            await taskInstance;
          } catch (e) {
            handleError(e);
          }
        }}
      >
        Perform Work
      </button>
    );
  }

  const { getByText } = render(<ErrorInWork />);

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  await waitForTaskCompletion();

  // Check task state
  expect(taskInstance.isComplete).toBe(true);
  expect(taskInstance.isRunning).toBe(false);
  expect(taskInstance.isCancelled).toBe(false);

  // Check access to error object
  expect(taskInstance.error).toBe(error);

  // Check `perform` surfacing the error
  expect(handleError).toBeCalledWith(error);
});

test("it does not report an errored task as the last successful task", async () => {
  const error = new Error("Something went wrong");
  let state;

  function ErrorInWork() {
    const [doIt, taskState] = useTask(function*() {
      yield Promise.reject(error);
    });

    useEffect(function() {
      state = taskState;
    });

    return <button onClick={() => doIt()}>Perform Work</button>;
  }

  const { getByText } = render(<ErrorInWork />);

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  await waitForTaskCompletion();

  expect(state.lastSuccessful).toBe(undefined);
});
