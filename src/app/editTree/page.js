import FamilyTree from "./tree";
import TreeEditor from "./createNode";
import React, { useState } from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu } from "antd";
import { useRouter } from "next/navigation";
import TreeContent from "./TreeContent";
import ViewTree from "./ViewTree";
import MyHeader from "./MyHeader";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";

// return (
//   <Layout className=" bg-white h-screen flex flex-1">
//     <div className="relative parent-full">
//       <div className="w-3/4 p-4 h-full">
//         {<FamilyTree />}
//       </div>
//       <div className="absolute t-0 r-0 w-1/4 p-4">
//         <TreeEditor />
//       </div>
//     </div>
//   </Layout>
// );

const EditTree = () => {
  const { Header, Content, Sider } = Layout;
  // const items1 = ['1', '2', '3'].map((key) => ({
  //   key,
  //   label: `nav ${key}`,
  // }));
  const router = useRouter();
  // handle auth state change

  const [activeTab, setActiveTab] = useState("1");
  const handleTabChange = (key) => {
    setActiveTab(key);
    router.replace(`/myHome?tab=${key}`);
  };

  // const items1 = [UserOutlined].map((icon, index) => ({
  //   key: index,
  //   icon: React.createElement(icon),
  //   label: "Profile",
  // }));
  const section = ["Create Tree", "Edit Tree", "View Tree"];
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
        // children: new Array(4).fill(null).map((_, j) => {
        //   const subKey = index * 4 + j + 1;
        //   return {
        //     key: subKey,
        //     label: `option${subKey}`,
        //   };
        // }),
      };
    }
  );
  return (
    <Layout className="parent-full">
      <Header className="header">
        <div className="logo" />
        <MyHeader />
        {/* <Menu
          style={{ float: "right" }}
          theme="dark"
          mode="horizontal"
          items={items1}
        /> */}
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={["sub1"]}
            defaultOpenKeys={["sub1"]}
            style={{
              height: "100%",
              borderRight: 0,
            }}
            items={items2}
          />
        </Sider>
        <Layout
          style={{
            padding: "0 24px 24px",
          }}
        >
          <Breadcrumb
            style={{
              margin: "16px 0",
            }}
          >
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              height: "100vh",
              overflow: "hidden",
            }}
          >
            {activeTab == "1" ? (
              <TreeEditor />
            ) : activeTab == "2" ? (
              <TreeContent />
            ) : (
              <ViewTree />
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default EditTree;
