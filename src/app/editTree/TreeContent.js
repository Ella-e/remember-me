import { Input } from "antd";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState, useEffect, useRef } from "react";
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
import { auth, db, storage } from "../firebase-config";
// import RichText from "./RichText";

// sun editor
import "suneditor/dist/css/suneditor.min.css";
// import suneditor from "suneditor";
import SunEditor from "suneditor-react";
import SunEditorCore from "suneditor/src/lib/core";

// import image from "suneditor/src/plugins/dialog/link";
// import list from "suneditor/src/plugins/submenu/list";
// import { font } from "suneditor/src/plugins";

// How to import language files (default: en)

// end

// import ReactQuill from "react-quill"; // !!!
// import Tiptap from "./TipTap";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// import "../../../node_modules/react-quill/dist/quill.snow.css";
// import { FORMATS, MODULES } from "./RichText";
// const ReactQuill = require("react-quill");
// const { Quill } = ReactQuill;

// import { Scrollbars } from "react-custom-scrollbars";
// import { Scrollbars } from "rc-scrollbars";
// import * as Scroll from "react-scroll";
// import { Element } from "react-scroll";

import "./page.css";
import { useRouter, useSearchParams } from "next/navigation";
import { LightBlueBtn, ThemeBtn } from "../utils/customBtn";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
// import Tiptap from "./TipTap";
// import Image from "@tiptap/extension-image";

