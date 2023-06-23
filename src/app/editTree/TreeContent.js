import { Input } from "antd";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Pagination,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState, useEffect } from "react";
import ULID from "../utils/ulid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
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
import { auth, db } from "../firebase-config";

const TreeContent = () => {
  const [editNode, setEditNode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUid = auth?.currentUser?.uid;
  const [authWarning, setAuthWarning] = useState(false);
  const [imgState, setImgState] = useState(true);
  const [imgData, setImgData] = useState(null);

  // Initialize memerbList
  const [memberList, setMemberList] = useState(new Array());

  const getMemberList = async () => {
    setLoading(true);
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
          uid: docData.uid,
          id: docData.id,
          firstName: docData.firstName,
          lastName: docData.lastName,
        };
        tempMemberList.push(tempMember);
        console.log(doc.id, " => ", doc.data());
      });
      setMemberList(tempMemberList);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (auth.currentUser) {
      setAuthWarning(false);
      getMemberList();
    } else {
      setAuthWarning(true);
    }
  }, []);

  useEffect(() => {
    //TODO: get member list
    setMemberList(memberList);
  }, [memberList]);

  const MemberList = () => {
    const columns = [
      { field: "id", headerName: "id", width: 100 },
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

  /**
   * save a member into the database
   */
  const saveMemberToDb = async (member) => {
    // check if this person's memberlist exist first
    const docRef = doc(db, "nodes", member.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // update the doc
      await updateDoc(docRef, {
        firstName: member.firstName,
        lastName: member.lastName,
      });
    } else {
      await setDoc(docRef, {
        id: member.id,
        uid: currentUid,
        firstName: member.firstName,
        lastName: member.lastName,
        used: false,
        subgraphId: "",
      });
    }
  };

  /**
   * delete a member from database
   */
  const deleteMemberFromDb = async (member) => {
    console.log("run");
    await deleteDoc(doc(db, "nodes", member.id)).then(() => {
      console.log("success");
    });
  };

  /**
   * handle add member action.
   */
  const handleAddMember = (event) => {
    console.log("run save add");
    let newMember = {};
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
      // save memberlist to the databse
      if (currentUid) {
        saveMemberToDb(newMember);
      }
    } catch (err) {
      console.log(err.message);
    }
    setFirstName("");
    setLastName("");
    setEditNode(false);
  };

  const handleCancel = (str) => {
    setFirstName("");
    setLastName("");
    setIsEdit(false);
    setEditNode(false);
    // if (str === "edit") {
    //   setIsEdit(false);
    // } else {
    //   setEditNode(false);
    // }
  };
  const handleSelectMember = (event) => {
    console.log(event);
    setSelectedMember(event.row);
  };

  /**
   * called when user click the edit button in the home page
   */
  const handleEditMember = () => {
    if (selectedMember) {
      setFirstName(selectedMember.firstName);
      setLastName(selectedMember.lastName);
      setSelectedId(selectedMember.id);
      setEditNode(true); // open the page
      setIsEdit(true); // call right submit function
    }
  };

  /**
   * handle save editted member information action.
   */
  const handleSaveEditMember = () => {
    console.log("run save edit");
    let newMember = {};
    if (selectedId) {
      try {
        for (var i = 0; i < memberList.length; i++) {
          if (memberList[i].id === selectedId) {
            let tempList = [...memberList];
            newMember = {
              id: selectedId,
              firstName: firstName,
              lastName: lastName,
            };
            tempList.splice(i, 1, newMember);
            setMemberList(tempList);
          }
        }
        // save memberlist to the databse
        if (currentUid) {
          saveMemberToDb(newMember);
        }

        setSelectedId(null);
      } catch (err) {
        console.log(err.message);
      }
    }
    setIsEdit(false);
    setEditNode(false);
    setFirstName("");
    setLastName("");
    setSelectedMember(null);
  };

  const preDeleteAlert = (event) => {
    setShowAlert(true);
  };

  /**
   * handle deleteMember action
   */
  const deleteMember = (event) => {
    setShowAlert(false);
    // display a popup telling user this is an action in the danger zone
    if (selectedMember) {
      console.log(selectedMember.id);
      try {
        for (var i = 0; i < memberList.length; i++) {
          if (memberList[i].id === selectedMember.id) {
            let tempList = [...memberList];
            tempList.splice(i, 1);
            // delete member in the database
            if (currentUid) {
              deleteMemberFromDb(memberList[i]);
            }
            // update memberList
            setMemberList(tempList);
          }
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  const DeleteAlert = () => {
    return (
      <Dialog
        open={showAlert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure to delete the member?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            After deletion of member all its sub-relation in the tree will be
            deleted. Please be aware of the result of this attempt. Click agree
            to continue deleting the member.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAlert(false);
            }}
          >
            Disagree
          </Button>
          <Button onClick={deleteMember} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleSelectImage = (event) => {
    // console.log(event);
    let imgFile = event.target.files[0];
    if (imgFile.size > 1024000) {
      alert("image size can't exeed 1M");
    } else {
      let reader = new FileReader();
      reader.readAsDataURL(imgFile);
      reader.onload = function (subEvent) {
        let img = this.result;
        console.log(img);
        setImgState(false);
        setImgData(img);
      };
    }
  };

  return (
    <div>
      {authWarning && (
        <Alert
          severity="warning"
          onClick={() => {
            setAuthWarning(false);
          }}
        >
          Please login to save data into database.
        </Alert>
      )}
      {!editNode && !isEdit && (
        <div>
          <h1>Add New Member</h1>
          <Button onClick={() => setEditNode(true)}>Add Member</Button>
          {loading ? (
            <Backdrop
              sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          ) : (
            <div>
              <MemberList />
            </div>
          )}
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
            <Button variant="contained" onClick={preDeleteAlert}>
              delete
            </Button>
            <DeleteAlert />
          </Box>
        </div>
      )}
      {editNode && (
        <div className="border-line-[#E4E6F0] rounded-2xl leading-5 overflow-auto h-[189px] mb-[26px]">
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
          <img src={imgData} style={{ width: "200px", height: "200px" }} />
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleSelectImage}
          />
          <Button
            type="submit"
            onClick={isEdit ? handleSaveEditMember : handleAddMember}
          >
            Save Member
          </Button>
          <Button onClick={() => handleCancel("add")}>Cancel</Button>
        </div>
      )}
    </div>
  );
};

export default TreeContent;
