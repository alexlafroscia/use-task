import React from "react";
import { act } from "react-dom/test-utils";
import { fireEvent, render, wait } from "react-testing-library";
import "jest-dom/extend-expect";

import useTask, { timeout, isCancellationError } from "../index";

test("it can detect a cancellation error", async () => {
  let error;

  function SurfaceCancellationError() {
    const [perform] = useTask(function*() {
      yield timeout();
    });

    return (
      <button
        onClick={async () => {
          try {
            await perform();
          } catch (e) {
            error = e;
          }
        }}
      >
        Perform
      </button>
    );
  }

  const { getByText } = render(<SurfaceCancellationError />);

  act(() => {
    fireEvent.click(getByText("Perform"));
  });

  act(() => {
    fireEvent.click(getByText("Perform"));
  });

  await wait();

  expect(isCancellationError(error)).toBeTruthy();
});
