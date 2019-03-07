import React from "react";
import { render } from "react-testing-library";

import { SyncWork, PerformWork } from "../helpers";

test("it validates the concurrency approach", () => {
  spyOn(console, "error");

  expect(() => {
    render(
      // @ts-ignore
      <PerformWork work={SyncWork} taskConfig={{ concurrency: "something" }} />
    );
  }).toThrow(/Unknown concurrency type/);
});

test("it prevents changing concurrency strategies", () => {
  spyOn(console, "error");

  const { container } = render(<PerformWork work={SyncWork} />);

  expect(() => {
    render(
      <PerformWork work={SyncWork} taskConfig={{ concurrency: "drop" }} />,
      { container }
    );
  }).toThrow(/Cannot dynamically change concurrency type/);
});
