import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { TestDeferred } from "./helpers";
import { useTaskWithSignal, timeout } from "../src";
import {
  SignalReceivingFunction,
  UseTaskWithSignalResult,
  NonSignalParameters
} from "../src/types";

afterEach(cleanup);

interface TaskInstanceResultRef<T extends SignalReceivingFunction> {
  current: UseTaskWithSignalResult<T>;
}

function perform<T extends SignalReceivingFunction>(
  result: TaskInstanceResultRef<T>,
  ...args: NonSignalParameters<T>
) {
  return result.current[0](...args);
}

test("exposing the signal from the task", async () => {
  const def = new TestDeferred();
  const aborted = jest.fn();
  const { result } = renderHook(() =>
    useTaskWithSignal(function*(signal) {
      signal.addEventListener("abort", aborted);

      def.resolve();
      yield timeout(0);
    })
  );

  let instance;
  act(() => {
    instance = perform(result);
  });

  await def;

  instance.abortController.abort();

  expect(aborted).toBeCalled();
});

test("passing arguments to `perform`", async () => {
  const def = new TestDeferred<string>();
  const aborted = jest.fn();
  const { result } = renderHook(() =>
    useTaskWithSignal(function*(signal, foo: string) {
      signal.addEventListener("abort", aborted);

      def.resolve(foo);
      yield timeout(0);
    })
  );

  act(() => {
    perform(result, "foo");
  });

  const resolution = await def;

  expect(resolution).toBe("foo");
});
