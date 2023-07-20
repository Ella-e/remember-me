"use client";
import React from "react";
import Link from "next/link";
import css from "./page.module.css";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { styled } from "@mui/material/styles";
import { purple } from "@mui/material/colors";
import { StartBtn } from "./utils/customBtn";

export default function Home() {
  // const StartBtn = styled(Button)(({ theme }) => ({
  //   color: theme.palette.getContrastText(purple[500]),
  //   backgroundColor: purple[500],
  //   "&:hover": {
  //     backgroundColor: purple[700],
  //   },
  // }));

  const router = useRouter();
  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div
      className={css.bg}
      style={{
        height: "100vh",
        width: "100%",
        padding: "0px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 className={css.title}>Welcome to rememberMe</h1>
      <p className={css.subTitle}>
        Keep our love alive, they will never fade away -- COCO
      </p>
      <StartBtn variant="contained" onClick={handleLogin}>
        Your journey starts here
      </StartBtn>
      {/* <Link className={css.loginBtn} href="/login">
        Click here to login
      </Link> */}
      {/* <Link
        className={css.signUpBtn}
        href="/signUp"
        style={{ marginBottom: "33vh" }}
      >
        Click here to create an account
      </Link> */}
    </div>
  );
}
