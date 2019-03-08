import React from "react";
import { act } from "react-dom/test-utils";
import { fireEvent, render } from "react-testing-library";
import "jest-dom/extend-expect";

import { SyncWork, AsyncWork, PerformWork } from "../helpers";
import { waitForTaskCompletion } from "../test-helpers";

test("it can perform some synchronous work", async () => {
  const done = jest.fn();

  const { getByText } = render(<PerformWork work={SyncWork} done={done} />);

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  await waitForTaskCompletion();

  expect(done).toBeCalled();
});

test("it can perform some asynchronous work", async () => {
  const done = jest.fn();

  const { getByText, getByTestId } = render(
    <PerformWork work={AsyncWork} done={done} />
  );

  expect(getByTestId("is-running")).toHaveTextContent("false");
  expect(getByTestId("perform-count")).toHaveTextContent("0");

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  expect(getByTestId("is-running")).toHaveTextContent("true");

  await waitForTaskCompletion();

  expect(done).toBeCalled();
  expect(getByTestId("is-running")).toHaveTextContent("false");
});
