import React, { useRef } from "react";
import { act } from "react-dom/test-utils";
import { cleanup, fireEvent, render } from "react-testing-library";
import "jest-dom/extend-expect";

import useTask, { timeout, ignoreCancellation } from "../index";
import { waitForTaskCompletion } from "../test-helpers";

afterEach(cleanup);

test("cancelling an outer task cancels an inner task", async () => {
  const done = jest.fn();

  function PerformWork() {
    const [innerWork] = useTask(function*() {
      yield timeout(0);

      done();
    });
    const [outerWork] = useTask(function*() {
      yield innerWork();
    });

    const taskInstance = useRef<any>();

    return (
      <>
        <button
          onClick={ignoreCancellation(async () => {
            taskInstance.current = outerWork();
            await taskInstance.current;
          })}
        >
          Perform
        </button>
        <button
          onClick={() => {
            taskInstance.current.cancel();
          }}
        >
          Cancel
        </button>
      </>
    );
  }

  const { getByText } = render(<PerformWork />);

  act(() => {
    fireEvent.click(getByText("Perform"));
  });

  act(() => {
    fireEvent.click(getByText("Cancel"));
  });

  await waitForTaskCompletion();

  expect(done).toBeCalledTimes(0);
});
