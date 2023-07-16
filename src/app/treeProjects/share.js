import { message } from "antd";
import { collection, doc, getDocs, query, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { Input } from "@mui/material";
import Link from "next/link";

const ShareModal = ({ project, onClose }) => {
  const [shareEmail, setShareEmail] = useState('');

  useEffect(() => {
    return () => {
      setShareEmail('');
    }
  }, [])

  const share = async () => {
    getUsers().then((users) => {
      let user = users.find((user) => user.email === shareEmail);
      if (user && project.uids.includes(user.uid)) {
        message.error("User already in the project!");
        onClose();
        setShareEmail('');
      }
      else if (user) {
        let tempProject = project;
        tempProject.uids.push(user.uid);
        const docRef = doc(db, "projects", tempProject.id);
        updateDoc(docRef, { uids: tempProject.uids }).then(() => {
          message.success("Share successfully!");
          onClose();
          setShareEmail('');
        });
      }
      else {
        message.error("User not found!");
      }
    })
  };

  const getUsers = async () => {
    const q = query(
      collection(db, "users"),
    );
    const querySnapshot = await getDocs(q);
    const tempList = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const docData = doc.data();
      const user = {
        uid: docData.uid,
        email: docData.email,
      };
      tempList.push(user);
    });
    console.log(tempList);
    return tempList;
  };

  return (
    <div style={{ display: 'flex' }}>
      <Input
        value={shareEmail}
        sx={{ width: '40vw' }}
        placeholder="Please enter the recipient's email"
        onChange={(e) => setShareEmail(e.target.value)}
      />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'end' }}>
        <div style={{ display: 'flex' }}>
          <Link
            href="#"
            style={{ marginLeft: '8px' }}
            onClick={() => {
              share();
            }}
          >
            SHARE
          </Link>
        </div>
      </div>
    </div >
  );
};

export default ShareModal;