"use client"
import React, { Suspense, useContext, useState } from "react"
import { AuthContext, AuthProvider, useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"
import { auth } from "../firebase-config"
import { onAuthStateChanged } from "firebase/auth"
import EditTree from "../editTree/page"

const MainScreen = () => {
    console.log("reach")
    const router = useRouter();
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
      <Suspense fallback={<Loading />}>
        <div>

        {
          <>
              <div>
                <div>
                  { <div>Congratulations {user?.email}! You are logged in.</div> }
                </div>
                <EditTree/>
              </div>
              <div>
                <div>
                  <button onClick={handleSignOut}>Sign out</button>
                </div>
              </div>
          </>
        }
        </div>
      </Suspense>
    )
}

function Loading() {
  return(<h2>loading</h2>)
}

export default MainScreen;
