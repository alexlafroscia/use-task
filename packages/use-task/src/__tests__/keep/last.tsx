import { renderHook, cleanup, act } from "react-hooks-testing-library";
import useTask, { timeout } from "../../index";

afterEach(cleanup);

function perform(result) {
  return result.current[0]();
}

function stateFor(result) {
  return result.current[1];
}

test("it prevents simultaneous async work", async () => {
  const done = jest.fn();

  const { result, waitForNextUpdate } = renderHook(() =>
    useTask(
      function*() {
        yield timeout(0);

        done();
      },
      { keep: "last" }
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

  expect(first.isCancelled).toBe(true);
  expect(second.isCancelled).not.toBe(true);

  expect(done).toBeCalledTimes(1);
  expect(stateFor(result).performCount).toBe(2);
});
