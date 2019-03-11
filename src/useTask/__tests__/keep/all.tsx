import React from "react";
import { act } from "react-dom/test-utils";
import { fireEvent, render, wait } from "react-testing-library";
import "jest-dom/extend-expect";

import { AsyncWork, PerformWork } from "../../helpers";
import { waitForTaskCompletion } from "../../test-helpers";
import useTask from "../../index";
import Deferred from "../../deffered";

test("it allows multiple tasks to run at a time", async () => {
  const done = jest.fn();

  const { getByText, getByTestId } = render(
    <PerformWork work={AsyncWork} taskConfig={{ keep: "all" }} done={done} />
  );

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  await waitForTaskCompletion();

  expect(done).toBeCalledTimes(2);
  expect(getByTestId("perform-count")).toHaveTextContent("2");
});

test("does not cancel existing runs when one completes", async () => {
  jest.spyOn(console, "error");

  const def1 = new Deferred();
  const def2 = new Deferred();
  let first = true;

  function PerformWorkTwice() {
    const [performWork, taskState] = useTask(
      function*() {
        let value;

        if (first) {
          value = yield def1;
        } else {
          value = yield def2;
        }

        return value;
      },
      { keep: "all" }
    );

    return (
      <>
        <button data-testid="perform" onClick={() => performWork()} />
        <div data-testid="last-result">
          {taskState.lastSuccessful && taskState.lastSuccessful.result}
        </div>
      </>
    );
  }

  const { getByTestId } = render(<PerformWorkTwice />);

  act(() => {
    fireEvent.click(getByTestId("perform"));
  });

  first = false;

  act(() => {
    fireEvent.click(getByTestId("perform"));
  });

  def2.resolve("second");
  await wait();

  expect(getByTestId("last-result")).toHaveTextContent("second");

  def1.resolve("first");
  await wait();

  expect(getByTestId("last-result")).toHaveTextContent("first");
});
