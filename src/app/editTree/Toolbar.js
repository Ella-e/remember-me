import { Select } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";
import "./page.css";
import { DataGrid } from "@mui/x-data-grid";
import { auth, db } from "../firebase-config";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  Backdrop,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { LightBlueBtn } from "../utils/customBtn";


const Toolbar = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const {
    unchoose,
    setUnchoose,
    hasNode,
    setHasNode,
    nodeInTree,
    selected,
    setSelected,
    setRelation,
    setGenerable,
    generable,
    refreshMemberList,
    setRefreshMemberList,
  } = treeStore;
  const searchParams = useSearchParams();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        getDbMemberList(user);
        setRelation("Partner");
        setSelected(false);
      }
    });
  }, []);

  useEffect(() => {
    if (refreshMemberList) {
      refresh();
      setRefreshMemberList(false);
    }
  }, [refreshMemberList]);

  const markLocalUseState = async (member, update) => {
    // check if this person's memberlist exist first
    const tempList = JSON.parse(localStorage.getItem("memberList"));
    if (tempList) {
      const index = tempList.findIndex((item) => item.id === member.id);
      if (index !== -1) {
        tempList[index].used = update.used;
        tempList[index].subgraphId = update.subgraphId;
        localStorage.setItem("memberList", JSON.stringify(tempList));
      }
    }
    refresh();
    // localStorage.setItem("refresh", JSON.stringify(new Date()));
  };

  const refresh = () => {
    const tempList = JSON.parse(localStorage.getItem("memberList"));
    setMemberList(tempList.filter((item) => !item.used));
  };

  const handleUnChoose = () => {
    const temp = JSON.parse(localStorage.getItem("selectedMember"));
    if (temp) {
      window.localStorage.removeItem("selectedMember");
      markLocalUseState(temp, { used: false, subgraphId: "" });
    }
    setSelectedMember(null);
    setGenerable(false);
  };

  useEffect(() => {
    if (unchoose) {
      handleUnChoose();
      setSelected(false);
      setUnchoose(null);
    }

  }, [unchoose])

  const handleChoose = () => {
    if (selectedMember) {
      window.localStorage.setItem(
        "selectedMember",
        JSON.stringify(selectedMember)
      );
      markLocalUseState(selectedMember, { used: true, subgraphId: "" });
      if (!hasNode) {
        setHasNode(true);
      }
      setGenerable(true);
      setSelectedMember(null);
    } else {
      alert("please choose a member from table on the right");
    }
  };

  const [memberList, setMemberList] = useState(new Array());
  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "firstName", headerName: "First name", width: 130 },
    { field: "lastName", headerName: "Last name", width: 130 },
  ];

  const handleSelectRelation = (value) => {
    setRelation(value);
  };
  const handleSelectMember = (event) => {
    setSelectedMember(event.row);
  };

  const getDbMemberList = async (myUser) => {
    setLoading(true);
    if (myUser) {
      const q = query(
        collection(db, "nodes"),
        where("pid", "==", searchParams.get("tab").slice(6, 32))
      );
      const querySnapshot = await getDocs(q);
      // const tempMemberList = [...memberList];
      let tempMemberList = new Array();
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const docData = doc.data();
        const tempMember = {
          id: docData.id,
          firstName: docData.firstName,
          lastName: docData.lastName,
          docId: doc.id,
          subgraphId: docData.subgraphId,
          used: docData.used,
        };
        tempMemberList.push(tempMember);
      });
      localStorage.setItem("memberList", JSON.stringify(tempMemberList));
      setMemberList(tempMemberList.filter((member) => !member.used));
    }
    setLoading(false);
  };

  return (
    <div>
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
      <div style={{ height: 300, maxWidth: "420px", display: "flex", flex: 1 }}>
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
      <LightBlueBtn className="mt-10 mr-10" style={{ marginRight: "10px", marginTop: "10px" }} variant="contained" onClick={handleChoose} disabled={!selectedMember || (hasNode && !nodeInTree)}>
        CHOOSE
      </LightBlueBtn>
      <LightBlueBtn className="mt-10" style={{ marginTop: "10px" }} variant="contained" onClick={handleUnChoose} disabled={!generable}>
        UNCHOOSE
      </LightBlueBtn>
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
