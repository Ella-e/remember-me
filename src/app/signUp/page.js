"use client"
import { useCallback } from "react"
import app, { auth } from "../firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
// import { withRouter } from "react-router";

const SignUpScreen = ({history}) => {
    const handleSignUp = useCallback(async event=>{
        event.preventDefault();
        const {email, password} = event.target.elements;
        try {
            await createUserWithEmailAndPassword(auth, email.value, password.value);
            history.push("/");
        } catch (error) {
            alert(error);
        }
    }, [history])
    return (
        <div>
            <h1>SignUp screen</h1>
            <form onSubmit={handleSignUp}>
                <label>
                    Email
                    <input name="email" type="email" placeholder="Email"/>
                </label>
                <label>
                    Password
                    <input name="password" type="password" placeholder="Password"/>
                </label>
                <button type="submit">Sign up</button>
            </form>
        </div>
    );
};

export default SignUpScreen;

