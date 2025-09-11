import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";

export default function Header() {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "center" }}>
        <Box
          component="img"
          src="/logo1.png"
          alt="Logo"
          sx={{ height: 56, objectFit: "contain" }}
        />
      </Toolbar>
    </AppBar>
  );
}
