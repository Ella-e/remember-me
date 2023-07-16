"use client";
import React, { useEffect, useState } from "react";
import MyHeader from "../myHome/MyHeader";
import { auth, db } from "../firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Input } from "@mui/material";
import "./page.css";
import ULID from "../utils/ulid";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Popover, message } from "antd";
import ShareModal from "./share";

const TreeProjects = () => {
  const [loading, setLoading] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const [showAlert, setShowAlert] = useState(false);
  const [deleteMember, setDeleteMember] = useState(null);
  const [shareProject, setShareProject] = useState(null);
  const [shareVisible, setShareVisible] = useState(false);

  useEffect(() => {
    getProjects();
  }, []);

  const deleteProject = async (member) => {
    await deleteDoc(doc(db, "projects", member.id)).then(() => {
      getProjects();
      setDeleteMember(null);
    });
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
      setProjectList(tempList.reverse());
    }
    setLoading(false);
  };

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

  const DeleteAlert = () => {
    return (
      <Dialog
        open={deleteMember}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Are you sure to delete this project?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            After deletion of project all its tree graph and members will be
            deleted. Please be aware of the result of this attempt. Click agree
            to continue deleting the project.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteMember(null);
            }}
          >
            Disagree
          </Button>
          <Button onClick={() => deleteProject(deleteMember)} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleShare = (project) => {
    setShareProject(project);
    setShareVisible(true);
  }

  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <div>
        <MyHeader />
        <div className="padding">
          <div style={{ display: "flex" }}>
            <h1 style={{ marginRight: "33vw" }}>Tree Projects</h1>
          </div>
          <DeleteAlert />

          {projectList.length > 0 &&
            projectList.map((project) => {
              return (
                <div key={project.id}>
                  <h1>{project.name}</h1>


                  <Link className="ml"
                    href={`/editTree?tab=1?pid=${project.id}`}
                  >
                    EDIT
                  </Link>

                  <Popover onOpenChange={(visible) => setShareVisible(visible)} open={shareVisible && shareProject && shareProject.id === project.id}
                    placement="bottomLeft" content={<ShareModal project={shareProject} onClose={() => { setShareVisible(false); setShareProject(null); }} />} trigger="click">
                    <Link className="ml" href="#" onClick={() => handleShare(project)}>SHARE</Link>
                  </Popover>
                  <Link className="ml" onClick={() => setDeleteMember(project)} href="#">DELETE</Link>
                </div>
              );
            })}
          {projectList.length == 0 && (
            <Link onClick={handleCreateProject} href="#">Start creating your tree!</Link>
          )}
        </div>
      </div>

    </div >
  );
};

export default TreeProjects;

//TODO: add tree graph & disable editable?; if login reload page
