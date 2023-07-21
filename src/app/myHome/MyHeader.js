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
import { Backdrop, CircularProgress } from "@mui/material";
import Cookies from "js-cookie";

const MyHeader = () => {
  // check the current login state of the user
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const items = [
    {
      key: "0",
      label: (
        <div
          onClick={() => {
            router.push("/myHome");
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
            setLoading(true);
            signOut(auth);
            router.push("/");
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
      </div>
    </div>
  );
};

export default MyHeader;
