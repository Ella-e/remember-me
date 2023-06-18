"use client";
import { Button, Stack, TextField } from "@mui/material";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../firebase-config";
import "./page.css";

const resetPassword = () => {
  const [email, setEmail] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [error, setError] = useState("");
  const retrievePwd = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setInfoMsg("Password Reset link send to your email");
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <div className="out-most">
      <div className="input-box">
        <h1>Reset password</h1>
        <form onSubmit={retrievePwd}>
          <Stack className="input-item">
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
          <Button fullWidth variant="outlined" type="submit">
            Send password reset link
          </Button>
        </form>
      </div>
    </div>
  );
};

export default resetPassword;
