"use client";
import React, { useEffect, useState } from "react";
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
import {
  Backdrop,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
} from "@mui/material";
import css from "./page.module.css";
import ULID from "../utils/ulid";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Popover, message } from "antd";
import ShareModal from "./share";
import { onAuthStateChanged } from "firebase/auth";

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // get projects
        getProjects(user);
      }
    });
  }, []);

  const deleteProject = async (member) => {
    const docRef = doc(db, "projects", member.id);
    if (member.uids.length > 1) {
      member.uids = member.uids.filter((uid) => uid !== user.uid);
      updateDoc(docRef, { uids: member.uids }).then(() => {
        getProjects(user);
        setDeleteMember(null);
      });
    } else {
      await deleteDoc(doc(db, "projects", member.id)).then(() => {
        getProjects(user);
        setDeleteMember(null);
      });
    }
  };

  const getProjects = async (myUser) => {
    setLoading(true);
    if (myUser) {
      const q = query(
        collection(db, "projects"),
        where("uids", "array-contains", myUser.uid)
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
      tempList.push();
      setProjectList(tempList.reverse());
    }
    setLoading(false);
  };

  const handleCreateProject = async () => {
    if (projectList.length >= 11) {
      window.confirm("Maximum project number reached");
    } else {
      setLoading(true);
      let generator = ULID();
      let tempUid = generator();
      const newProject = {
        id: tempUid,
        name: "untitled",
        uids: [user.uid],
        subgraphs: [],
      };
      const docRef = doc(db, "projects", tempUid);
      setDoc(docRef, newProject).then(() => {
        router.push(`/editTree?tab=1?pid=${newProject.id}`);
      });
    }
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
            After deletion of project all content will be deleted and you will
            not be able to access the project. Click agree to continue deleting
            the project.
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
  };

  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className={css.outMost}>
        <h1 className={css.title}>Tree Projects</h1>
        <DeleteAlert />
        <div className={css.projects}>
          <div className={css.project}>
            <Card>
              <CardContent className={css.cardBg}>
                Create new project
                <div className={css.addImg} onClick={handleCreateProject}></div>
              </CardContent>
            </Card>
          </div>
          {projectList.length > 0 &&
            projectList.map((project) => {
              return (
                <div className={css.project} key={project.id}>
                  <Card variant="outlined" sx={{ minWidth: 275 }}>
                    <CardContent className={css.cardBg}>
                      <h5 className={css.text}>
                        {project.name.length > 25
                          ? project.name.substring(0, 25) + "..."
                          : project.name}
                      </h5>
                    </CardContent>
                    <CardActions className={css.cardActionBg}>
                      <Link
                        className="ml"
                        href={`/editTree?tab=1?pid=${project.id}`}
                      >
                        EDIT
                      </Link>

                      <Popover
                        onOpenChange={(visible) => setShareVisible(visible)}
                        open={
                          shareVisible &&
                          shareProject &&
                          shareProject.id === project.id
                        }
                        placement="bottomLeft"
                        content={
                          <ShareModal
                            project={shareProject}
                            onClose={() => {
                              setShareVisible(false);
                              setShareProject(null);
                            }}
                          />
                        }
                        trigger="click"
                      >
                        <Link
                          className="ml"
                          href="#"
                          onClick={() => handleShare(project)}
                        >
                          SHARE
                        </Link>
                      </Popover>
                      <Link
                        className="ml"
                        onClick={() => setDeleteMember(project)}
                        href="#"
                      >
                        DELETE
                      </Link>
                    </CardActions>
                  </Card>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default TreeProjects;
