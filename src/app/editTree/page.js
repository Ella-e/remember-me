"use client";
import { Button } from "antd";
import MermaidChart from "./Mermaid";
import React, { useState, useEffect } from "react";
import Toolbar from "./Toolbar";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";
import mermaid from "mermaid";
import "./page.css";
import MermaidChartComponent from "./Mermaid";
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

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});

const TreeEditor = () => {
  const [desc, setDesc] = useState(null);
  const [nodeInTree, setNodeInTree] = useState(null);
  const {
    hasNode,
    setHasNode,
    onRootNode,
    setOnRootNode,
    setSelected,
    selected,
    relation,
    setRelation,
    setDescription,
  } = treeStore;

  const updateMemberToDb = async (member, update) => {
    // check if this person's memberlist exist first
    const docRef = doc(db, "nodes", member.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // update the doc
      await updateDoc(docRef, {
        subgraphId: update.subgraphId,
      });
    }
  };

  // const getMemberList = async () => {
  //   if (auth.currentUser) {
  //     const q = query(
  //       collection(db, "nodes"),
  //       where("uid", "==", auth.currentUser.uid)
  //     );
  //     const querySnapshot = await getDocs(q);
  //     // const tempMemberList = [...memberList];
  //     const tempMemberList = new Array();
  //     querySnapshot.forEach((doc) => {
  //       // doc.data() is never undefined for query doc snapshots
  //       const docData = doc.data();
  //       const tempMember = {
  //         id: docData.id,
  //         firstName: docData.firstName,
  //         lastName: docData.lastName,
  //         docId: doc.id,
  //         subgraphId: docData.subgraphId
  //       };
  //       tempMemberList.push(tempMember);
  //     });
  //     localStorage.setItem("memberList", JSON.stringify(tempMemberList));
  //   }
  // };

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.selected = "";
      // if (description) {
      //   setDesc(description);
      // }
      const tempNode = JSON.parse(localStorage.getItem("selectedMember"));
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
      }

      this.callBack = (e) => {
        console.log("e");
        console.log(e);
        // setOnRootNode(false);
        const memberList = JSON.parse(localStorage.getItem("memberList"));
        // select member by id from memberlist
        for (let i = 0; i < memberList.length; i++) {
          if (memberList[i].docId === e) {
            setNodeInTree(memberList[i]);
          }
        }
        if (selected) {
          this.selected = "";
          setSelected(false);
          setDesc(desc.replace("style " + e + " fill:#bbf", ""));
        } else {
          this.selected = e;
          setSelected(true);
          setDesc(desc + `\nstyle ${e} fill:#bbf`);
        }

        // let onFocusNodeDocId = e;
        // get selectedMember from local storage
        // console.log(JSON.parse(localStorage.getItem("selectedMember")));
      };
    }

    refresh() {
      setHasNode(true);
      const tempNode = JSON.parse(localStorage.getItem("selectedMember"));
      console.log(relation);
      setSelected(false);
      if (relation == "Partner") {
        setDesc(
          desc
            ?.replace(
              `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))`,
              `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) --- ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))`
            )
            .replace("style " + nodeInTree.docId + " fill:#bbf", "") +
            `click ${tempNode.docId} callback`
        );
        // updateMemberToDb(tempNode, { subgraphId: nodeInTree.docId.slice(0, 10) });
      } else if (relation == "Children") {
        console.log("c");
        //TODO: db 存 subgraph名
        setDesc(
          desc?.replace("style " + nodeInTree.docId + " fill:#bbf", "").replace(
            `graph TD`,
            `graph TD
          subgraph ${tempNode.docId.slice(0, 10)}[ ]
        direction LR
        ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
        end
        ${nodeInTree.docId.slice(0, 10)} --- ${tempNode.docId.slice(0, 10)}`
          ) + `click ${tempNode.docId} callback`
        );
      } else {
        setDesc(
          desc?.replace("style " + nodeInTree.docId + " fill:#bbf", "").replace(
            `graph TD`,
            `graph TD
          subgraph ${tempNode.docId.slice(0, 10)}[ ]
        direction LR
        ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
        end
        ${tempNode.docId.slice(0, 10)} --- ${nodeInTree.docId.slice(0, 10)}`
          ) + `click ${tempNode.docId} callback`
        );
      }
      setRelation("Partner");
      // release localStorage
      localStorage.removeItem("selectedMember");
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
          <MermaidChartComponent chart={chart} callBack={this.callBack} />
          <Button
            type="primary"
            onClick={() => {
              this.refresh();
              // treeStore.setGenerable(false);
            }}
            // disabled={!generable}
          >
            generate tree
          </Button>
        </div>
      );
    }
  }

  return (
    <div className="flex-1 flex justify-end">
      <div className="justify-center h-full w-half">
        <h1>Family Tree</h1>
        {hasNode && <App />}
      </div>
      <div className=" bg-white w-half">
        <Toolbar />
      </div>
    </div>
  );
};

export default observer(TreeEditor);
