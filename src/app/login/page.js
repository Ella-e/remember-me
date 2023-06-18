"use client";
import React, { Suspense, useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import {
  isSignInWithEmailLink,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase-config";
import { Button, Stack, TextField } from "@mui/material";
import MainScreen from "../myHome/page";
import "./page.css";
import { LoadingButton } from "@mui/lab";

const LoginScreen = () => {
  let user = auth.currentUser;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      signInWithEmailAndPassword(auth, email, password)
        .then((authUser) => {
          user = auth.currentUser;
          if (user.emailVerified) {
            router.push("/myHome");
          } else {
            window.confirm(
              "please click the link in your email to verify first"
            );
            setLoading(false);
            signOut(auth);
            router.push("/login");
          }
          // return (<AuthContext.Provider value={{user, setUser}}>
          //     <MainScreen/>
          //     {router.push("/myHome")}
          // </AuthContext.Provider>)
        })
        .catch((error) => {
          handleError(error.message);
        });
    } catch (error) {
      handleError(error.message);
    }
  };

  const handleError = (msg) => {
    setErrMsg(msg);
    if (msg?.indexOf("wrong-password") != -1) {
      setErrMsg("wrong-password");
    } else if (msg?.indexOf("invalid-email") != -1) {
      setErrMsg("invalid-email");
    } else if (msg?.indexOf("too-many-request") != -1) {
      setErrMsg("too-many-request");
    } else {
      setErrMsg("other");
    }
    setLoading(false);
  };

  const resetError = () => {
    setError("");
  };

  return (
    <div className="out-most">
      {/* {error && <div>{error}</div>} */}
      <div className="input-box">
        <Stack>
          <h1 className="title">Login</h1>
        </Stack>
        <form onSubmit={handleLogin}>
          <Stack>
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
            <Stack className="input-item">
              {errMsg === "wrong-password" ? (
                <TextField
                  error
                  id="outlined-error-helper-text"
                  label="Error"
                  helperText="wrong password."
                  onClick={resetError}
                />
              ) : (
                <TextField
                  fullWidth
                  label="password"
                  type="password"
                  name="password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  placeholder="Password"
                />
              )}
            </Stack>
            <Stack>
              {errMsg !== "" && <div>{errMsg}</div>}
              {infoMsg !== "" && <div>{infoMsg}</div>}
            </Stack>
            <Stack className="input-item">
              {loading ? (
                <LoadingButton loading variant="outlined">
                  <span>Login</span>
                </LoadingButton>
              ) : (
                <Button fullWidth variant="outlined" type="submit">
                  Login
                </Button>
              )}
            </Stack>
          </Stack>
        </form>
        <Stack>
          No Account?{" "}
          <AuthProvider>
            <Link href={"/signUp"}>Sign Up</Link>
          </AuthProvider>
        </Stack>
        <Stack>
          Forget Password? <Link href={"/resetPassword"}>Reset password</Link>
        </Stack>
      </div>
    </div>
  );
};

export default LoginScreen;
