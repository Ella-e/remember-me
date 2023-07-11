"use client";
import React from "react";
import Link from "next/link";


export default function Home() {
  return (
    <div style={{ height: '100vh', width: "100%", padding: "0px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>rememberMe</h1>
      <Link href="/login">Login</Link>
      <Link href="/signUp" style={{ marginBottom: "33vh" }}>Sign Up</Link>
    </div>
    // <AuthContext.Provider value={{
    //   user,
    //   setUser
    // }}>
    // <EditTree />
    // <LoginScreen />
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
  );
}
