import { Button, Select } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";
import "./page.css";
import { DataGrid } from "@mui/x-data-grid";
import { auth, db } from "../firebase-config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import {
  Backdrop,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";

const Toolbar = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const {
    hasNode,
    setHasNode,
    onRootNode,
    setOnRootNode,
    selected,
    setSelected,
    setRelation,
    setGenerable,
    generable,
    chooseAble,
    setChooseAble,
    refreshMemberList,
    setRefreshMemberList,
  } = treeStore;

  const markUseState = async (member, update) => {
    // check if this person's memberlist exist first
    const docRef = doc(db, "nodes", member.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // update the doc
      await updateDoc(docRef, {
        used: update.used,
        subgraphId: update.subgraphId,
      });
    }
    localStorage.setItem("refresh", JSON.stringify(new Date()));
  };

  const handleUnChoose = () => {
    const temp = JSON.parse(localStorage.getItem("selectedMember"));
    if (temp) {
      // document.getElementById("unchoose-button").disabled = true;
      // document.getElementById("choose-button").disabled = false;
      window.localStorage.removeItem("selectedMember");
      markUseState(temp, { used: false, subgraphId: "" }).then(() => {
        getMemberList();
      });
    }
    setSelectedMember(null);
    setGenerable(false);
  };

  const handleChoose = () => {
    if (selectedMember) {
      // document.getElementById("choose-button").disabled = true;
      // document.getElementById("unchoose-button").disabled = false;
      window.localStorage.setItem(
        "selectedMember",
        JSON.stringify(selectedMember)
      );
      markUseState(selectedMember, { used: true, subgraphId: "" }).then(() => {
        // set selectedMember to local storage
        getMemberList();
      });
      if (!hasNode) {
        setHasNode(true);
      }
      setChooseAble(false);
      setGenerable(true);
    } else {
      alert("please choose a member from table on the right");
    }
  };

  const [memberList, setMemberList] = useState(new Array());
  const columns = [
    // { field: "id", headerName: "id", width: 100, hide: true },
    { field: "firstName", headerName: "First name", width: 130 },
    { field: "lastName", headerName: "Last name", width: 130 },
  ];

  const handleSelectRelation = (value) => {
    setRelation(value);
  };
  const handleSelectMember = (event) => {
    setSelectedMember(event.row);
    setChooseAble(true);
  };

  const getMemberList = async () => {
    setLoading(true);
    if (auth.currentUser) {
      const q = query(
        collection(db, "nodes"),
        where("uid", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      // const tempMemberList = [...memberList];
      let tempMemberList = new Array();
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const docData = doc.data();
        if (!docData.used) {
          const tempMember = {
            id: docData.id,
            firstName: docData.firstName,
            lastName: docData.lastName,
            docId: doc.id,
            subgraphId: docData.subgraphId,
            used: docData.used,
          };
          tempMemberList.push(tempMember);
        }
      });
      setMemberList(tempMemberList);
      tempMemberList = new Array();
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const docData = doc.data();
        const tempMember = {
          id: docData.id,
          firstName: docData.firstName,
          lastName: docData.lastName,
          docId: doc.id,
          subgraphId: docData.subgraphId,
        };
        tempMemberList.push(tempMember);
      });
      localStorage.setItem("memberList", JSON.stringify(tempMemberList));
    }
    setLoading(false);
  };

  useEffect(() => {
    getMemberList();
    return () => {
      setRelation("Partner");
      setSelected(false);
    };
  }, []);

  useEffect(() => {
    if (refreshMemberList) {
      getMemberList();
      setRefreshMemberList(false);
    }
  }, [refreshMemberList]);

  return (
    // <div className="flex justify-between items-center">

    <div className="ml-one-tenth h-full mr-one-tenth">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {selected && (
        <div>
          <h1>Relationship</h1>
          <Select
            defaultValue="Partner"
            style={{
              width: 120,
            }}
            onChange={handleSelectRelation}
            options={[
              {
                value: "Partner",
                label: "Partner",
              },
              {
                value: "Parent",
                label: "Parent",
              },
              {
                value: "Children",
                label: "Children",
              },
            ]}
          />
        </div>
      )}
      <h1>Choose Member</h1>
      {/* <MemberList /> */}
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={memberList}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          rowSelection
          onCellClick={handleSelectMember}
        />
      </div>
      <Button
        id="choose-button"
        type="primary"
        onClick={handleChoose}
        disabled={!chooseAble}
        className="mt-10 mr-10"
      >
        CHOOSE
      </Button>
      <Button
        id="unchoose-button"
        type="primary"
        disabled={!generable}
        onClick={handleUnChoose}
        className="mt-10"
      >
        UNCHOOSE
      </Button>
      <h1>Chosen Member</h1>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            First Name:{" "}
            {JSON.parse(localStorage.getItem("selectedMember"))?.firstName}
          </Typography>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Last Name:{" "}
            {JSON.parse(localStorage.getItem("selectedMember"))?.lastName}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default observer(Toolbar);
