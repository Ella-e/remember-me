"use client";
import React, { useState, useEffect } from "react";
import {
  EditOutlined,
  TeamOutlined,
  DownloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import TreeContent from "./TreeContent";
import ViewTree from "./ViewTree";
import MyHeader from "../myHome/MyHeader";
import { auth, db } from "../firebase-config";
import TreeEditor from "./TreeEditor";
import "./page.css";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const EditTree = () => {
  const { Sider } = Layout;
  const [pid, setPid] = useState("");

  const router = useRouter();
  // handle auth state change

  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setPid(searchParams.get("tab").slice(6, 32));
        setActiveTab(searchParams.get("tab").slice(0, 1));
      } else {
        router.push("/login");
      }
    });
  }, []);

  // useEffect(() => {
  //   if (pid) {
  //     getTree();
  //   }
  // }, [pid])

  // const getTree = async () => {
  //   const docRef = doc(db, "trees", pid);
  //   const docSnap = await getDoc(docRef);
  //   if (docSnap.exists()) {
  //     const data = docSnap.data();
  //     localStorage.setItem("desc", data.desc);
  //   }
  // }

  const [activeTab, setActiveTab] = useState("1");
  useEffect(() => {
    if (pid) {
      {
        router.replace(`/editTree?tab=${activeTab}?pid=${pid}`);
      }
    }
  }, [activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const section = ["Manage Member", "Manage Tree", "View & Download"];
  const items2 = [EditOutlined, TeamOutlined, DownloadOutlined].map(
    (icon, index) => {
      const key = `sub${index + 1}`;
      return {
        key: key,
        label: section[index],
        icon: React.createElement(icon),
        onClick: () => {
          handleTabChange(index + 1);
        },
      };
    }
  );
  return (
    <div className="layout">
      <MyHeader />
      {/* <div className="middleBlock" style={{ display: "flex", flex: 1 }}> */}
      <div style={{ display: "flex", flex: 1 }}>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={["sub1"]}
            defaultOpenKeys={["sub1"]}
            style={{
              borderRight: 0,
            }}
            items={items2}
            selectedKeys={["sub" + activeTab]}
          />
        </Sider>

        <div style={{ flex: 1, padding: "20px" }}>
          {activeTab == "1" ? (
            <TreeContent />

          ) : activeTab == "2" ? (
            <TreeEditor />
          ) : (
            <ViewTree />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTree;
