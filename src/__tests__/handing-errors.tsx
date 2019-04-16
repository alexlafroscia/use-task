/* eslint-disable require-yield */

import { renderHook, cleanup, act } from "react-hooks-testing-library";
import useTask, { timeout } from "../index";
import { TestDeferred } from "../deferred";

afterEach(cleanup);

function perform(result) {
  return result.current[0]();
}

function stateFor(result) {
  return result.current[1];
}

test("it can handle an error thrown immediately in a task", async () => {
  const error = new Error("Something went wrong");
  const handleError = jest.fn();

  const def = new TestDeferred();
  let taskInstance;

  const { result } = renderHook(() =>
    useTask(function*() {
      def.resolve(undefined);
      throw error;
    })
  );

  act(() => {
    taskInstance = perform(result);
    taskInstance.catch(handleError);
  });

  await def;

  // Check task state
  expect(taskInstance.current.isComplete).toBe(true);
  expect(taskInstance.current.isRunning).toBe(false);
  expect(taskInstance.current.isCancelled).toBe(false);

  // Check access to error object
  expect(taskInstance.current.error).toBe(error);

  // Check `perform` surfacing the error
  expect(handleError).toBeCalledWith(error);
});

test("it can handle an error thrown later in a task", async () => {
  const error = new Error("Something went wrong");
  const handleError = jest.fn();

  const def = new TestDeferred();
  let taskInstance;

  const { result } = renderHook(() =>
    useTask(function*() {
      yield timeout(0);
      def.resolve(undefined);
      throw error;
    })
  );

  act(() => {
    taskInstance = perform(result);
    taskInstance.catch(handleError);
  });

  await def;

  // Check task state
  expect(taskInstance.current.isComplete).toBe(true);
  expect(taskInstance.current.isRunning).toBe(false);
  expect(taskInstance.current.isCancelled).toBe(false);

  // Check access to error object
  expect(taskInstance.current.error).toBe(error);

  // Check `perform` surfacing the error
  expect(handleError).toBeCalledWith(error);
});

test("it does not report an errored task as the last successful task", async () => {
  const error = new Error("Something went wrong");

  const def = new TestDeferred();
  let instance;

  const { result } = renderHook(() =>
    useTask(function*() {
      def.resolve(undefined);
      throw error;
    })
  );

  act(() => {
    instance = perform(result);
  });

  await def;

  expect(instance.current.error).not.toBeUndefined();
  expect(stateFor(result).lastSucessful).toBe(undefined);
});
