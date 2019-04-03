import React from "react";
import useTask, { timeout as wait } from "use-task";

export default function Button({ children, timeout = 1000, ...rest }) {
  const [perform] = useTask(function*() {
    yield wait(timeout);

    alert("Hello!");
  });

  return (
    <button onClick={() => perform()} {...rest}>
      {children}
    </button>
  );
}
