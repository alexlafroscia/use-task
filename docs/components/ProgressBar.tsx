import React from "react";
import styled from "@emotion/styled";
import { setLightness } from "polished";

type Color = "red" | "blue";

const colorMap = {
  red: "red",
  blue: "blue"
};

type OuterProps = {
  color: string;
};
const ProgressBarOuter = styled.div`
  height: 20px;
  border: 2px solid ${(props: OuterProps) => props.color};
`;

type InnerProps = {
  completionPercentage: number;
  color: string;
};
const ProgressBarInner = styled.div`
  background: ${(props: InnerProps) => props.color};
  height: 100%;
  width: ${(props: InnerProps) => props.completionPercentage}%;
`;

type ProgressBarProps = {
  completion: number;
  color: Color;
};

export default function ProgressBar({
  completion = 0,
  color = "red",
  ...rest
}: ProgressBarProps) {
  const themeColor = colorMap[color];
  const lightColor = setLightness(0.8, themeColor);

  return (
    <ProgressBarOuter color={themeColor} {...rest}>
      <ProgressBarInner completionPercentage={completion} color={lightColor} />
    </ProgressBarOuter>
  );
}
