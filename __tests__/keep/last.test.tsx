import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { TestDeferred, perform, stateFor } from "../helpers";
import useTask from "../../src";

afterEach(cleanup);

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
