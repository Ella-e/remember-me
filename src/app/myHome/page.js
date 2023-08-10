"use client";
import React from "react";
import MyHeader from "./MyHeader";
import css from "./page.module.css";
import { Backdrop, CircularProgress } from "@mui/material";
import TreeProjects from "../treeProjects/page";

const MainScreen = () => {
  return (
    <div>
      <MyHeader />
      <div className={css.layout}>
        <TreeProjects />
      </div>
    </div>
  );
};

export default MainScreen;
