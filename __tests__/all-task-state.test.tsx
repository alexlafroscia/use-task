import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { TestDeferred, perform, stateFor } from "./helpers";
import useTask, { timeout } from "../src";

afterEach(cleanup);

test("allows cancelling all task instances", async () => {
  let first, second;

  const { result } = renderHook(() =>
    useTask(
      function*() {
        yield timeout(0);
      },
      { keep: "all" }
    )
  );

  act(() => {
    first = perform(result);
  });

  act(() => {
    second = perform(result);
  });

  expect(first.current.isCancelled).toBe(false);
  expect(second.current.isCancelled).toBe(false);

  stateFor(result).cancelAll();

  expect(first.current.isCancelled).toBe(true);
  expect(second.current.isCancelled).toBe(true);
});

test("exposing whether any instance is running", async () => {
  const def = new TestDeferred();

  const { result, waitForNextUpdate } = renderHook(() =>
    useTask(function*() {
      yield def;
    })
  );

  expect(stateFor(result).isRunning).toBe(false);

  act(() => {
    perform(result);
  });

  expect(stateFor(result).isRunning).toBe(true);

  def.resolve(undefined);

  await waitForNextUpdate();

  expect(stateFor(result).isRunning).toBe(false);
});
