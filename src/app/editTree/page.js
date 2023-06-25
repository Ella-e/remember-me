"use client";
import { Button } from "antd";
import React, { useState, useEffect } from "react";
import Toolbar from "./Toolbar";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";
import mermaid from "mermaid";
import "./page.css";
import MermaidChartComponent from "./Mermaid";
import { auth, db } from "../firebase-config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Alert, Backdrop, CircularProgress } from "@mui/material";

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});

const TreeEditor = () => {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodeInTree, setNodeInTree] = useState(null);
  const [authWarning, setAuthWarning] = useState(false);
  const currentUid = auth?.currentUser?.uid;
  const {
    hasNode,
    setHasNode,
    setSelected,
    relation,
    setRelation,
    setDescription,
    generable,
    setGenerable,
    setChooseAble,
  } = treeStore;

  const getTree = async () => {
    setLoading(true);
    const docRef = doc(db, "trees", currentUid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setDesc(data.desc);
      setHasNode(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (auth.currentUser) {
      setAuthWarning(false);
      getTree();
      return () => {
        const memberList = JSON.parse(localStorage.getItem("memberList"));
        const docRef = doc(db, "trees", currentUid);
        getDoc(docRef).then((docSnap) => {
          if (docSnap.exists()) {
          }
          for (let i = 0; i < memberList.length; i++) {
            if (
              docSnap.data() &&
              docSnap.data().desc.search(memberList[i].docId) === -1
            ) {
              updateMemberToDb(memberList[i], {
                subgraphId: memberList[i].subgraphId,
                used: false,
              });
            }
          }
        });
      };
    } else {
      setAuthWarning(true);
    }
  }, []);

  const saveTreeToDb = async (desc) => {
    setRelation("Partner");
    setSelected(false);
    setChooseAble(false);
    if (nodeInTree) {
      desc = desc.replace("style " + nodeInTree.docId + " fill:#bbf", "");
      console.log(desc);
      setDesc(desc);
      setNodeInTree(null);
    }
    const docRef = doc(db, "trees", currentUid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // update the doc
      await updateDoc(docRef, {
        desc: desc,
      });
    } else {
      await setDoc(docRef, {
        id: currentUid,
        uid: currentUid,
        desc: desc,
      });
    }
  };

  const updateMemberToDb = async (member, update) => {
    // check if this person's memberlist exist first
    const docRef = doc(db, "nodes", member.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // update the doc
      const updateData = { subgraphId: update.subgraphId };
      if (update.hasOwnProperty("used")) {
        updateData.used = update.used;
      }
      await updateDoc(docRef, updateData).then(() => {
        const memberList = JSON.parse(localStorage.getItem("memberList"));
        for (let i = 0; i < memberList.length; i++) {
          if (memberList[i].docId === member.docId) {
            memberList[i].subgraphId = update.subgraphId;
          }
        }
        localStorage.setItem("memberList", JSON.stringify(memberList));
      });
    }
  };

  class App extends React.Component {
    constructor(props) {
      super(props);

      this.callBack = (e) => {
        console.log(e);
        // setOnRootNode(false);
        const memberList = JSON.parse(localStorage.getItem("memberList"));
        // select member by id from memberlist

        if (nodeInTree && nodeInTree.docId === e) {
          setSelected(false);
          setDesc(desc.replace("style " + e + " fill:#bbf", ""));
          setNodeInTree(null);
        } else {
          if (!nodeInTree) {
            setDesc(desc + `\nstyle ${e} fill:#bbf`);
          } else {
            setDesc(
              desc.replace(
                "style " + nodeInTree.docId + " fill:#bbf",
                "style " + e + " fill:#bbf"
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

        // let onFocusNodeDocId = e;
        // get selectedMember from local storage
        // console.log(JSON.parse(localStorage.getItem("selectedMember")));
      };
    }

    refresh() {
      setGenerable(false);
      const tempNode = JSON.parse(localStorage.getItem("selectedMember"));
      setSelected(false);
      if (!desc) {
        let tempDesc = `graph TD
        subgraph ${tempNode.docId.slice(0, 10)}[ ]
        direction LR
        ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
        end
        click ${tempNode.docId} callback`;
        setDesc(tempDesc);
        updateMemberToDb(tempNode, {
          subgraphId: tempNode.docId.slice(0, 10),
        });
      } else if (relation == "Partner") {
        setDesc(
          desc
            ?.replace(
              `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))`,
              `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) --- ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))`
            )
            .replace("style " + nodeInTree.docId + " fill:#bbf", "") +
            `click ${tempNode.docId} callback`
        );
        updateMemberToDb(tempNode, {
          subgraphId: nodeInTree.docId.slice(0, 10),
        });
      } else if (relation == "Children") {
        setDesc(
          desc?.replace("style " + nodeInTree.docId + " fill:#bbf", "").replace(
            `graph TD`,
            `graph TD
          subgraph ${tempNode.docId.slice(0, 10)}[ ]
        direction LR
        ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
        end
        ${nodeInTree.subgraphId.slice(0, 10)} --- ${tempNode.docId.slice(
              0,
              10
            )}`
          ) + `click ${tempNode.docId} callback`
        );
        updateMemberToDb(tempNode, { subgraphId: tempNode.docId.slice(0, 10) });
      } else {
        setDesc(
          desc?.replace("style " + nodeInTree.docId + " fill:#bbf", "").replace(
            `graph TD`,
            `graph TD
          subgraph ${tempNode.docId.slice(0, 10)}[ ]
        direction LR
        ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
        end
        ${tempNode.docId.slice(0, 10)} --- ${nodeInTree.subgraphId.slice(
              0,
              10
            )}`
          ) + `click ${tempNode.docId} callback`
        );
        updateMemberToDb(tempNode, { subgraphId: tempNode.docId.slice(0, 10) });
      }
      setRelation("Partner");
      // release localStorage
      localStorage.removeItem("selectedMember");
      setNodeInTree(null);
      setSelected(false);
    }

    save() {
      saveTreeToDb(desc);
    }

    render() {
      // let chart = this.state.description;
      let chart = desc;
      console.log("chart");
      console.log(chart);
      setDescription(desc);
      // let chart = treeStore.description;
      /**
    * graph LR
        01H3HAWJ6R7NTT3Q4HV40SMTTY((Jiali Yu))
        click 01H3HAWJ6R7NTT3Q4HV40SMTTY callback
    style 01H3HAP36BHKGSAYQZZ1RCHK8A fill:#ECECFF
        01H3HAP36BHKGSAYQZZ1RCHK8A((Ella Mu)) --- 01H3HAWJ6R7NTT3Q4HV40SMTTY((Jiali Yu))
        click 01H3HAWJ6R7NTT3Q4HV40SMTTY callback
    */
      let test_chart = `graph TD
style 01H3HAP36BHKGSAYQZZ1RCHK8A fill:#ECECFF
        01H3HAWJ6R7NTT3Q4HV40SMTTY((Jiali Yu)) --- 01H3HAP36BHKGSAYQZZ1RCHK8A((Ella Mu))
      click 01H3HAP36BHKGSAYQZZ1RCHK8A callback
      click 01H3HAWJ6R7NTT3Q4HV40SMTTY callback`;

      return (
        <div className="App">
          <Button
            className="mr-10"
            type="primary"
            onClick={() => {
              this.refresh();
            }}
            disabled={!generable}
          >
            GENERATE TREE
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.save();
              this.render();
            }}
          >
            SAVE
          </Button>
          {desc && (
            <MermaidChartComponent chart={chart} callBack={this.callBack} />
          )}
        </div>
      );
    }
  }

  return (
    <div>
      {authWarning && (
        <Alert
          className="mb-10"
          severity="warning"
          onClick={() => {
            setAuthWarning(false);
          }}
        >
          Please login to save data into database.
        </Alert>
      )}
      <div className="flex-1 flex justify-end">
        <div className="justify-center h-full w-half">
          <h1>Family Tree</h1>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          {hasNode && <App />}
        </div>
        <div className=" bg-white w-half">
          <Toolbar />
        </div>
      </div>
    </div>
  );
};

export default observer(TreeEditor);
