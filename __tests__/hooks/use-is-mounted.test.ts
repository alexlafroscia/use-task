import { renderHook, cleanup } from "react-hooks-testing-library";
import useIsMounted from "../../src/hooks/use-is-mounted";

afterEach(cleanup);

test("returning a ref to the mounted state", () => {
  const { result, unmount } = renderHook(() => useIsMounted());

  expect(result.current.current).toBe(true);

  unmount();

  expect(result.current.current).toBe(false);
});
