"use client";
import React from "react";
import { Dropdown, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { useRouter } from "next/navigation";
import "./page.css";

const MyHeader = () => {
  // check the current login state of the user
  const router = useRouter();

  const items = [
    {
      key: "0",
      label: "Profile",
    },
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            signOut(auth);
            router.push("/");
          }}
        >
          Sign Out
        </div>
      ),
    },
  ];

  return (
    <div className="header">
      <div className="toolBar">
        {auth.currentUser ? (
          <div className="flex">
            <div className="mr font-20">Welcome, {auth.currentUser?.email}</div>
            <Dropdown menu={{ items }}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <UserOutlined className="mr font-20" />
                </Space>
              </a>
            </Dropdown>
            <div
              className="mr font-20"
              onClick={() => {
                router.push("/myHome");
              }}
            >
              Home
            </div>
          </div>
        ) : (
          <div
            className="flex mr-40 font-20"
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHeader;

//TODO: sign out add loading