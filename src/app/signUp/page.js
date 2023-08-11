"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase-config";
import { Backdrop, CircularProgress, Stack, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Link from "next/link";
import css from "./page.module.css";
import { doc, setDoc } from "firebase/firestore";
import { StartBtn } from "../utils/customBtn";
import bscrypt from "bcryptjs";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  let user = auth.currentUser;
  const [infoMsg, setInfoMsg] = useState("");
  const actionCodeSetting = {
    url: "http://localhost:3000/login",
    handleCodeInApp: true,
  };

  //   React.useEffect(() => {
  //     user = auth.currentUser;
  //     if (user.emailVerified) {
  //       const saved_email = window.localStorage.getItem("email");
  //       router.push("/myHome");
  //     } else {
  //       signOut(auth);
  //     }
  //   }, []);

  const handleSignUp = (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    // Email link verification
    window.localStorage.setItem("email", email);
    // hash the pwd
    // const hashPwd = bscrypt.hashSync(password, 10);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (authUser) => {
        user = auth.currentUser;
        // add user into the database
        await setDoc(doc(db, "users", authUser.user.uid), {
          email: email,
          uid: authUser.user.uid,
        });
        // send email verification
        sendEmailVerification(user, actionCodeSetting)
          .then(() => {
            setInfoMsg("A verification link has sent to your email");
            signOut(auth);
            //   if (user.emailVerified) {
            //     const saved_email = window.localStorage.getItem("email");
            //     router.push("/myHome");
            //   } else {
            //     signOut(auth);
            //   }
          })
          .catch((error) => {
            // if there is an error, delete the created user.
            if (user) {
              window.confirm(
                "woops, something goes wrong, please sign up again"
              );
              deleteUser(user).then(() => {});
            }
          });
        setLoading(false);
      })
      .catch((error) => {
        // if there is an error, delete the created user.
        console.log("run here");
        if (user) {
          window.confirm("woops, something goes wrong, please sign up again");
          deleteUser(user)
            .then(() => {})
            .catch((err) => {
              console.log(err.message);
            });
        }
        setError(error.message);
        setLoading(false);
      });
  };

  return (
    <div className={css.outMost}>
      <div className={css.inputBox}>
        <Stack>
          <h1>Sign Up</h1>
        </Stack>
        <form onSubmit={handleSignUp}>
          <Stack>
            <Stack className={css.inputItem}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                placeholder="Email"
              />
            </Stack>
            <Stack className={css.inputItem}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                placeholder="Password"
              />
            </Stack>
            {error && (
              <div>
                <div>Error:</div>
                {error.replace("Firebase:", "").replace("Error", "")}
              </div>
            )}
            {infoMsg !== "" && <div>{infoMsg}</div>}
            <Stack className={css.inputItem}>
              {loading ? (
                <LoadingButton loading variant="outlined">
                  <span>Sign up</span>
                </LoadingButton>
              ) : (
                <StartBtn type="submit" fullWidth variant="outlined">
                  Sign up
                </StartBtn>
              )}
            </Stack>
          </Stack>
        </form>
        <Stack>
          Already has an account? <Link href={"/login"}>Login</Link>
        </Stack>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </div>
  );
};

export default SignUpScreen;
