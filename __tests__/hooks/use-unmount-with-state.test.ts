import { renderHook, cleanup } from "react-hooks-testing-library";
import useUnmountWithState from "../../src/hooks/use-unmount-with-state";

afterEach(cleanup);

test("it calls the unmount callback with the latest state", () => {
  const done = jest.fn();
  const { rerender, unmount } = renderHook(
    ({ value }) => useUnmountWithState(value, done),
    {
      initialProps: {
        value: "First"
      }
    }
  );

  rerender({ value: "Second" });

  unmount();

  expect(done).toBeCalledTimes(1);
  expect(done).toBeCalledWith("Second");
});
