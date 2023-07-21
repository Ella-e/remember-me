import { message } from "antd";
import { collection, doc, getDocs, query, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase-config";
import { Input } from "@mui/material";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";

const EditModal = ({ project, onClose }) => {
  const [name, setName] = useState(project.name);
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  // useEffect(() => {
  //   return () => {
  //     setName('');
  //   }
  // }, [])

  const save = async () => {
    const docRef = doc(db, "projects", project.id);
    updateDoc(docRef, { name: name }).then(() => {
      onClose();
    });
  };

  return (
    <div style={{ display: "flex" }}>
      <Input
        value={name}
        sx={{ width: "20vw" }}
        placeholder="Please enter the name"
        onChange={(e) => setName(e.target.value)}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "end",
        }}
      >
        <div style={{ display: "flex" }}>
          <Link
            href="#"
            style={{ marginLeft: "8px" }}
            onClick={() => {
              save();
            }}
          >
            SAVE
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
