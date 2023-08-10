"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase-config";
import MyHeader from "./MyHeader";
import css from "./page.module.css";
import { doc, setDoc } from "firebase/firestore";
import ULID from "../utils/ulid";
import { Backdrop, CircularProgress } from "@mui/material";
import TreeProjects from "../treeProjects/page";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const MainScreen = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  // const [token, setToken] = useState(null);
  // const [hashPwd, setHashPwd] = useState("");

  // useEffect(() => {
  //   setToken(JSON.parse(Cookies.get("token")));
  //   setHashPwd(Cookies.get("hashPwd"));
  // }, []);
  // if (!token) {
  //   return <LoginScreen />;
  // } else if (token && !auth.currentUser) {
  //   console.log(token.email);
  //   console.log(hashPwd);
  //   signInWithEmailAndPassword(auth, token.email, hashPwd).then((authUser) => {
  //     if (!auth.currentUser.emailVerified) {
  //       window.confirm("please click the link in your email to verify first");
  //       signOut(auth);
  //       router.push("/login");
  //     }
  //   });
  // }

  // useEffect(() => {
  //   if (auth.currentUser) {
  //     router.push("/myHome");
  //   } else {
  //     router.push("/login");
  //   }
  // }, []);

  const handleCreateProject = async () => {
    setLoading(true);
    let generator = ULID();
    let tempUid = generator();
    const newProject = {
      id: tempUid,
      name: "untitled",
      uids: [auth.currentUser.uid],
    };
    const docRef = doc(db, "projects", tempUid);
    setDoc(docRef, newProject).then(() => {
      router.push(`/editTree?tab=1?pid=${newProject.id}`);
    });
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  });

  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <MyHeader />
      <div className={css.layout}>
        <TreeProjects />
        {/* <div className="center"> */}
        {/* <h1 className="mt-2">rememberMe</h1> */}
        {/* <Link onClick={handleCreateProject} href="#">
            Start a new tree
          </Link>
          <Link href="/treeProjects">View my trees</Link> */}
        {/* </div> */}
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

export default MainScreen;
