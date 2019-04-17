import { useRef } from "react";
import useWillUnmount from "@rooks/use-will-unmount";

export default function useUnmountWithState<T extends any>(
  state: T,
  callback: (currentValue: T) => void
) {
  const stateRef = useRef<T>(state);

  // Update the `current` on every render
  stateRef.current = state;

  useWillUnmount(() => {
    callback(stateRef.current);
  });
}
