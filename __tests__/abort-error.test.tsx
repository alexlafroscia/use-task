import AbortError, { isAbortError } from "../src/utils/abort-error";

describe("AbortError", () => {
  test("has the right name", () => {
    const error = new AbortError("Task Cancelled");

    expect(error.name).toBe("AbortError");
  });
});

describe("isAbortError", () => {
  test("it can detect an abort error", () => {
    const error = new AbortError("Task Cancelled");

    expect(isAbortError(error)).toBeTruthy();
  });

  test("it does not recognize other errors", () => {
    const error = new Error("Task Cancelled");

    expect(isAbortError(error)).toBeFalsy();
  });
});
