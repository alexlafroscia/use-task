import { renderHook, cleanup, act } from "react-hooks-testing-library";
import useTask from "../../index";
import { TestDeferred as Deferred } from "../../deferred";

afterEach(cleanup);

function perform(result) {
  return result.current[0]();
}

function stateFor(result) {
  return result.current[1];
}

test("it prevents simultaneous async work", async () => {
  const def = new Deferred<undefined>();

  const { result } = renderHook(() =>
    useTask(
      function*() {
        yield def;
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

  expect(first.isCancelled).toBe(true);
  expect(second.isCancelled).not.toBe(true);

  expect(stateFor(result).performCount).toBe(2);
});
