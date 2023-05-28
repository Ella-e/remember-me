"use client"
import React, {Suspense, useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"
import { AuthContext, AuthProvider } from "../context/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { TextField } from "@mui/material";
import MainScreen from "../myHome/page";

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
                setLoading(false);
                router.push("/myHome");
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
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                {error && <div>{error}</div>}
                <label>
                    <TextField label="Email" name="email" type="email" onChange={(event)=>{setEmail(event.target.value)}} placeholder="Email"/>
                </label>
                <label>
                    <TextField label="password" type="password" name="password" onChange={(event)=>{setPassword(event.target.value)}} placeholder="Password"/>
                </label>
                <button type="submit">Login</button>
            </form>
            <div>
                No Account? <AuthProvider><Link href={"/signUp"}>Sign Up</Link></AuthProvider>
            </div>
        </div>
        : <div>loading...</div>
    );
};

export default LoginScreen;