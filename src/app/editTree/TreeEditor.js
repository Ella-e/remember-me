"use client";
import { Popover } from "antd";
import React, { useState, useEffect } from "react";
import Toolbar from "./Toolbar";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";
import "./page.css";
import { auth, db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import {
  Alert,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import EditModal from "./rename";
import ShareModal from "../treeProjects/share";
import { onAuthStateChanged } from "firebase/auth";
import App from "./MermaidApp";

const TreeEditor = () => {
  const [editVisible, setEditVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [authWarning, setAuthWarning] = useState(false);
  const {
    setHasNode,
  } = treeStore;
  const [pid, setPid] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthWarning(false);
        setPid(searchParams.get("tab").slice(6, 32));
      } else {
        router.push("/login");
      }
    });

    return () => {
      localStorage.removeItem("memberList");
    };
  }, []);

  useEffect(() => {
    if (pid) {
      getTree();
      getProject();
    }
  }, [pid]);

  const getProject = async () => {
    if (pid) {
      const docRef = doc(db, "projects", pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProject(data);
      }
    }
  };

  const getTree = async () => {
    setLoading(true);
    if (pid) {
      const docRef = doc(db, "trees", pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDesc(data.desc);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (desc) setHasNode(true);
    else {
      setHasNode(false);
    }
  }, [desc]);

  return (
    <div>
      {authWarning && (
        <Alert
          className="mb-10"
          severity="warning"
          onClick={() => {
            setAuthWarning(false);
          }}
        >
          Please login to save data into database.
        </Alert>
      )}
      <div className="flex ">
        <div className="justify-center w-two-third" style={{ marginRight: "10px" }}>
          {project && (
            <div className="flex" style={{ justifyContent: "start" }}>
              <h1 style={{ cursor: "text", maxWidth: "80%" }}>
                {project.name}
              </h1>
              <Popover
                onOpenChange={(visible) => setEditVisible(visible)}
                open={editVisible}
                placement="bottomLeft"
                content={
                  <EditModal
                    project={project}
                    onClose={() => {
                      setEditVisible(false);
                      getProject();
                    }}
                  />
                }
                trigger="click"
              >
                <Link
                  className="edit"
                  href="#"
                  onClick={() => setEditVisible(true)}
                >
                  EDIT
                </Link>
              </Popover>
              <Popover
                onOpenChange={(visible) => setShareVisible(visible)}
                open={shareVisible}
                placement="bottomLeft"
                content={
                  <ShareModal
                    project={project}
                    onClose={() => {
                      setShareVisible(false);
                    }}
                  />
                }
                trigger="click"
              >
                <Link
                  className="edit"
                  href="#"
                  onClick={() => setShareVisible(true)}
                >
                  SHARE
                </Link>
              </Popover>
            </div>
          )}

          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          <App />
        </div>
        <div className=" bg-white mr-10">
          <Toolbar />
        </div>
      </div>
    </div>
  );
};

export default observer(TreeEditor);
