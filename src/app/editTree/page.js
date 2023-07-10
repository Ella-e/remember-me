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
import NoSsr from "@/components/NoSsr";
import "./page.css";

const EditTree = () => {
  const { Header, Content, Sider } = Layout;

  const router = useRouter();
  // handle auth state change

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab"));
    }
  }, [searchParams.get("tab")]);

  const [activeTab, setActiveTab] = useState("1");
  useEffect(() => {
    router.replace(`/editTree?tab=${activeTab}`);
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