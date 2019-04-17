import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { TestDeferred, perform, stateFor } from "../helpers";
import useTask, { timeout } from "../../src";

afterEach(cleanup);

test("it allows multiple tasks to run at a time", async () => {
  const done = jest.fn();

  let first, second;

  const { result } = renderHook(() =>
    useTask(
      function*() {
        yield timeout(0);
        done();
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

  await Promise.all([first, second]);

  expect(done).toBeCalledTimes(2);
  expect(stateFor(result).performCount).toBe(2);
});

test("does not cancel existing runs when one completes", async () => {
  const def1 = new TestDeferred<string>();
  const def2 = new TestDeferred<string>();
  let first = true;

  const { result, waitForNextUpdate } = renderHook(() =>
    useTask(
      function*() {
        let value;

        if (first) {
          value = yield def1;
        } else {
          value = yield def2;
        }

        return value;
      },
      { keep: "all" }
    )
  );

  act(() => {
    perform(result);
  });

  await timeout(0);
  first = false;

  act(() => {
    perform(result);
  });

  def2.resolve("second");
  await waitForNextUpdate();

  let state = stateFor(result);
  expect(state.lastSuccessful && state.lastSuccessful.result).toBe("second");

  def1.resolve("first");
  await waitForNextUpdate();

  state = stateFor(result);
  expect(state.lastSuccessful && state.lastSuccessful.result).toBe("first");
});
