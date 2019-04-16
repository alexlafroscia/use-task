import { renderHook, cleanup, act } from "react-hooks-testing-library";
import useTask from "../../index";
import { TestDeferred } from "../../deferred";

afterEach(cleanup);

function perform(result) {
  return result.current[0]();
}

function stateFor(result) {
  return result.current[1];
}

test("it prevents simultaneous async work", async () => {
  const def = new TestDeferred();

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

  expect(first.current.isCancelled).toBe(true);
  expect(second.current.isCancelled).toBe(false);

  expect(stateFor(result).performCount).toBe(2);
});
