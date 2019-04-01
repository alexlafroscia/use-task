import { renderHook, cleanup, act } from "react-hooks-testing-library";
import useTask, { timeout } from "../index";
import Deferred from "../deferred";

afterEach(cleanup);

function perform(result) {
  return result.current[0]();
}

test("cancelling an outer task cancels an inner task", async () => {
  const beforeCancel = jest.fn();
  const afterCancel = jest.fn();

  const def = new Deferred<undefined>();

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
    outerInstance.cancel();
  });

  expect(beforeCancel).toBeCalled();
  expect(afterCancel).not.toBeCalled();

  expect(outerInstance.isCancelled).toBe(true);
});
