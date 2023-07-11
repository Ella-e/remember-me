"use client";
import React, { useState, useEffect } from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import TreeContent from "./TreeContent";
import ViewTree from "./ViewTree";
import MyHeader from "../myHome/MyHeader";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";
import TreeEditor from "./TreeEditor";
import "./page.css";

const EditTree = () => {
  const { Header, Content, Sider } = Layout;
  const [pid, setPid] = useState("");

  const router = useRouter();
  // handle auth state change

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tab")) {
      setPid(searchParams.get("tab").slice(6, 32));
      setActiveTab(searchParams.get("tab").slice(0, 1));
    }
  }, []);

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

  const section = ["Edit Tree", "Edit Member", "View Tree"];
  const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
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
            <TreeEditor />
          ) : activeTab == "2" ? (
            <TreeContent />
          ) : (
            <ViewTree />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTree;

//TODO: check if uid included
