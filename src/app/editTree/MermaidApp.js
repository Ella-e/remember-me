"use client";
import { Button, message } from "antd";
import React, { useState, useEffect } from "react";
import { treeStore } from "./store";
import mermaid from "mermaid";
import "./page.css";
import MermaidChartComponent from "./Mermaid";
import { auth, db } from "../firebase-config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { LightBlueBtn } from "../utils/customBtn";
import { observer } from "mobx-react-lite";

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});

const App = () => {
  const [desc, setDesc] = useState("");
  const [originalDesc, setOriginalDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const {
    setUnchoose,
    nodeInTree,
    setNodeInTree,
    hasNode,
    setHasNode,
    setSelected,
    relation,
    setRelation,
    generable,
    setGenerable,
    selected,
    setRefreshMemberList,
  } = treeStore;
  const [pid, setPid] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subgraphs, setSubgraphs] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    if (unsavedChanges) {
      localStorage.setItem("unsavedChanges", "true");
    } else {
      localStorage.removeItem("unsavedChanges");
    }
    window.onbeforeunload = () => {
      if (unsavedChanges) {
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, [unsavedChanges]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPid(searchParams.get("tab").slice(6, 32));
      } else {
        router.push("/login");
      }
    });

    return () => {
      localStorage.removeItem("memberList");
      localStorage.removeItem("unsavedChanges");
    };
  }, []);

  useEffect(() => {
    console.log(desc);
  }, [desc]);

  useEffect(() => {
    if (pid) {
      getTree();
    }
  }, [pid]);

  const getTree = async () => {
    setLoading(true);
    if (pid) {
      const docRef = doc(db, "trees", pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDesc(data.desc);
        setOriginalDesc(data.desc);
        setSubgraphs(data.subgraphs);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (desc !== originalDesc) {
      setUnsavedChanges(true);
    } else {
      setUnsavedChanges(false);
    }
    if (desc) setHasNode(true);
    else {
      setHasNode(false);
    }
  }, [desc]);

  useEffect(() => {
    if (generable) {
      setLoading(true);
      refresh();
      setLoading(false);
    }
  }, [generable]);

  const saveTreeToDb = async (desc, subgraphs) => {
    setUnsavedChanges(false);
    setOriginalDesc(desc);
    setRelation("Partner");
    setSelected(false);
    if (nodeInTree) {
      desc = desc.replace(
        "style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5",
        ""
      );
      setDesc(desc);
      setNodeInTree(null);
    }
    if (pid) {
      const docRef = doc(db, "trees", pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // update the doc
        await updateDoc(docRef, {
          desc: desc,
          subgraphs: subgraphs,
        });
      } else {
        await setDoc(docRef, {
          id: pid,
          desc: desc,
          subgraphs: subgraphs,
        });
      }
    }
  };

  const updateMemberToDb = async () => {
    // check if this person's memberlist exist first
    const memberList = JSON.parse(localStorage.getItem("memberList"));
    if (memberList) {
      for (let i = 0; i < memberList.length; i++) {
        const docRef = doc(db, "nodes", memberList[i].id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // update the doc
          await updateDoc(docRef, {
            subgraphId: memberList[i].subgraphId,
            used: memberList[i].used,
          });
        }
      }
      setLoading(false);
      message.success("Save successfully!");
    }
  };

  const callBack = (e) => {
    const memberList = JSON.parse(localStorage.getItem("memberList"));
    if (nodeInTree && nodeInTree.docId === e) {
      setSelected(false);
      setDesc(
        desc.replace("style " + e + " color:#fff,stroke-dasharray: 5 5", "")
      );
      setNodeInTree(null);
    } else {
      if (!nodeInTree) {
        setDesc(desc + `\nstyle ${e} color:#fff,stroke-dasharray: 5 5`);
      } else {
        setDesc(
          desc.replace(
            "style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5",
            "style " + e + " color:#fff,stroke-dasharray: 5 5"
          )
        );
      }
      for (let i = 0; i < memberList.length; i++) {
        if (memberList[i].docId === e) {
          setNodeInTree(memberList[i]);
        }
      }
      setSelected(true);
    }
  };

  const refresh = () => {
    setGenerable(false);
    const tempNode = JSON.parse(localStorage.getItem("selectedMember"));
    setSelected(false);
    const memberList = JSON.parse(localStorage.getItem("memberList"));
    if (!desc) {
      let tempDesc = `graph TD
      subgraph ${tempNode.docId.slice(0, 10)}[ ]
      direction LR
      ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
      end
      classDef default fill:#bbf,stroke:#333,stroke-width:3px;
      click ${tempNode.docId} callback`;
      setDesc(tempDesc);
      setSubgraphs([
        { id: tempNode.docId.slice(0, 10), members: [tempNode.docId] },
      ]);
      const index = memberList.findIndex((member) => member.id === tempNode.id);
      memberList[index].subgraphId = tempNode.docId.slice(0, 10);
    } else if (relation == "Partner") {
      setDesc(
        desc
          .replace(
            `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))`,
            `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) --- ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))`
          )
          .replace(
            "style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5",
            ""
          ) + `        click ${tempNode.docId} callback`
      );
      let index = subgraphs.findIndex(
        (subgraph) => subgraph.id === nodeInTree.subgraphId
      );
      subgraphs[index].members.push(tempNode.docId);
      setSubgraphs(subgraphs);
      index = memberList.findIndex((member) => member.id === tempNode.id);
      index = memberList.findIndex((member) => member.id === tempNode.id);
      memberList[index].subgraphId = nodeInTree.subgraphId;
    } else if (relation == "Children") {
      setDesc(
        desc
          ?.replace(
            "style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5",
            ""
          )
          .replace(
            `graph TD`,
            `graph TD
      subgraph ${tempNode.docId.slice(0, 10)}[ ]
      direction LR
      ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
      end
      ${nodeInTree.subgraphId.slice(0, 10)} --- ${tempNode.docId.slice(0, 10)}`
          ) + `        click ${tempNode.docId} callback`
      );
      subgraphs.push({
        id: tempNode.docId.slice(0, 10),
        members: [tempNode.docId],
      });
      setSubgraphs(subgraphs);
      const index = memberList.findIndex((member) => member.id === tempNode.id);
      memberList[index].subgraphId = tempNode.docId.slice(0, 10);
    } else {
      let indexes = [];
      let index = desc.indexOf(`--- ${nodeInTree.subgraphId}`);
      while (index !== -1) {
        indexes.push(index);
        index = desc.indexOf(`--- ${nodeInTree.subgraphId}`, index + 1);
      }
      if (indexes.length > 1) {
        message.error("Two parents already!");
        setUnchoose(nodeInTree);
        setDesc(
          desc.replace(
            "style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5",
            ""
          )
        );
        setRelation("Partner");
        setNodeInTree(null);
        return;
      } else {
        setDesc(
          desc
            ?.replace(
              "style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5",
              ""
            )
            .replace(
              `graph TD`,
              `graph TD
      subgraph ${tempNode.docId.slice(0, 10)}[ ]
      direction LR
      ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
      end
      ${tempNode.docId.slice(0, 10)} --- ${nodeInTree.subgraphId.slice(0, 10)}`
            ) + `        click ${tempNode.docId} callback`
        );
        subgraphs.push({
          id: tempNode.docId.slice(0, 10),
          members: [tempNode.docId],
        });
        setSubgraphs(subgraphs);
        const index = memberList.findIndex(
          (member) => member.id === tempNode.id
        );
        memberList[index].subgraphId = tempNode.docId.slice(0, 10);
      }
    }
    localStorage.setItem("memberList", JSON.stringify(memberList));
    setRelation("Partner");
    // release localStorage
    localStorage.removeItem("selectedMember");
    setNodeInTree(null);
    setSelected(false);
  };

  const save = () => {
    setLoading(true);
    saveTreeToDb(desc, subgraphs);
    updateMemberToDb();
  };

  const handleDeleteAction = (subgraphId, description, tempSubgraphs) => {
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
    } else {
      description = description.replace(
        `      subgraph ${subgraphId}[ ]\n      direction LR\n      ${members[0].id}((${members[0].firstName} ${members[0].lastName})) --- ${members[1].id}((${members[1].firstName} ${members[1].lastName}))\n      end`,
        ""
      );
    }
    localStorage.setItem("memberList", JSON.stringify(memberList));
    setRefreshMemberList(true);
    return { description, tempSubgraphs };
  };

  const handleDelete = () => {
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
      const result = handleDeleteAction(subgraphId, description, tempSubgraphs);
      description = result.description;
      tempSubgraphs = result.tempSubgraphs;
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
        const result = handleDeleteAction(sub, description, tempSubgraphs);
        description = result.description;
        tempSubgraphs = result.tempSubgraphs;
        indexes.splice(0, 1);
      }
    }
    setDesc(description);
    setNodeInTree(null);
    setSelected(false);
    setRefreshMemberList(true);
    if (tempSubgraphs.length === 0) {
      setDesc("");
      setHasNode(false);
    }
    setSubgraphs(tempSubgraphs);
  };

  return (
    <div className="App">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog
        open={showAlert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure to remove the member?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            After removal of member all its sub-relation in the tree will be
            removed. Please be aware of the result of this attempt. Click agree
            to continue removing the member.
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
          <Button
            onClick={() => {
              setShowAlert(false);
              handleDelete();
            }}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>

      {selected && (
        <LightBlueBtn
          disabled={generable}
          variant="contained"
          className="mr-10"
          style={{ marginRight: "10px", marginBottom: "10px" }}
          onClick={() => {
            setShowAlert(true);
          }}
        >
          REMOVE MEMBER
        </LightBlueBtn>
      )}
      <LightBlueBtn
        variant="contained"
        className="mr-10"
        style={{ marginRight: "10px", marginBottom: "10px" }}
        disabled={generable}
        onClick={() => {
          save();
        }}
      >
        SAVE
      </LightBlueBtn>
      {/* <span style={{ color: "#bbf" }}>Notice: please save your changes before switching tab</span> */}

      {desc && hasNode && (
        <MermaidChartComponent chart={desc} callBack={callBack} />
      )}
    </div>
  );
};

export default observer(App);
