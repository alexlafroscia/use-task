import { renderHook, cleanup, act } from "react-hooks-testing-library";
import useTask, { timeout } from "..";

function perform(result) {
  return result.current[0]();
}

function stateFor(result) {
  return result.current[1];
}

beforeEach(function() {
  jest.spyOn(console, "error");
});

afterEach(function() {
  jest.clearAllMocks();
});

afterEach(cleanup);

test("it cancels the task when the component is unmounted", async () => {
  const { result, unmount } = renderHook(() =>
    useTask(function*() {
      yield timeout(0);
    })
  );

  let lastInstance;

  act(() => {
    lastInstance = perform(result);
  });

  unmount();

  expect(lastInstance.isCancelled).toBe(true);
  expect(console.error).toBeCalledTimes(0); // eslint-disable-line no-console
});

test("does not cancel when props change", async () => {
  const { result, rerender, waitForNextUpdate } = renderHook(() =>
    useTask(function*() {
      yield timeout(0);
      return "Done!";
    })
  );

  act(() => {
    perform(result);
  });

  rerender();

  await waitForNextUpdate();

  expect(stateFor(result).lastSuccessful.result).toBe("Done!");
  expect(console.error).toBeCalledTimes(0);
});
