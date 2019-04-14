import React from "react";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import { Menu as MenuIcon } from "@material-ui/icons";

const styles = () => ({
  menuButton: {
    marginRight: 20
  }
});

const BaseLayout = ({ classes, children }) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" noWrap>
            useTask
          </Typography>
        </Toolbar>
      </AppBar>
      {children}
    </>
  );
};

export default withStyles(styles)(BaseLayout);
