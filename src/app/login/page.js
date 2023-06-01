"use client"
import React, {Suspense, useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"
import { AuthContext, AuthProvider } from "../context/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { Button, Stack, TextField } from "@mui/material";
import MainScreen from "../myHome/page";
import "./page.css"

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // const {FirebaseEmailSignIn} = useAuth();

    const handleLogin = event => {
        setError(null);
        try {
            setLoading(true);
            // ADD verification from database
            signInWithEmailAndPassword(auth, email, password).then(authUser=>{
                // return (<AuthContext.Provider value={{user, setUser}}>
                //     <MainScreen/>
                //     {router.push("/myHome")}
                // </AuthContext.Provider>)
                router.push("/myHome");
                setLoading(false);
            });
        } catch (error) {
            setError(error.message)
        }
        event.preventDefault();
    }

    // const handleLogin = useCallback(
    //     async event => {
    //         event.preventDefault();
    //         const {email, password} = event.target.elements;
    //         try{
    //             await signInWithEmailAndPassword(auth, email.value, password.value);
    //             history.push("/home");
    //         } catch (error) {
    //             alert(error);
    //         }
    //     }, [history]
    // );

    // const currentUser = useContext(AuthContext);

    // if (currentUser) {
    //     return <Link href='/home' />;
    // }

    return (
        !loading ?
        <div className="out-most">
            <div className="input-box">
                <Stack><h1 className="title">Login</h1></Stack>
                <form onSubmit={handleLogin}>
                    {/* {error && <div>{error}</div>} */}
                    <Stack>
                        <Stack className="input-item">
                            <TextField fullWidth label="Email" name="email" type="email" onChange={(event)=>{setEmail(event.target.value)}} placeholder="Email"/>
                        </Stack>
                        <Stack className="input-item">
                            <TextField fullWidth label="password" type="password" name="password" onChange={(event)=>{setPassword(event.target.value)}} placeholder="Password"/>
                        </Stack>
                        <Stack className="input-item">
                            <Button fullWidth variant="outlined" type="submit">Login</Button>
                        </Stack>
                    </Stack>
                </form>
                <Stack>
                    No Account? <AuthProvider><Link href={"/signUp"}>Sign Up</Link></AuthProvider>
                </Stack>
            </div>
        </div>
        : <div>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
            {error && <div>{error}</div>}
            <Stack className="input">
                <TextField disabled label="Email" name="email" onChange={(event)=>{setEmail(event.target.value)}} placeholder="Email"/>
            </Stack>
            <Stack className="input">
                <TextField disabled label="Password" name="password" onChange={(event)=>{setPassword(event.target.value)}} placeholder="Password"/>
            </Stack>
            <button type="submit">Login</button>
        </form>
        <div>
            No Account? <AuthProvider><Link href={"/signUp"}>Sign Up</Link></AuthProvider>
        </div>
    </div>
    );
};

export default LoginScreen;