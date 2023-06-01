"use client"
import React, { useState } from "react";
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// import LoginScreen from "./login/page";
// import SignUpScreen from "./signUp/page";
// import MainScreen from "./home/page";

// import PrivateRoute from "./utils/PrivateRoute";
import Link from "next/link";
import { useAuth, AuthProvider, AuthContext } from "./context/AuthContext";
import LoginScreen from "./login/page";
import EditTree from "./editTree/page";
// import { auth } from "./firebase-config";


export default function Home() {
    // const {authUser, loading} = useAuth();
    const [user, setUser] = useState(null);
    return (
        // <AuthContext.Provider value={{
        //   user,
        //   setUser
        // }}>
            // <LoginScreen/>
            <EditTree />
        // </AuthContext.Provider>
        // <AuthProvider>
        //     <Router>
        //         <div>
        //             <PrivateRoute exact path="/home" component={MainScreen}/>
        //             <Route exact path="/login" component={LoginScreen}/>
        //             <Route exact path="/signup" component={SignUpScreen}/>
        //         </div>
        //     </Router>
        // </AuthProvider>
    )
}