"use client"
import React, {useCallback, useContext } from "react";
// import { Redirect } from "react-router";
import { AuthContext } from "../utils/Auth";
import app, { auth } from "../firebase-config";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = ({history}) => {
    const handleLogin = useCallback(
        async event => {
            event.preventDefault();
            const {email, password} = event.target.elements;
            try{
                await signInWithEmailAndPassword(auth, email.value, password.value);
                history.push("/home");
            } catch (error) {
                alert(error);
            }
        }, [history]
    );

    const currentUser = useContext(AuthContext);

    if (currentUser) {
        return <Link href='/home' />;
    }

    return (
        <div>
            <h1>Login screen</h1>
            <form onSubmit={handleLogin}>
                <label>
                    Email
                    <input name="email" type="email" placeholder="Email"/>
                </label>
                <label>
                    Password
                    <input name="password" type="password" placeholder="Password"/>
                </label>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginScreen;