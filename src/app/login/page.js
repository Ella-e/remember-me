"use client";
import React, { Suspense, useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { Button, Stack, TextField } from "@mui/material";
import MainScreen from "../myHome/page";
import "./page.css";
import { LoadingButton } from "@mui/lab";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // const {FirebaseEmailSignIn} = useAuth();

  const handleLogin = (event) => {
    try {
      setLoading(true);
      // ADD verification from database
      signInWithEmailAndPassword(auth, email, password)
        .then((authUser) => {
          // return (<AuthContext.Provider value={{user, setUser}}>
          //     <MainScreen/>
          //     {router.push("/myHome")}
          // </AuthContext.Provider>)
          router.push("/myHome");
        })
        .catch((error) => {
          // console.log(error);
          // setError(error.message);
          handleError(error.message);
        });
    } catch (error) {
      // setError(error.message);
      handleError(error.message);
    }
    event.preventDefault();
  };

  const handleError = (msg) => {
    if (msg?.indexOf("wrong-password") != -1) {
      setError("wrong-password");
    } else if (msg?.indexOf("invalid-email") != -1) {
      setError("invalid-email");
    } else if (msg?.indexOf("too-many-request") != -1) {
      setError("too-many-request");
    } else {
      setError("other");
    }
    setLoading(false);
  };

  const resetError = () => {
    setError(null);
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
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                placeholder="Email"
              />
            </Stack>
            <Stack className="input-item">
              {error === "wrong-password" ? (
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
              {error === "too-many-request" ? (
                <div style={{ color: "red" }}>Too many request</div>
              ) : error === "other" ? (
                <div style={{ color: "red" }}>Some error happended</div>
              ) : (
                <div></div>
              )}
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
      </div>
    </div>
  );
};

export default LoginScreen;
