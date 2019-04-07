import { renderHook, cleanup, act } from "react-hooks-testing-library";
import useTask, { timeout } from "..";
import { TestDeferred as Deferred } from "../deferred";

afterEach(cleanup);

function perform(result) {
  return result.current[0]();
}

function stateFor(result) {
  return result.current[1];
}

test("allows cancelling all task instances", async () => {
  let first, second;

  const { result, waitForNextUpdate } = renderHook(() =>
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
  await waitForNextUpdate();

  expect(first.current.isCancelled).toBe(true);
  expect(second.current.isCancelled).toBe(true);
});

test("exposing whether any instance is running", async () => {
  const def = new Deferred<undefined>();

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
