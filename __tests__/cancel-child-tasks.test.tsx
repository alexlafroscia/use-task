import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { TestDeferred, perform } from "./helpers";
import useTask, { timeout } from "../src/index";

afterEach(cleanup);

test("cancelling an outer task cancels an inner task", async () => {
  const beforeCancel = jest.fn();
  const afterCancel = jest.fn();

  const def = new TestDeferred();

  const { result } = renderHook(() => {
    const [innerWork] = useTask(function*() {
      beforeCancel();

      yield def.resolve(undefined);
      yield timeout(0);

      afterCancel();
    });

    return useTask(function*() {
      yield innerWork();
    });
  });

  let outerInstance;

  act(() => {
    outerInstance = perform(result);
  });

  await def;

  act(() => {
    outerInstance.abortController.abort();
  });

  expect(beforeCancel).toBeCalled();
  expect(afterCancel).not.toBeCalled();

  expect(outerInstance.current.isCancelled).toBe(true);
});
