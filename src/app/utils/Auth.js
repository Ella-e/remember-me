"use client"
import { useEffect, useState } from "react"
// import app, { auth } from "../firebase-config"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

const formatAuthUser = (user) => ({
    uid: user.uid,
    email: user.email
})

export default function useFirebaseAuth() {
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const clear= () => {
        setAuthUser(null);
        setLoading(true);
    }

    const authStateChange = async (authState) => {
        if (!authState) {
            setAuthUser(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        var formattedAuthUser = formatAuthUser(authState);
        setAuthUser(formattedAuthUser);
        setLoading(false);
    };

    // tools for sign in/out/ create account
    const FirebaseEmailSignIn = (email, pwd) => {
        signInWithEmailAndPassword(auth, email, pwd);
    }

    const FirebaseEmailCreate = (email, pwd) => {
        createUserWithEmailAndPassword(auth, email, pwd);
    }

    const FirebaseSignout = () => {
        signOut().then(clear);
    }

    // listen for firebase state change
    useEffect(()=> {
        const unsubscribe = onAuthStateChanged(auth, authStateChange);
        return ()=>unsubscribe();
    }, []);

    return {
        authUser,
        loading,
        FirebaseEmailSignIn,
        FirebaseEmailCreate,
        FirebaseSignout
    }
}