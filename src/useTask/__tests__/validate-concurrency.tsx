import React from "react";
import { render } from "react-testing-library";

import { SyncWork, PerformWork } from "../helpers";

test("it prevents changing concurrency strategies", () => {
  spyOn(console, "error");

  const { container } = render(<PerformWork work={SyncWork} />);

  expect(() => {
    render(<PerformWork work={SyncWork} taskConfig={{ keep: "first" }} />, {
      container
    });
  }).toThrow(/Cannot dynamically change how to handle concurrent tasks/);
});
