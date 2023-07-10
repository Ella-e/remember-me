"use client"
import React, { useState } from "react";
import { Dropdown, Menu, Space } from "antd";
import { UserOutlined, LaptopOutlined } from "@ant-design/icons";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { useRouter } from "next/navigation";
import { colors } from "@mui/material";
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
      key: '1',
      label: (
        <div
          onClick={() => {
            signOut(auth);
            router.push("/login");
          }}
        >
          Sign Out
        </div>
      ),
    }];

  return (
    <div className="header">
      <div className="toolBar">
        {auth.currentUser ? (
          <div className="flex">
            <div className='mr'>Welcome, {auth.currentUser?.email}</div>
            <Dropdown
              menu={{ items }}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <UserOutlined className='mr' />
                </Space>
              </a>
            </Dropdown>
            <div className='mr' onClick={() => {
              router.push("/myHome");
            }}>Home</div>
          </div>
        ) : (
          <div className="flex mr"
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </div>
        )
        }

      </div >
    </div >

  );
};

export default MyHeader;
