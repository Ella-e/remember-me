"use client"
import React from "react"
import app, { auth } from "../firebase-config"
import { signOut } from "firebase/auth"

export default function MainScreen() {
    function signOut() {
        signOut();
    }
    return (
        <>
          <h1>Home</h1>
          <button onClick={signOut}>Sign out</button>
        </>
    )
}