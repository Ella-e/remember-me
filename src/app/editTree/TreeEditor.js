"use client";
import { Button, Popover, message } from "antd";
import React, { useState, useEffect } from "react";
import Toolbar from "./Toolbar";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";
import mermaid from "mermaid";
import "./page.css";
import MermaidChartComponent from "./Mermaid";
import { auth, db } from "../firebase-config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import {
  Alert,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import EditModal from "./rename";
import ShareModal from "../treeProjects/share";
import { onAuthStateChanged } from "firebase/auth";
import { LightBlueBtn } from "../utils/customBtn";

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});

const TreeEditor = () => {
  const [editVisible, setEditVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [authWarning, setAuthWarning] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const {
    nodeInTree,
    setNodeInTree,
    hasNode,
    setHasNode,
    setSelected,
    relation,
    setRelation,
    setDescription,
    generable,
    setGenerable,
    selected,
    setRefreshMemberList,
  } = treeStore;
  const [pid, setPid] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [subgraphs, setSubgraphs] = useState([]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setAuthWarning(false);
        setPid(searchParams.get("tab").slice(6, 32));
      } else {
        router.push("/login");
      }
    });

    return () => {
      localStorage.removeItem("memberList");
    };
  }, []);

  useEffect(() => {
    if (pid) {
      getTree();
      getProject();
    }
  }, [pid]);

  const getProject = async () => {
    if (pid) {
      const docRef = doc(db, "projects", pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProject(data);
      }
    }
  };

  const getTree = async () => {
    setLoading(true);
    if (pid) {
      const docRef = doc(db, "trees", pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDesc(data.desc);
        setSubgraphs(data.subgraphs);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (desc) setHasNode(true);
    else {
      setHasNode(false);
    }
  }, [desc]);

  const saveTreeToDb = async (desc) => {
    setRelation("Partner");
    setSelected(false);
    if (nodeInTree) {
      desc = desc.replace("style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5", "");
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
      message.success("Save successfully!");
    }
  };

  class App extends React.Component {
    constructor(props) {
      super(props);

      this.callBack = (e) => {
        const memberList = JSON.parse(localStorage.getItem("memberList"));
        if (nodeInTree && nodeInTree.docId === e) {
          setSelected(false);
          setDesc(desc.replace("style " + e + " color:#fff,stroke-dasharray: 5 5", ""));
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

        // let onFocusNodeDocId = e;
        // get selectedMember from local storage
        // console.log(JSON.parse(localStorage.getItem("selectedMember")));
      };
    }

    refresh() {
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
        const index = memberList.findIndex(
          (member) => member.id === tempNode.id
        );
        memberList[index].subgraphId = tempNode.docId.slice(0, 10);
      } else if (relation == "Partner") {
        setDesc(
          desc
            .replace(
              `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))`,
              `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) --- ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))`
            )
            .replace("style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5", "") +
          `        click ${tempNode.docId} callback`
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
          desc?.replace("style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5", "").replace(
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
      } else {
        setDesc(
          desc?.replace("style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5", "").replace(
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
      localStorage.setItem("memberList", JSON.stringify(memberList));
      setRelation("Partner");
      // release localStorage
      localStorage.removeItem("selectedMember");
      setNodeInTree(null);
      setSelected(false);
    }

    save() {
      saveTreeToDb(desc);
      updateMemberToDb();
    }

    delete(subgraphId, description, tempSubgraphs) {
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
      const parentIndex = description.indexOf(` --- ${subgraphId}\n`);
      if (parentIndex !== -1) {
        const parentId = description.slice(parentIndex - 10, parentIndex);
        description = description.replace(`${parentId} --- ${subgraphId}`, "");
      }
      if (members.length === 1) {
        const replace = `        subgraph ${subgraphId}[ ]\n        direction LR\n        ${members[0].id}((${members[0].firstName} ${members[0].lastName}))\n        end`;
        description = description.replace(replace, "");
      } else {
        description = description.replace(
          `        subgraph ${subgraphId}[ ]\n        direction LR\n        ${members[0].id}((${members[0].firstName} ${members[0].lastName})) --- ${members[1].id}((${members[1].firstName} ${members[1].lastName}))\n        end`,
          ""
        );
      }
      localStorage.setItem("memberList", JSON.stringify(memberList));
      setRefreshMemberList(true);
      return { description, tempSubgraphs };
    }

    handleDelete() {
      let description = desc.slice(0, desc.indexOf(`style ${nodeInTree.docId} color:#fff,stroke-dasharray: 5 5`));
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
          .replace("style " + nodeInTree.docId + " color:#fff,stroke-dasharray: 5 5", "");
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
        const result = this.delete(subgraphId, description, tempSubgraphs);
        description = result.description;
        tempSubgraphs = result.tempSubgraphs;
        let indexes = [];
        let index = description.indexOf(`${subgraphId} ---`);
        while (index !== -1) {
          indexes.push(description.slice(index + 15, index + 25))
          index = description.indexOf(`${subgraphId} ---`, index + 1);
        }
        while (indexes.length > 0) {
          let sub = indexes[0];
          let index = description.indexOf(`${sub} ---`);
          while (index !== -1) {
            indexes.push(description.slice(index + 15, index + 25));
            index = description.indexOf(`${sub} ---`, index + 1);
          }
          const result = this.delete(sub, description, tempSubgraphs);
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
    }

    render() {
      // let chart = this.state.description;
      let chart = desc;
      console.log("chart");
      console.log(chart);
      setDescription(desc);

      return (
        <div className="App">
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
                removed. Please be aware of the result of this attempt. Click
                agree to continue removing the member.
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
                  this.handleDelete();
                }}
                autoFocus
              >
                Agree
              </Button>
            </DialogActions>
          </Dialog>
          <LightBlueBtn variant="contained" onClick={() => {
            setLoading(true);
            this.refresh();
            setLoading(false);
          }}
            className="mr-10"
            style={{ marginRight: "10px" }}
            disabled={!generable}>
            GENERATE TREE
          </LightBlueBtn>

          {selected && (
            <LightBlueBtn variant="contained" className="mr-10" style={{ marginRight: "10px" }} onClick={() => {
              setShowAlert(true);
            }}>
              REMOVE MEMBER
            </LightBlueBtn>
          )}
          <LightBlueBtn variant="contained" className="mr-10" style={{ marginRight: "10px" }}
            disabled={generable}
            onClick={() => {
              this.save();
            }}>
            SAVE
          </LightBlueBtn>

          {desc && hasNode && (
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
      <div className="flex ">
        <div className="justify-center w-two-third">
          {project && (
            <div className="flex" style={{ justifyContent: "start" }}>
              <h1 style={{ cursor: "text", maxWidth: "80%" }}>
                {project.name}
              </h1>
              <Popover
                onOpenChange={(visible) => setEditVisible(visible)}
                open={editVisible}
                placement="bottomLeft"
                content={
                  <EditModal
                    project={project}
                    onClose={() => {
                      setEditVisible(false);
                      getProject();
                    }}
                  />
                }
                trigger="click"
              >
                <Link
                  className="edit"
                  href="#"
                  onClick={() => setEditVisible(true)}
                >
                  EDIT
                </Link>
              </Popover>
              <Popover
                onOpenChange={(visible) => setShareVisible(visible)}
                open={shareVisible}
                placement="bottomLeft"
                content={
                  <ShareModal
                    project={project}
                    onClose={() => {
                      setShareVisible(false);
                    }}
                  />
                }
                trigger="click"
              >
                <Link
                  className="edit"
                  href="#"
                  onClick={() => setShareVisible(true)}
                >
                  SHARE
                </Link>
              </Popover>
            </div>
          )}

          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          <App />
        </div>
        <div className=" bg-white mr-10">
          <Toolbar />
        </div>
      </div>
    </div>
  );
};

export default observer(TreeEditor);
