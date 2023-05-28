"use client"
import { createContext, useState } from "react"
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { TextField } from "@mui/material";

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
                    <TextField label="Email" name="email" type="email" value={email} onChange={(event)=>{setEmail(event.target.value)}} placeholder="Email"/>
                </label>
                <label>
                    <TextField label="Password" name="password" type="password" value={password} onChange={(event)=>{setPassword(event.target.value)}} placeholder="Password"/>
                </label>
                <button type="submit">Sign up</button>
            </form>
        </div>
    );
};

export default SignUpScreen;

