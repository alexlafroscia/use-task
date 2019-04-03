import React from "react";
import styled from "@emotion/styled";
import useTask, { timeout as wait } from "use-task";

const BlueButton = styled.button`
  color: blue;
`;

export default function Button({ children, timeout = 1000, ...rest }) {
  const [perform] = useTask(function*() {
    yield wait(timeout);

    alert("Hello!");
  });

  return (
    <BlueButton onClick={() => perform()} {...rest}>
      {children}
    </BlueButton>
  );
}
