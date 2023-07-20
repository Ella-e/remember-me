import React from "react";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { purple, blue, red } from "@mui/material/colors";

export const StartBtn = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: purple[500],
  "&:hover": {
    backgroundColor: purple[700],
  },
}));

export const LightBlueBtn = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(blue[100]),
  backgroundColor: blue[100],
  "&:hover": {
    backgroundColor: blue[200],
  },
}));

export const WarningBtn = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(red[100]),
  backgroundColor: red[100],
  "&:hover": {
    backgroundColor: red[200],
  },
}));

export const ThemeBtn = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText("rgba(165, 159, 226, 0.8)"),
  backgroundColor: "rgba(165, 159, 226, 0.8)",
  "&:hover": {
    backgroundColor: "rgba(165, 159, 226, 0.8)",
  },
}));
