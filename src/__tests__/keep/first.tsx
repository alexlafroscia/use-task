import React from "react";
import { act } from "react-dom/test-utils";
import { cleanup, fireEvent, render } from "react-testing-library";
import "jest-dom/extend-expect";

import { AsyncWork, PerformWork } from "../../helpers";
import { waitForTaskCompletion } from "../../test-helpers";

afterEach(cleanup);

test("it prevents simultaneous async work", async () => {
  const done = jest.fn();

  const { getByText, getByTestId } = render(
    <PerformWork work={AsyncWork} taskConfig={{ keep: "first" }} done={done} />
  );

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  act(() => {
    fireEvent.click(getByText("Perform Work"));
  });

  await waitForTaskCompletion();

  expect(done).toBeCalledTimes(1);
  expect(getByTestId("perform-count")).toHaveTextContent("2");
});
