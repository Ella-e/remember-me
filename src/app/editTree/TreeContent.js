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

// sun editor
import "suneditor/dist/css/suneditor.min.css";
// import suneditor from "suneditor";
import SunEditor from "suneditor-react";

import "./page.css";
import { useRouter, useSearchParams } from "next/navigation";
import { LightBlueBtn, ThemeBtn } from "../utils/customBtn";
import { onAuthStateChanged } from "firebase/auth";
import { getBytes, ref, uploadBytes } from "firebase/storage";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";

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
  const [storyPath, setStoryPath] = useState("");
  const [imgPath, setImgPath] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const { setHasNode } = treeStore;

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
      getDbMemberList();
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
          docId: doc.id,
          id: docData.id,
          firstName: docData.firstName,
          lastName: docData.lastName,
          nickName: docData.nickName,
          gender: docData.gender,
          otherGender: docData.otherGender,
          status: docData.status,
          story: docData.story,
          profileImage: docData.profileImage,
          used: docData.used,
          subgraphId: docData.subgraphId,
        };
        tempMemberList.push(tempMember);
        console.log(doc.id, " => ", doc.data());
      });
      setMemberList(tempMemberList);
    }
    setLoading(false);
  };

  const getDbMemberList = async () => {
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
        nickName: docData.nickName,
      };
      tempMemberList.push(tempMember);
    });
    localStorage.setItem("memberList", JSON.stringify(tempMemberList));
  };

  const updateDeletedMember = async (member) => {
    if (!member.used) {
      return;
    }
    const treeRef = doc(db, "trees", pid);
    const tree = await getDoc(treeRef);
    const treeData = tree.data();
    let desc = treeData.desc;
    let subgraphs = treeData.subgraphs;
    let deletedList = [member];
    const { description, tempSubgraphs, deletedMembers } = handleDelete(desc, member, subgraphs, deletedList);
    updateDoc(treeRef, {
      desc: description,
      subgraphs: tempSubgraphs,
    });
    return deletedMembers;
  };

  const handleDeleteAction = (subgraphId, description, tempSubgraphs, deletedList) => {
    const memberList = JSON.parse(localStorage.getItem("memberList"));
    const index = tempSubgraphs.findIndex(
      (subgraph) => subgraph.id === subgraphId
    );
    const members = [];
    const subgraphMembers = tempSubgraphs[index].members;
    for (let i = 0; i < subgraphMembers.length; i++) {
      const id = subgraphMembers[i];
      description = description.replace(`click ${id} callback`, "");
      const memberIndex = memberList.findIndex((member) => member.id === id);
      memberList[memberIndex].subgraphId = "";
      memberList[memberIndex].used = false;
      members.push({
        id: id,
        firstName: memberList[memberIndex].firstName,
        lastName: memberList[memberIndex].lastName,
      });
    }
    tempSubgraphs.splice(index, 1);
    const parentIdList = [];

    let parentIndex = description.indexOf(` --- ${subgraphId}\n`);
    while (parentIndex !== -1) {
      parentIdList.push(parentIndex);
      parentIndex = description.indexOf(` --- ${subgraphId}\n`, parentIndex + 1);
    }
    for (let i = parentIdList.length - 1; i >= 0; i--) {
      const parentId = description.slice(parentIdList[i] - 10, parentIdList[i]);
      description = description.replace(`${parentId} --- ${subgraphId}`, "");
    }
    if (members.length === 1) {
      const replace = `      subgraph ${subgraphId}[ ]\n      direction LR\n      ${members[0].id}((${members[0].firstName} ${members[0].lastName}))\n      end`;
      description = description.replace(replace, "");
      deleteMemberFromDb(members[0]);
    } else {
      description = description.replace(
        `      subgraph ${subgraphId}[ ]\n      direction LR\n      ${members[0].id}((${members[0].firstName} ${members[0].lastName})) --- ${members[1].id}((${members[1].firstName} ${members[1].lastName}))\n      end`,
        ""
      );
      deleteMemberFromDb(members[0]);
      deleteMemberFromDb(members[1]);
    }
    localStorage.setItem("memberList", JSON.stringify(memberList));
    return { description, tempSubgraphs, deletedList };
  };

  const handleDelete = (desc, nodeInTree, subgraphs, deletedList) => {
    let description = desc.slice(
      0,
      desc.indexOf(`style ${nodeInTree.docId} color:#fff,stroke-dasharray: 5 5`)
    );
    const index = subgraphs.findIndex(
      (subgraph) => subgraph.id === nodeInTree.subgraphId
    );
    let tempSubgraphs = subgraphs;
    const memberList = JSON.parse(localStorage.getItem("memberList"));
    if (tempSubgraphs[index].members.length > 1) {
      description = description
        .replace(
          `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) --- `,
          ""
        )
        .replace(
          ` --- ${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))`,
          ""
        )
        .replace(`click ${nodeInTree.docId} callback`, "")
        .replace(
          "style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5",
          ""
        );
      tempSubgraphs[index].members.splice(
        tempSubgraphs[index].members.indexOf(nodeInTree.docId),
        1
      );
      const memberIndex = memberList.findIndex(
        (member) => member.id === nodeInTree.id
      );
      memberList[memberIndex].subgraphId = "";
      memberList[memberIndex].used = false;
      localStorage.setItem("memberList", JSON.stringify(memberList));
    } else {
      let subgraphId = nodeInTree.subgraphId;
      const result = handleDeleteAction(subgraphId, description, tempSubgraphs, deletedList);
      description = result.description;
      tempSubgraphs = result.tempSubgraphs;
      deletedList = result.deletedList;
      let indexes = [];
      let index = description.indexOf(`${subgraphId} ---`);
      while (index !== -1) {
        indexes.push(description.slice(index + 15, index + 25));
        index = description.indexOf(`${subgraphId} ---`, index + 1);
      }
      while (indexes.length > 0) {
        let sub = indexes[0];
        let index = description.indexOf(`${sub} ---`);
        while (index !== -1) {
          indexes.push(description.slice(index + 15, index + 25));
          index = description.indexOf(`${sub} ---`, index + 1);
        }
        const result = handleDeleteAction(sub, description, tempSubgraphs, deletedList);
        description = result.description;
        tempSubgraphs = result.tempSubgraphs;
        deletedList = result.deletedList;
        indexes.splice(0, 1);
      }
    }
    if (tempSubgraphs.length === 0) {
      description = "";
      setHasNode(false);
    }
    return { description, tempSubgraphs, deletedList };
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
        profileImage: member.profileImage,
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
        profileImage: member.profileImage,
      });
    }
  };

  /**
   * delete a member from database
   */
  const deleteMemberFromDb = async (member) => {
    console.log(member);
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
          story: "stories/" + pid + "_" + tempUid,
          profileImage: profileImage,
          status: status,
        };
        if (memberList) {
          setMemberList((current) => [...current, newMember]);
          saveStory(tempUid);
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
  };
  const handleSelectMember = (event) => {
    console.log("event row");
    console.log(event.row);
    setSelectedMember(event.row);
  };

  const getStory = (uid) => {
    getBytes(ref(storage, "stories/" + pid + "_" + uid))
      .then((bytes) => {
        var decoder = new TextDecoder("utf-8");
        const decoded_story = decoder.decode(bytes);
        setStory(decoded_story);
      })
      .catch((err) => {
        window.confirm(
          "Error occur due to updates, please ignore and solve the problem by resaving the member."
        );
      });
  };

  const getImage = (imgPath) => {
    getBytes(ref(storage, imgPath)).then((bytes) => {
      var decoder = new TextDecoder("utf-8");
      const decoded_img = decoder.decode(bytes);
      document.getElementById("upload").src = decoded_img;
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
      // setStory(selectedMember.story);
      getStory(selectedMember.id);
      setProfileImage(selectedMember.profileImage);
      setEditNode(true); // open the page
      setIsEdit(true); // call right submit function
    }
  };

  const saveStory = (uid) => {
    const story_path = "stories/" + pid + "_" + uid;
    setStoryPath("stories/" + pid + "_" + uid);
    const storageRef = ref(storage, story_path);
    const file = new File([story], story_path);
    uploadBytes(storageRef, file).then((snapshot) => { });
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
              story: "stories/" + pid + "_" + selectedId,
              profileImage: profileImage,
              used: memberList[i].used,
            };
            tempList.splice(i, 1, newMember);
            setMemberList(tempList);
          }
        }
        // save memberlist to the databse
        if (pid) {
          saveMemberToDb(newMember);
          saveStory(selectedId);
        }

        setSelectedId(null);
      } catch (err) {
        window.confirm("An error has occur, please contact the team");
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
  const deleteMember = async (event) => {
    setShowAlert(false);
    // display a popup telling user this is an action in the danger zone
    if (selectedMember) {
      try {
        for (var i = 0; i < memberList.length; i++) {
          if (memberList[i].id === selectedMember.id) {
            // tempList.splice(i, 1);
            // delete member in the database
            if (user) {
              updateDeletedMember(memberList[i]);
              deleteMemberFromDb(memberList[i]);
              // update memberList
              getMemberList(user);;
            }
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

  const showImg = (input) => {
    console.log(input);
    var img = input.target.files[0];
    // restrict image size
    var img_size = img.size / 1024;
    var max_size = 1024;
    console.log(img_size);
    if (img_size > max_size) {
      window.confirm("Image size exceeds 1M");
    } else {
      var reader = new FileReader();
      reader.onload = function (e) {
        // restrict image height and width
        let image = new Image();
        image.src = e.target.result;
        image.onload = function () {
          if (image.width <= 500 && image.width <= 500) {
            let profile_image = e.target.result;
            document.getElementById("upload").src = e.target.result;
            // save image path
            var image_path = "images/" + selectedId + "_" + img.name;
            setImgPath(image_path);
            setProfileImage(profile_image);
          } else {
            window.confirm("image width or height exceeds 500");
          }
        };
      };
      reader.readAsDataURL(img);
    }
  };

  const deleteImg = () => {
    document.getElementById("upload").src = "";
    setImgPath("");
    setProfileImage(null);
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
                      ["list"],
                    ],
                  }}
                />
                <h1>Profile Image</h1>
                <div>
                  <span>image size limit: 1M, 500*500</span>
                </div>
                <input
                  type="file"
                  onChange={showImg}
                  id="node_pic"
                  accept=".jpg, .jpeg, .png"
                />
                <button onClick={deleteImg}>delete image</button>

                <img id="upload" src={selectedMember?.profileImage} />
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

export default observer(TreeContent);
