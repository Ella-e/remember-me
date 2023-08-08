"use client";
import React, { useEffect, useState } from "react";
import { Dropdown, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase-config";
import { useRouter } from "next/navigation";
import css from "./page.module.css";
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import Cookies from "js-cookie";

const MyHeader = () => {
  // check the current login state of the user
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showSaveAlert, setShowAlert] = useState(false);

  const items = [
    {
      key: "0",
      label: (
        <div
          onClick={() => {
            if (localStorage.getItem("unsavedChanges")) {
              console.log("unsaved changes");
              setShowAlert(true);

            }
            else {
              router.push("/myHome");
              localStorage.removeItem("unsavedChanges");
            }
          }}
        >
          Home
        </div>
      ),
    },
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            if (localStorage.getItem("unsavedChanges")) {
              setShowAlert(true);
            }
            else {
              setLoading(true);
              signOut(auth);
              router.push("/");
              localStorage.removeItem("unsavedChanges");
            }
          }}
        >
          Sign Out
        </div>
      ),
    },
  ];

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });
  });

  return (
    <div className={css.header}>
      <div className={css.toolBar}>
        {user ? (
          <div className={css.flex}>
            <div className={css.name}>rememberMe</div>
            <div className={css.mr}>Welcome, {user?.email}</div>
            <Dropdown menu={{ items }}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <UserOutlined className={css.mr} />
                </Space>
              </a>
            </Dropdown>
            {/* <div
              className="mr font-20"
              onClick={() => {
                router.push("/myHome");
              }}
            >
              Home
            </div> */}
          </div>
        ) : (
          <div
            className={css.loginBtn}
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </div>
        )}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Dialog
          open={showSaveAlert}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Are you sure to leave without saving?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Your changes have not been saved. Do you want to leave without saving?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowAlert(false);
              }}
            >
              No
            </Button>
            <Button
              onClick={() => {
                setShowAlert(false);
                router.push("/myHome");
              }}
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default MyHeader;
