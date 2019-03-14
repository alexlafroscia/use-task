import React from "react";
import { act } from "react-dom/test-utils";
import { cleanup, fireEvent, render } from "react-testing-library";
import "jest-dom/extend-expect";

import { CancellableAsyncWork, PerformWork } from "../helpers";
import useTask, { timeout } from "../index";
import { waitForTaskCompletion } from "../test-helpers";

beforeEach(function() {
  jest.spyOn(console, "error");
});

afterEach(function() {
  jest.restoreAllMocks();
});

afterEach(cleanup);

test("it cancels the task when the component is unmounted", async () => {
  const { getByText, container } = render(
    <PerformWork work={CancellableAsyncWork} />
  );

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  render(<p>No more component!</p>, { container });

  await waitForTaskCompletion();

  expect(console.error).toBeCalledTimes(0); // eslint-disable-line no-console
});

test("does not cancel when props change", async () => {
  function PerformWorkWithChange({ name = "World" }) {
    const [performWork, taskState] = useTask(function*() {
      yield timeout();

      return "Done!";
    });

    return (
      <>
        <button data-testid="perform" onClick={() => performWork()} />
        <p data-testid="prop">Hello, {name}</p>
        <div data-testid="result">
          {taskState.lastSuccessful && taskState.lastSuccessful.result}
        </div>
      </>
    );
  }

  const { getByTestId, container } = render(<PerformWorkWithChange />);

  act(() => {
    fireEvent.click(getByTestId("perform"));
  });

  render(<PerformWorkWithChange name="Alex" />, { container });

  await waitForTaskCompletion();

  expect(getByTestId("prop")).toHaveTextContent("Hello, Alex");
  expect(getByTestId("result")).toHaveTextContent("Done!");
  expect(console.error).toBeCalledTimes(0);
});
