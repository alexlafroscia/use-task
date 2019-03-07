import React from "react";
import { act } from "react-dom/test-utils";
import { fireEvent, render } from "react-testing-library";
import "jest-dom/extend-expect";

import { AsyncWork, PerformWork } from "../../helpers";
import { waitForTaskCompletion } from "../../index";

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
