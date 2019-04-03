import { isCancellationError } from "../index";
import CancellationError from "../cancellation-error";

test("it can detect a cancellation error", async () => {
  const error = new CancellationError("Task Cancelled");

  expect(isCancellationError(error)).toBeTruthy();
});

test("it does not recognize other errors", async () => {
  const error = new Error("Task Cancelled");

  expect(isCancellationError(error)).toBeFalsy();
});
