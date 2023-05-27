"use client"
import React, { useEffect, useState } from "react"
// import app, { auth } from "../firebase-config"
// import { signOut } from "firebase/auth"
import { AuthProvider, useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"
import { auth } from "../firebase-config"
import { onAuthStateChanged } from "firebase/auth"
// import { signOut } from "firebase/auth"

const MainScreen = () => {
    const {authUser, loading, FirebaseSignout} = useAuth();
    const router = useRouter();
    // console.log("authUser")
    // console.log(authUser);
    // console.log(loading);
    // useEffect(()=>{
    //     if (!loading&&!authUser) {
    //         router.push('/');
    //     }
    // }, [authUser, loading]);
    const [user, setUser] = useState(null);
    onAuthStateChanged(auth, authUser => {
        if (!authUser) {
            router.push('/');
        } else {
            setUser(authUser);
        }
    })
    // useEffect(()=>{
    //     console.log(auth);
    //     if (!auth.currentUser) {
    //         router.push('/');
    //     } else {
    //         setUser(auth.currentUser);
    //     }
    // }, [user]);

    function handleSignOut() {
        auth.signOut();
        setUser(null);
    }

    return (
        <div>

        {
          loading ?
            <div>
              <div>Loading....</div>
            </div> :
            <>
              <div>
                <div>
                  { <div>Congratulations {user?.email}! You are logged in.</div> }
                </div>
              </div>
              <div>
                <div>
                  <button onClick={handleSignOut}>Sign out</button>
                </div>
              </div>
            </>
        }
        </div>
    )
}

export default MainScreen;
