"use client"
import React, {useState } from "react";
// import { Redirect } from "react-router";
// import { AuthContext } from "../utils/Auth";
// import app, { auth } from "../firebase-config";
import Link from "next/link";
// import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "../context/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [error, setError] = useState("");

    // const {FirebaseEmailSignIn} = useAuth();

    const handleLogin = event => {
        setError(null);
        try {
            // ADD verification from database
            signInWithEmailAndPassword(auth, email, password).then(authUser=>{
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
        <div>
            <h1>Login screen</h1>
            <form onSubmit={handleLogin}>
                {error && <div>{error}</div>}
                <label>
                    Email
                    <input name="email" type="email" onChange={(event)=>{setEmail(event.target.value)}} placeholder="Email"/>
                </label>
                <label>
                    Password
                    <input name="password" type="password" onChange={(event)=>{setPassword(event.target.value)}} placeholder="Password"/>
                </label>
                <button type="submit">Login</button>
            </form>
            <div>
                No Account? <AuthProvider><Link href={"/signUp"}>Sign Up</Link></AuthProvider>
            </div>
        </div>
    );
};

export default LoginScreen;