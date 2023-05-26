"use client"
import React from "react";
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// import LoginScreen from "./login/page";
// import SignUpScreen from "./signUp/page";
// import MainScreen from "./home/page";
import {AuthProvider} from "./utils/Auth";
// import PrivateRoute from "./utils/PrivateRoute";
import Link from "next/link";

export default function Home() {
    return (
        <AuthProvider>
            {/* <PrivateRoute exact path="/home" component={MainScreen}/> */}
            <Link href="/login">Login</Link>
            
            
            <Link href="/signUp">Sign up</Link>
        </AuthProvider>
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