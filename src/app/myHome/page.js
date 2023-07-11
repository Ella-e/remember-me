"use client";
import React, { Suspense, useContext, useEffect, useState } from "react";
import { AuthContext, AuthProvider, useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import MyHeader from "./MyHeader";

const MainScreen = () => {
  const router = useRouter();
  useEffect(() => {
    if (auth.currentUser) {
      router.push("/myHome");
    } else {
      router.push("/login");
    }
  }, []);

  return (
    <div>
      <Suspense fallback={<Loading />} />

      <div>
        <MyHeader />
        <h1 className="mt-2">rememberMe</h1>
        <button onClick={() => router.push("/editTree")}>
          Start a new tree
        </button>
        <button onClick={() => router.push("/treeProjects")}>
          View my trees
        </button>
        {
          // <MyHome />
          // <>
          //   <div>
          //     <div>
          //       {<div>Congratulations {user?.email}! You are logged in.</div>}
          //     </div>
          //     <EditTree />
          //   </div>
          //   <div>
          //     <div>
          //       <button onClick={handleSignOut}>Sign out</button>
          //     </div>
          //   </div>
          // </>
        }
      </div>
    </div>
  );
};

function Loading() {
  return <h2>loading</h2>;
}

export default MainScreen;
