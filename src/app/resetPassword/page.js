"use client";
import { Stack, TextField } from "@mui/material";
import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../firebase-config";
import css from "./page.module.css";
import { StartBtn } from "../utils/customBtn";
import { message } from "antd";
import Link from "next/link";

const resetPassword = () => {
  const [email, setEmail] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });
  });

  const retrievePwd = () => {
    //FIXME:
    if (!email) {
      window.confirm("please enter your email");
      // message.error("Please enter your email");
    } else {
      const myAuth = getAuth();
      sendPasswordResetEmail(myAuth, email)
        .then(() => {
          window.confirm("Password reset link has sent to your email");
        })
        .catch((err) => {
          window.confirm(err.message + " Please contact the team.");
          setError(err.message);
        });
    }
  };

  return (
    <div className={css.outMost}>
      <div className={css.inputBox}>
        <h1>Reset password</h1>
        <Stack className={css.inputItem}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={email || ""}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            placeholder="Email"
          />
        </Stack>
        {error !== "" && <div>{error}</div>}
        {infoMsg !== "" && <div>{infoMsg}</div>}
        <StartBtn fullWidth variant="outlined" onClick={retrievePwd}>
          Reset Password
        </StartBtn>
        <Stack>
          <Link href={"/login"}>login</Link>
        </Stack>
      </div>
    </div>
  );
};

export default resetPassword;
