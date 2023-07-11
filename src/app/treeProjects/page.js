"use client";
import React, { useEffect, useState } from "react";
import MyHeader from "../myHome/MyHeader";
import { auth, db } from "../firebase-config";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { Backdrop, CircularProgress } from "@mui/material";
import "./page.css";
import ULID from "../utils/ulid";
import { useRouter, useSearchParams } from "next/navigation";
import EditTree from "../editTree/page";

const TreeProjects = () => {
  const [loading, setLoading] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");

  useEffect(() => {
    getProjects();
  }, []);

  const handleDeleteProject = () => {
    //TODO:
  };

  const getProjects = async () => {
    setLoading(true);
    if (auth.currentUser) {
      const q = query(
        collection(db, "projects"),
        where("uids", "array-contains", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const tempList = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const docData = doc.data();
        const project = {
          uids: docData.uids,
          id: docData.id,
          name: docData.name,
          tree: docData.tree,
          members: docData.members,
        };
        tempList.push(project);
      });
      setProjectList(tempList);
    }
    setLoading(false);
  };

  const handleCreateProject = async () => {
    setLoading(true);
    let generator = ULID();
    let tempUid = generator();
    const newProject = {
      id: tempUid,
      uids: [auth.currentUser.uid],
      name: "untitled",
    };
    const docRef = doc(db, "projects", tempUid);
    setDoc(docRef, newProject).then(() => {
      router.replace(`/treeProjects?pid=${newProject.id}`);
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
      {!pid ? (
        <div>
          <MyHeader />
          <div className="padding">
            <h1>Tree Projects</h1>
            {projectList.length > 0 &&
              projectList.map((project) => {
                return (
                  <div>
                    <h1>{project.name}</h1>
                    <button
                      onClick={() =>
                        router.replace(`/editTree?tab=1?pid=${project.id}`)
                      }
                    >
                      edit
                    </button>
                    <button onClick={handleDeleteProject}>delete</button>
                  </div>
                );
              })}
            {projectList.length == 0 && (
              <h1 onClick={handleCreateProject}>Start creating your tree!</h1>
            )}
          </div>
        </div>
      ) : (
        <div>
          pid: {pid}
          <EditTree />
        </div>
      )}
    </div>
  );
};

export default TreeProjects;

//TODO: add tree graph & share??
