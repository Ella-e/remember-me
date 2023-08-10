"use client";
import { Stack, TextField } from "@mui/material";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../firebase-config";
import css from "./page.module.css";
import { StartBtn } from "../utils/customBtn";
import { message } from "antd";

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
    if (email === "") {
      message.error("Please enter your email");
    }
    else {
      sendPasswordResetEmail(user.auth, email)
        .then(() => {
          setInfoMsg("Password Reset link send to your email");
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  };

  return (
    <div className={css.outMost}>
      <div className={css.inputBox}>
        <h1>Reset password</h1>
        <form onSubmit={retrievePwd}>
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
          <StartBtn fullWidth variant="outlined" type="submit">
            Reset Password
          </StartBtn>
        </form>
      </div>
    </div>
  );
};

export default resetPassword;
