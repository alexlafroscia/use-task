import React from "react";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import { MDXProvider } from "@mdx-js/react";

const h1 = ({ children }) => <Typography variant="h1">{children}</Typography>;
const h2 = ({ children }) => <Typography variant="h2">{children}</Typography>;
const h3 = ({ children }) => <Typography variant="h3">{children}</Typography>;
const p = ({ children }) => <Typography variant="body1">{children}</Typography>;
const pre = ({ children }) => (
  <Card component="pre" style={{ padding: "16px", overflow: "auto" }}>
    {children}
  </Card>
);

const componentMap = {
  h1,
  h2,
  h3,
  p,
  pre
};

export default function Provider({ children }) {
  return <MDXProvider components={componentMap}>{children}</MDXProvider>;
}
