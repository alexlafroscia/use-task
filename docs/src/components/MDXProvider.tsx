import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { MDXProvider } from "@mdx-js/react";

const h1 = ({ children }) => <Typography variant="h1">{children}</Typography>;
const h2 = ({ children }) => <Typography variant="h2">{children}</Typography>;
const p = ({ children }) => <Typography variant="body1">{children}</Typography>;
const pre = ({ children }) => (
  <Card>
    <CardContent>
      <pre style={{ margin: 0 }}>{children}</pre>
    </CardContent>
  </Card>
);

const componentMap = {
  h1,
  h2,
  p,
  pre
};

export default function Provider({ children }) {
  return <MDXProvider components={componentMap}>{children}</MDXProvider>;
}
