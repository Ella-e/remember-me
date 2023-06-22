import { Button, Select } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";
import "./page.css";
import { DataGrid } from "@mui/x-data-grid";
import { auth, db } from "../firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';


const Toolbar = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const { hasNode, setHasNode, selected, setRelation } = treeStore
  const handleChoose = () => {
    treeStore.setAddNode(selectedMember);
    if (!hasNode) {
      setHasNode(true);
    }
    setSelectedMember(null);
  };
  const antIcon = (
    //FIXME: full space
    <LoadingOutlined
      style={{
        fontSize: 24,
      }}
      spin
    />
  );
  const [memberList, setMemberList] = useState(new Array());
  const MemberList = () => {
    const columns = [
      // { field: "id", headerName: "id", width: 100, hide: true },
      { field: "firstName", headerName: "First name", width: 130 },
      { field: "lastName", headerName: "Last name", width: 130 },
    ];
    return (
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
    );
  };
  const handleSelectRelation = (value) => {
    setRelation(value);
  }
  const handleSelectMember = (event) => {
    setSelectedMember(event.row);
  };

  const getMemberList = async () => {
    if (auth.currentUser) {
      const q = query(
        collection(db, "nodes"),
        where("uid", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const tempMemberList = [...memberList];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const docData = doc.data();
        const tempMember = {
          id: docData.id,
          firstName: docData.firstName,
          lastName: docData.lastName,
          docId: doc.id
        };
        tempMemberList.push(tempMember);
      });
      setMemberList(tempMemberList);
    }
    setLoading(false);
  };

  useEffect(() => {
    getMemberList();
  }, []);


  return (
    // <div className="flex justify-between items-center">

    <div className="ml-one-tenth h-full mr-one-tenth">
      <Spin indicator={antIcon} spinning={loading} />
      {selected && (<div>
        <h1>Relationship</h1>
        <Select
          defaultValue="Partner"
          style={{
            width: 120,
          }}
          onChange={handleSelectRelation}
          options={[
            {
              value: 'Partner',
              label: 'Partner',
            },
            {
              value: 'Parent',
              label: 'Parent',
            },
            {
              value: 'Children',
              label: 'Children',
            },
          ]}
        />

      </div>)}
      <h1>Choose Member</h1>
      <MemberList />
      <Button type="primary" onClick={handleChoose} disabled={!selectedMember} className="mt-10">
        CHOOSE
      </Button>
    </div>
  );
};

export default observer(Toolbar);
