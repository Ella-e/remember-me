"use client";
import React, { Suspense, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import {
  browserLocalPersistence,
  isSignInWithEmailLink,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase-config";
import { Button, Stack, TextField } from "@mui/material";
import MainScreen from "../myHome/page";
import css from "./page.module.css";
import { LoadingButton } from "@mui/lab";
import { StartBtn } from "../utils/customBtn";
import Cookies from "js-cookie";
import bscrypt from "bcryptjs";
import { collection, getDocs, query, where } from "firebase/firestore";

const LoginScreen = () => {
  let user = auth.currentUser;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // const [token, setToken] = useState(null);
  // const [passPwdCheck, setPassPwdCheck] = useState(false);

  // useEffect(() => {
  //   setToken(Cookies.get("token"));
  // }, []);

  // const handleSaveToken = (token, hashPwd) => {
  //   Cookies.set("token", token, {
  //     expires: 7,
  //     sameSite: "strict",
  //   });
  //   Cookies.set("hashPwd", hashPwd, {
  //     expires: 7,
  //     sameSite: "strict",
  //   });
  // };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      // compare the pwd
      // check if user is in the database && get the hashed pwd from database
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        bscrypt.compare(password, docData.hashPwd, function (err, isMatch) {
          if (err) {
            setErrMsg(err.message);
          } else if (!isMatch) {
            //password incorrect
            setErrMsg("password incorrect");
          } else {
            // password match
            setPersistence(auth, browserLocalPersistence).then(() => {
              signInWithEmailAndPassword(auth, email, docData.hashPwd)
                .then((authUser) => {
                  user = auth.currentUser;
                  if (user.emailVerified) {
                    // handleSaveToken(JSON.stringify(user), docData.hashPwd);
                    router.push("/myHome");
                  } else {
                    window.confirm(
                      "please click the link in your email to verify first"
                    );
                    setLoading(false);
                    signOut(auth);
                    router.push("/login");
                  }
                })
                .catch((error) => {
                  handleError(error.message);
                });
            });
          }
        });
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
      setErrMsg(msg);
    }
    setLoading(false);
  };

  const resetError = () => {
    setError("");
  };

  return (
    <div className={css.outMost}>
      {/* {error && <div>{error}</div>} */}
      {/* <img src="bg_2_blur.jpg" alt="bg" /> */}
      <div className={css.inputBox}>
        <Stack>
          <h1 className="title">Login</h1>
        </Stack>
        <form onSubmit={handleLogin}>
          <Stack>
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
            <Stack className={css.inputItem}>
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
            <Stack className={css.inputItem}>
              {loading ? (
                <LoadingButton loading variant="outlined">
                  <span>Login</span>
                </LoadingButton>
              ) : (
                <StartBtn fullWidth variant="outlined" type="submit">
                  Login
                </StartBtn>
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
