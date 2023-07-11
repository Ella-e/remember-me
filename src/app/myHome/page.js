"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase-config";
import MyHeader from "./MyHeader";
import "./page.css";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import ULID from "../utils/ulid";
import { Backdrop, CircularProgress } from "@mui/material";

const MainScreen = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (auth.currentUser) {
      router.push("/myHome");
    } else {
      router.push("/login");
    }
  }, []);

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

  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <div className="layout">
        <MyHeader />
        <div className="center">
          <h1 className="mt-2">rememberMe</h1>
          <Link onClick={handleCreateProject} href="#">
            Start a new tree
          </Link>
          <Link href="/treeProjects">
            View my trees
          </Link>
        </div>
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
