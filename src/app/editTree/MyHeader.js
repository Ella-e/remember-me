import React, { useState } from "react";
import { Menu } from "antd";
import { UserOutlined, LaptopOutlined } from "@ant-design/icons";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { useRouter } from "next/navigation";
import { colors } from "@mui/material";

// const SignInButton = () => {
//   const router = useRouter();
//   return (
//     <button
//       onClick={() => {
//         router.push("/login");
//       }}
//     >
//       Sign In
//     </button>
//   );
// };

const MyHeader = () => {
  // check the current login state of the user
  const router = useRouter();
  const [user, setUser] = useState(null);
  const items1 = [
    {
      key: "0",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "1",
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
    },
  ];

  const [myComponent, setMyComponent] = useState(null);

  // no idea why this doesn't work???
  // onAuthStateChanged(auth, (authUser) => {
  //   if (authUser) {
  //     setMyComponent(
  //       <div>
  //         <Menu
  //           style={{ float: "right" }}
  //           theme="dark"
  //           mode="horizontal"
  //           items={items1}
  //         />
  //         <div style={{ float: "right", color: "white" }}>
  //           Welcome, {authUser?.email}
  //         </div>
  //       </div>
  //     );
  //   } else {
  //     setMyComponent(
  //       <button
  //         onClick={() => {
  //           router.push("/login");
  //         }}
  //       >
  //         Sign In
  //       </button>
  //     );
  //   }
  // });
  return auth.currentUser ? (
    <div>
      <Menu
        style={{ float: "right" }}
        theme="dark"
        mode="horizontal"
        items={items1}
      />
      <div style={{ float: "right", color: "white" }}>
        Welcome, {auth.currentUser?.email}
      </div>
    </div>
  ) : (
    <div
      style={{ float: "right", color: "white" }}
      onClick={() => {
        router.push("/login");
      }}
    >
      Sign In
    </div>
  );
};

export default MyHeader;
