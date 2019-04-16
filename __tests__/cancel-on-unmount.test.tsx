import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { TestDeferred, perform } from "./helpers";
import useTask, { timeout } from "../src";
import AbortError from "../src/abort-error";

afterEach(cleanup);

test("it cancels the task when the component is unmounted", async () => {
  const handleError = jest.fn();
  const { result, unmount } = renderHook(() =>
    useTask(function*() {
      yield timeout(0);
    })
  );

  act(() => {
    perform(result).catch(handleError);
  });

  unmount();

  // Wait a tick for the promise rejection to be handled
  await timeout(0);

  expect(handleError).toBeCalledWith(expect.any(AbortError));
});

test("does not cancel when props change", async () => {
  const def = new TestDeferred();
  const handleError = jest.fn();
  const { result, rerender } = renderHook(() =>
    useTask(function*() {
      yield def;
      return "Done!";
    })
  );

  let instance;

  act(() => {
    instance = perform(result).catch(handleError);
  });

  rerender();

  def.resolve(undefined);
  await instance;

  expect(handleError).toBeCalledTimes(0);
});
