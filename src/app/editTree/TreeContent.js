import { Input } from "antd";
import {
  Box,
  Button,
  Pagination,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState, useEffect } from "react";
import ULID from "../utils/ulid";

const TreeContent = () => {
  const [editNode, setEditNode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [memberList, setMemberList] = useState(new Array());
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    //TODO: get member list
    setMemberList(memberList);
  }, [memberList]);

  const handleAddOrEditMember = (event) => {
    // check if this member is already in the list.
    let newMember = {};
    console.log(selectedId);
    if (selectedId) {
      try {
        console.log("entered");
        for (var i = 0; i < memberList.length; i++) {
          if (memberList[i].id === selectedId) {
            let tempList = [...memberList];
            console.log(firstName);
            newMember = {
              id: selectedId,
              firstName: firstName,
              lastName: lastName,
            };
            tempList.splice(i, 1, newMember);
            setMemberList(tempList);
          }
        }
        setSelectedId(null);
      } catch (err) {
        console.log(err.message);
      }
    } else {
      try {
        // generate ulid for the member
        let generator = ULID();
        let tempUid = generator();
        console.log(tempUid);
        newMember = {
          id: tempUid,
          firstName: firstName,
          lastName: lastName,
        };
        if (memberList) {
          setMemberList((current) => [...current, newMember]);
        } else {
          setMemberList([newMember]);
        }
      } catch (err) {
        console.log(err.message);
      }
    }
    setFirstName("");
    setLastName("");
    setEditNode(false);
  };

  const handleSelectMember = (event) => {
    console.log(event);
    setSelectedMember(event.row);
  };

  const MemberList = () => {
    const columns = [
      { field: "id", headerName: "id", width: 100 },
      { field: "firstName", headerName: "First name", width: 130 },
      // { field: "lastName", headerName: "Last name", width: 130 },
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
        {/* {memberList?.map((item) => {
          return (
            <Box
              sx={{
                p: 2,
                bgcolor: "background.default",
                display: "grid",
                gridTemplateColumns: { md: "1fr 1fr" },
                gap: 2,
              }}
            >
              First Name: {item.firstName}
              Last Name: {item.lastName}
            </Box>
          );
        })} */}
      </div>
    );
  };

  const handleEditMember = () => {
    if (selectedMember) {
      setFirstName(selectedMember.firstName);
      setLastName(selectedMember.lastName);
      setSelectedId(selectedMember.id);
      setEditNode(true);
    }
  };

  const AddOrEditOneMember = () => {
    return (
      <div className="border-line-[#E4E6F0] rounded-2xl leading-5 overflow-auto h-[189px] mb-[26px]">
        <form onSubmit={handleAddOrEditMember}>
          <h1>First Name</h1>
          <Input.TextArea
            value={firstName}
            className="px-4 py-2 outline-none resize-none !h-full !border-none flex"
            onChange={(e) => setFirstName(e.target.value)}
            // placeholder=""
          ></Input.TextArea>
          <h1>Last Name</h1>
          <Input.TextArea
            value={lastName}
            className="px-4 py-2 outline-none resize-none !h-full !border-none flex"
            onChange={(e) => setLastName(e.target.value)}
            // placeholder=""
          ></Input.TextArea>
          <Button type="submit">Save Member</Button>
        </form>
      </div>
    );
  };

  return (
    <div>
      {!editNode && (
        <div>
          <h1>Add New Member</h1>
          <Button onClick={() => setEditNode(true)}>Add Member</Button>
          <div>
            <MemberList />
          </div>
          <h1>Edit Member</h1>
          <Box
            sx={{
              p: 2,
              bgcolor: "background.default",
              display: "grid",
              gridTemplateColumns: { md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <div>First Name: {selectedMember?.firstName}</div>
            <div>Last Name: {selectedMember?.lastName}</div>

            <Button variant="text" onClick={handleEditMember}>
              edit
            </Button>
            <Button variant="contained">delete</Button>
          </Box>
        </div>
      )}
      {editNode && <AddOrEditOneMember />}
    </div>
  );
};

export default TreeContent;
