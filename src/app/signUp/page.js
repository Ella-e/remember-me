"use client"
import { useState } from "react"
// import app, { auth } from "../firebase-config";
// import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
// import { withRouter } from "react-router";

const SignUpScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [error, setError] = useState("");

    // const {FirebaseEmailCreate} = useAuth();

    // const handleSignUp = useCallback(async event=>{
    //     event.preventDefault();
    //     const {email, password} = event.target.elements;
    //     try {
    //         await createUserWithEmailAndPassword(auth, email.value, password.value);
    //         router.push('/home');
    //     } catch (error) {
    //         alert(error);
    //     }
    // }, [history])
    const handleSignUp = event => {
        event.preventDefault();
        setError(null);
        // Add check of pwd
        // Put user into database
        createUserWithEmailAndPassword(auth,email, password).then(authUser => {
            console.log("user created");
            console.log(email);
            console.log(password);
            router.push("/myHome");
        }).catch(error => {
            setError(error.message);
        })
    }

    return (
        <div>
            <h1>SignUp screen</h1>
            <form onSubmit={handleSignUp}>
                {error && <div>{error}</div>}
                <label>
                    Email
                    <input name="email" type="email" value={email} onChange={(event)=>{setEmail(event.target.value)}} placeholder="Email"/>
                </label>
                <label>
                    Password
                    <input name="password" type="password" value={password} onChange={(event)=>{setPassword(event.target.value)}} placeholder="Password"/>
                </label>
                <button type="submit">Sign up</button>
            </form>
        </div>
    );
};

export default SignUpScreen;

