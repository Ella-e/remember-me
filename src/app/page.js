"use client"
import React from "react";
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// import LoginScreen from "./login/page";
// import SignUpScreen from "./signUp/page";
// import MainScreen from "./home/page";

// import PrivateRoute from "./utils/PrivateRoute";
import Link from "next/link";
import { useAuth, AuthProvider } from "./context/AuthContext";
import LoginScreen from "./login/page";
// import { auth } from "./firebase-config";


export default function Home() {
  // const {authUser, loading} = useAuth();
    return (
        <AuthProvider>
          {/* {authUser && loading ? 
          <>
            <h1>Hi {{currentUser}}</h1>
            <Link href={"/home"}></Link><br/>
          </>
          :
          <>
            <Link href="/login">Login</Link>
            <Link href="/signUp">Sign up</Link>
          </>  
        } */}
            {/* <PrivateRoute exact path="/home" component={MainScreen}/> */}
            <LoginScreen/>
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