const TreeContent = () => {
  const [editNode, setEditNode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authWarning, setAuthWarning] = useState(false);
  const [status, setStatus] = useState("alive");
  const [nickName, setNickName] = useState("");
  const [gender, setGender] = useState("male");
  const [otherGender, setOtherGender] = useState("");
  const [story, setStory] = useState("");

  // Initialize memerbList
  const [memberList, setMemberList] = useState(new Array());

  const [pid, setPid] = useState("");
  const router = useRouter();

  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setAuthWarning(false);
        setPid(searchParams.get("tab").slice(6, 32));
        // getMemberList(user);
      } else {
        router.push("/login");
      }
    });
  });

  useEffect(() => {
    if (pid) {
      getMemberList(user);
    }
  }, [pid]);

  useEffect(() => {
    setMemberList(memberList);
  }, [memberList]);

  const getMemberList = async (myUser) => {
    setLoading(true);
    if (myUser) {
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
          used: docData.used,
        };
        tempMemberList.push(tempMember);
        console.log(doc.id, " => ", doc.data());
      });
      setMemberList(tempMemberList);
    }
    setLoading(false);
  };

  const MemberList = () => {
    const columns = [
      { field: "firstName", headerName: "First Name", width: 130 },
      { field: "lastName", headerName: "Last Name", width: 130 },
      { field: "nickName", headerName: "Nick Name", width: 130 },
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
      if (member.used) {
        const treeRef = doc(db, "trees", pid);
        const tree = await getDoc(treeRef);
        const treeData = tree.data();
        let desc = treeData.desc;
        let index = desc.indexOf(`${member.id}((`);
        const indexes = [];
        while (index !== -1) {
          indexes.push(index);
          index = desc.indexOf(`${member.id}((`, index + 1);
        }
        for (let i = indexes.length - 1; i >= 0; i--) {
          const startIndex = indexes[i];
          const endIndex = desc.indexOf("))", startIndex + 1);
          desc =
            desc.slice(0, startIndex) +
            `${member.id}((${member.firstName} ${member.lastName}))` +
            desc.slice(endIndex + 2);
        }
        updateDoc(treeRef, {
          desc: desc,
        });
      }
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
    setNickName("");
    setGender("");
    setOtherGender("");
    setStatus("");
    setSelectedMember(null);
    setStory("");
  };

  /**
   * handle add member action.
   */
  const handleAddMember = (event) => {
    let newMember = {};
    // set rich text value
    // const story = editor.getHTML();
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
          story: story,
        };
        if (memberList) {
          setMemberList((current) => [...current, newMember]);
          // saveStory(tempUid);
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
      // reset editor value
      // editor.commands.setContent("");
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

  const getStory = (uid) => {
    getDownloadURL(ref(storage, pid + "/" + uid)).then((url) => {
      window.open(url);
      // const xhr = new XMLHttpRequest();
      // xhr.open("GET", url);
      // xhr.responseType = "blob";
      // xhr.onload = (event) => {
      //   window.confirm("aha");
      //   const blob = xhr.response;
      //   setStory(blob);
      //   console.log("event");
      //   console.log(event);
      //   console.log("blob");
      //   console.log(blob);
      // };
      // xhr.send();
      // console.log("xhr send");

      // fetch(url)
      //   .then((response) => response.blob())
      //   .then((blob) => {
      //     // create new file reader instance
      //     const reader = new FileReader();
      //     reader.addEventListener("load", () => {
      //       const text = reader.result;
      //       console.log(reader.result);
      //     });
      //     reader.readAsText(blob);
      //   });
    });
  };
  /**
   * called when user click the edit button in the home page
   */
  const handleEditMember = () => {
    if (selectedMember) {
      console.log("selected");
      console.log(selectedMember);
      setFirstName(selectedMember.firstName);
      setLastName(selectedMember.lastName);
      setNickName(selectedMember.nickName);
      setGender(selectedMember.gender);
      setOtherGender(selectedMember.otherGender);
      setStatus(selectedMember.status);
      setSelectedId(selectedMember.id);
      setStory(selectedMember.story);
      // getStory(selectedMember.id);
      // set editor's value
      // editor.commands.setContent(selectedMember.story);
      setEditNode(true); // open the page
      setIsEdit(true); // call right submit function
    }
  };

  const saveStory = (uid) => {
    const storageRef = ref(storage, pid + "/" + uid);
    uploadString(storageRef, story).then(() => {
      console.log("upload a raw string");
    });
  };

  /**
   * handle save editted member information action.
   */
  const handleSaveEditMember = () => {
    let newMember = {};
    // const story = editor.getHTML();
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
              story: story,
              used: memberList[i].used,
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
        // reset editor value
        // editor.commands.setContent("");
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
            if (user) {
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

  const editor = useRef();
  const getSunEditorInstance = (sunEditor) => {
    editor.current = sunEditor;
  };

  const handleStoryChange = (content) => {
    setStory(content);
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
          <LightBlueBtn variant="contained" onClick={() => setEditNode(true)}>
            Add Member
          </LightBlueBtn>
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
          <p>Please check your selected member here: </p>
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

            <ThemeBtn variant="outlined" onClick={handleEditMember}>
              edit
            </ThemeBtn>
            <Button
              style={{ color: "red" }}
              variant="text"
              onClick={preDeleteAlert}
            >
              delete
            </Button>
            <DeleteAlert />
          </Box>
        </div>
      )}
      {editNode && (
        <div className="treeContent-bg-outer">
          <div className="treeContent-bg-inner">
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
                {/* <button onClick={createStory}>Add Story</button> */}
                {/* <textarea id="rich_text">To be displayed</textarea> */}
                <SunEditor
                  name="story"
                  setContents={story}
                  getSunEditorInstance={getSunEditorInstance}
                  lang="en"
                  onChange={handleStoryChange}
                  setOptions={{
                    buttonList: [
                      ["undo", "redo"],
                      ["font", "fontSize"],
                      ["image", "list"],
                    ],
                  }}
                />
                {/* <input
                type="file"
                onChange={showImg}
                id="node_pic"
                accept=".jpg, .jpeg, .png"
              /> */}
                {/* <EditorContent editor={editor} /> */}
                {/* <Tiptap /> */}
              </div>
              <Button
                type="submit"
                onClick={isEdit ? handleSaveEditMember : handleAddMember}
              >
                Save Member
              </Button>
              <Button onClick={() => handleCancel("add")}>Cancel</Button>
            </Container>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeContent;
