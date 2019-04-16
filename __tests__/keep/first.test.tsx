import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { perform, stateFor } from "../helpers";
import useTask from "../../src";

afterEach(cleanup);

test("it prevents simultaneous async work", async () => {
  const done = jest.fn();

  const { result, waitForNextUpdate } = renderHook(() =>
    useTask(
      async function() {
        done();
      },
      { keep: "first" }
    )
  );

  let first;
  let second;

  act(() => {
    first = perform(result);
  });

  act(() => {
    second = perform(result);
  });

  await waitForNextUpdate();

  expect(first.current.isCancelled).toBe(false);
  expect(second.current.isCancelled).toBe(true);

  expect(done).toBeCalledTimes(1);
  expect(stateFor(result).performCount).toBe(2);
});
