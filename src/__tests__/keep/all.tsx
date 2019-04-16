import { renderHook, cleanup, act } from "react-hooks-testing-library";
import useTask, { timeout } from "../../index";
import { TestDeferred } from "../../deferred";

afterEach(cleanup);

function perform(result) {
  return result.current[0]();
}

function stateFor(result) {
  return result.current[1];
}

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

  expect(stateFor(result).lastSuccessful.result).toBe("second");

  def1.resolve("first");
  await waitForNextUpdate();

  expect(stateFor(result).lastSuccessful.result).toBe("first");
});
