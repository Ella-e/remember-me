import { Input } from "antd";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TableCell,
  TableHead,
  TableRow,
  TextField,
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
// import RichText from "./RichText";
import ReactQuill from "react-quill";
import "../../../node_modules/react-quill/dist/quill.snow.css";
import { FORMATS, MODULES } from "./RichText";
import { Scrollbars } from "react-custom-scrollbars";
import "./page.css";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [richTextValue, setRichTextValue] = useState("");
  const [status, setStatus] = useState("alive");
  const [nickName, setNickName] = useState("");
  const [gender, setGender] = useState("male");
  const [otherGender, setOtherGender] = useState("");

  // Initialize memerbList
  const [memberList, setMemberList] = useState(new Array());

  const [pid, setPid] = useState("");
  const router = useRouter();

  const searchParams = useSearchParams();

  const getMemberList = async () => {
    setLoading(true);
    if (auth.currentUser) {
      const q = query(collection(db, "nodes"), where("pid", "==", pid));
      const querySnapshot = await getDocs(q);
      const tempMemberList = [...memberList];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const docData = doc.data();
        const tempMember = {
          id: docData.id,
          firstName: docData.firstName,
          lastName: docData.lastName,
          nickName: docData.nickName,
          gender: docData.gender,
          otherGender: docData.otherGender,
          status: docData.status,
          story: docData.story,
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
      setPid(searchParams.get("tab").slice(6, 32));
    } else {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (pid) {
      getMemberList();
    }
  }, [pid]);

  useEffect(() => {
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
    console.log(member);
    if (docSnap.exists()) {
      // update the doc
      await updateDoc(docRef, {
        firstName: member.firstName,
        lastName: member.lastName,
        nickName: member.nickName,
        gender: member.gender,
        otherGender: member.otherGender,
        status: member.status,
        story: member.story,
      });
    } else {
      await setDoc(docRef, {
        id: member.id,
        pid: pid,
        firstName: member.firstName,
        lastName: member.lastName,
        nickName: member.nickName,
        gender: member.gender,
        otherGender: member.otherGender,
        status: member.status,
        used: false,
        subgraphId: "",
        story: member.story,
      });
    }
  };

  /**
   * delete a member from database
   */
  const deleteMemberFromDb = async (member) => {
    await deleteDoc(doc(db, "nodes", member.id)).then(() => {
      clearVar();
    });
  };

  const clearVar = () => {
    setFirstName("");
    setLastName("");
    setRichTextValue("");
    setNickName("");
    setGender("");
    setOtherGender("");
    setStatus("");
    setSelectedMember(null);
  };

  /**
   * handle add member action.
   */
  const handleAddMember = (event) => {
    let newMember = {};
    if (firstName === "" || lastName === "") {
      alert("Please enter a first name and a last last name");
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
          nickName: nickName,
          gender: gender,
          otherGender: otherGender,
          status: status,
          story: richTextValue,
        };
        if (memberList) {
          setMemberList((current) => [...current, newMember]);
        } else {
          setMemberList([newMember]);
        }
        // save memberlist to the databse
        if (pid) {
          saveMemberToDb(newMember);
        }
      } catch (err) {
        console.log(err.message);
      }
      clearVar();
      setEditNode(false);
    }
  };

  const handleCancel = (str) => {
    clearVar();
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
      setNickName(selectedMember.nickName);
      setGender(selectedMember.gender);
      setOtherGender(selectedMember.otherGender);
      setStatus(selectedMember.status);
      setSelectedId(selectedMember.id);
      setRichTextValue(selectedMember.story);
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
              nickName: nickName,
              gender: gender,
              otherGender: otherGender,
              status: status,
              story: richTextValue,
            };
            tempList.splice(i, 1, newMember);
            setMemberList(tempList);
          }
        }
        // save memberlist to the databse
        if (pid) {
          saveMemberToDb(newMember);
        }

        setSelectedId(null);
      } catch (err) {
        console.log(err.message);
      }
    }
    setIsEdit(false);
    setEditNode(false);
    clearVar();
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
        clearVar();
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
          <Scrollbars style={{ width: 1000, height: 650 }}>
            <Container maxWidth="sm">
              <h1>
                First Name<i style={{ color: "red" }}>*</i>
              </h1>
              <Input.TextArea
                value={firstName}
                className="px-4 py-2 outline-none resize-none !h-full !border-none flex"
                onChange={(e) => setFirstName(e.target.value)}
              // placeholder=""
              ></Input.TextArea>
              <h1>
                Last Name<i style={{ color: "red" }}>*</i>
              </h1>
              <Input.TextArea
                value={lastName}
                className="px-4 py-2 outline-none resize-none !h-full !border-none flex"
                onChange={(e) => setLastName(e.target.value)}
              // placeholder=""
              ></Input.TextArea>
              <h1>Nick Name</h1>
              <Input.TextArea
                value={nickName}
                className="px-4 py-2 outline-none resize-none !h-full !border-none flex"
                onChange={(e) => setNickName(e.target.value)}
              // placeholder=""
              ></Input.TextArea>
              <h1>Gender</h1>
              <Select
                className="px-4 py-2 outline-none resize-none !h-full !border-none flex"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setOtherGender("");
                }}
              >
                <MenuItem value={"male"}>male</MenuItem>
                <MenuItem value={"female"}>female</MenuItem>
                <MenuItem value={"other"}>other</MenuItem>
              </Select>
              {gender === "other" && (
                <TextField
                  placeholder="please specify"
                  value={otherGender}
                  onChange={(e) => {
                    setOtherGender(e.target.value);
                  }}
                ></TextField>
              )}
              <h1>Status</h1>
              <Select
                className="px-4 py-2 outline-none resize-none !h-full !border-none flex"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value={"alive"}>alive</MenuItem>
                <MenuItem value={"desceased"}>deceased</MenuItem>
              </Select>
              <div className="">
                <h1>Life Story</h1>
                <ReactQuill
                  modules={MODULES}
                  formats={FORMATS}
                  value={richTextValue}
                  onChange={setRichTextValue}
                  theme="snow"
                />
              </div>
              <Button
                type="submit"
                onClick={isEdit ? handleSaveEditMember : handleAddMember}
              >
                Save Member
              </Button>
              <Button onClick={() => handleCancel("add")}>Cancel</Button>
            </Container>
          </Scrollbars>
        </div>
      )}
    </div>
  );
};

export default TreeContent;
