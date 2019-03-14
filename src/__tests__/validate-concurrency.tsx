import React from "react";
import { cleanup, render } from "react-testing-library";

import { SyncWork, PerformWork } from "../helpers";

afterEach(cleanup);

test("it prevents changing concurrency strategies", () => {
  jest.spyOn(console, "error").mockImplementation();

  const { container } = render(<PerformWork work={SyncWork} />);

  expect(() => {
    render(<PerformWork work={SyncWork} taskConfig={{ keep: "first" }} />, {
      container
    });
  }).toThrow(/Cannot dynamically change how to handle concurrent tasks/);
});
