import { useRef } from "react";
import useWillUnmount from "@rooks/use-will-unmount";

export default function useIsMounted() {
  const isMountedRef = useRef(true);

  useWillUnmount(() => {
    isMountedRef.current = false;
  });

  return isMountedRef;
}
