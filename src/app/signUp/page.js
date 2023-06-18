"use client";
import React, { createContext, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  isSignInWithEmailLink,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase-config";
import { Button, Stack, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import Link from "next/link";
import "./page.css";

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
    // Add check of pwd
    // Put user into database
    // ADD email link verification
    window.localStorage.setItem("email", email);
    createUserWithEmailAndPassword(auth, email, password)
      .then((authUser) => {
        user = auth.currentUser;
        sendEmailVerification(user, actionCodeSetting).then(() => {
          setInfoMsg("A verification link has sent to your email");
          if (user.emailVerified) {
            const saved_email = window.localStorage.getItem("email");
            router.push("/myHome");
          } else {
            signOut(auth);
          }
        });
        setLoading(false);
        // router.push("/myHome");
        // signOut(auth);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });

    // createUserWithEmailAndPassword(auth, email, password)
    //   .then((authUser) => {
    //     router.push("/myHome");
    //   })
    //   .catch((error) => {
    //     setError(error.message);
    //   });
  };

  return (
    <div className="out-most">
      <div className="input-box">
        <Stack>
          <h1>Sign Up</h1>
        </Stack>
        <form onSubmit={handleSignUp}>
          <Stack>
            <Stack className="input-item">
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
            <Stack className="input-item">
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
            {error}
            {infoMsg !== "" && <div>{infoMsg}</div>}
            <Stack className="input-item">
              {loading ? (
                <LoadingButton loading variant="outlined">
                  <span>Sign up</span>
                </LoadingButton>
              ) : (
                <Button fullWidth variant="outlined" type="submit">
                  Sign up
                </Button>
              )}
            </Stack>
          </Stack>
        </form>
        <Stack>
          Already has an account?{" "}
          <AuthProvider>
            <Link href={"/login"}>Login</Link>
          </AuthProvider>
        </Stack>
      </div>
    </div>
  );
};

export default SignUpScreen;
