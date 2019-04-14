import React from "react";
import { withStyles } from "@material-ui/core/styles";

import Layout from "../layouts/Base";
import Demo from "../components/ConcurrencyDemo";

const styles = () => ({
  demo: {
    marginTop: 10
  }
});

const IndexPage = ({ classes }) => {
  return (
    <Layout>
      <h1>Use Task</h1>

      <Demo className={classes.demo} title="Keep All" keep="all" />
      <Demo className={classes.demo} title="Keep Last" keep="last" />
      <Demo className={classes.demo} title="Keep First" keep="first" />
    </Layout>
  );
};

export default withStyles(styles)(IndexPage);
