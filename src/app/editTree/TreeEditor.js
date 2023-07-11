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
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
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

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});

const TreeEditor = () => {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodeInTree, setNodeInTree] = useState(null);
  const [authWarning, setAuthWarning] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
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
    selected,
    setRefreshMemberList,
  } = treeStore;
  const [pid, setPid] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setAuthWarning(false);
      setPid(searchParams.get("tab").slice(6, 32));
    } else {
      router.push("/login");
    }
    return () => {
      setRefreshMemberList(false);
      const memberList = JSON.parse(localStorage.getItem("memberList"));
      if (pid) {
        const docRef = doc(db, "trees", pid);

        getDoc(docRef).then((docSnap) => {
          if (docSnap.exists()) {
          }
          for (let i = 0; i < memberList.length; i++) {
            if (
              docSnap.data() &&
              docSnap.data().desc.indexOf(memberList[i].docId) === -1
            ) {
              updateMemberToDb(memberList[i], {
                subgraphId: memberList[i].subgraphId,
                used: false,
              });
            }
          }
        });
      }
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
        setProjectName(data.name);
        console.log(data.name);
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
        setHasNode(true);
      }
      setLoading(false);
    }
  };

  const handleInputClick = () => {
    setIsEditing(true);
  };

  const updateProject = async () => {
    const docRef = doc(db, "projects", pid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("update");
      await updateDoc(docRef, {
        name: projectName,
      });
    }
  };

  useEffect(() => {
    if (projectName) {
      updateProject();
    }
  }, [projectName]);


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
    if (pid) {
      const docRef = doc(db, "trees", pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // update the doc
        await updateDoc(docRef, {
          desc: desc,
        });
      } else {
        await setDoc(docRef, {
          id: pid,
          desc: desc,
        });
      }
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
            .replace(
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

    handleDelete() {
      function deleteChildren(desc, subgraphId, updateList) {
        while (desc.indexOf(`${subgraphId} ---`) !== -1) {
          console.log("recurse");
          let sub = desc.slice(
            desc.indexOf(`${subgraphId} ---`) + 15,
            desc.indexOf(`${subgraphId} ---`) + 25
          );
          console.log(sub);
          desc = desc
            .replace(`${subgraphId} --- ${sub}`, "")
            .replace(`subgraph ${sub}\ndirection LR\n` + /.*/ + `\nend`, "");
        }
        return { desc: desc, update: updateList };
      }
      let description = desc.replace(
        "style " + nodeInTree.docId + " fill:#bbf",
        ""
      );
      let update = [
        {
          docId: nodeInTree.docId,
          subgraphId: nodeInTree.docId.slice(0, 10),
          id: nodeInTree.id,
        },
      ];
      const memberList = JSON.parse(localStorage.getItem("memberList"));
      console.log(memberList);
      //FIXME: 有的时候即使是相等的也会判断false
      if (nodeInTree.subgraphId == nodeInTree.docId.slice(0, 10)) {
        console.log("1");
        let subgraphID = nodeInTree.subgraphId;
        description = description.replace(
          `click ${nodeInTree.docId} callback`,
          ""
        );
        if (
          description.indexOf(
            `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) ---`
          ) === -1
        ) {
          console.log("2");
          console.log(`subgraph ${nodeInTree.subgraphId}[ ]
          direction LR
          ${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))
          end`);
          description = description.replace(
            `subgraph ${nodeInTree.subgraphId}[ ]\ndirection LR\n${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))\nend`,
            ""
          );
          if (
            description.indexOf("subgraph", description.indexOf("subgraph") + 8)
          ) {
            description = "";
            setDesc("");
          }
        } else {
          console.log("3");
          const index = description.indexOf(
            `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) ---`
          );
          const len =
            36 + nodeInTree.firstName.length + nodeInTree.lastName.length;
          const subId = description.slice(index + len, index + len + 10);
          description = description
            .replace(`subgraph ${nodeInTree.subgraphId}`, `subgraph ${subId}`)
            .replace(
              `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) --- `,
              ""
            );
        }

        if (description.indexOf(`${subgraphID} ---`) !== -1) {
          description = deleteChildren(description, subgraphID, update).desc;
          update = deleteChildren(description, subgraphID, update).update;
        }
      } else {
        //TODO: see if it has partner
      }
      memberList.forEach((member) => {
        const index = update.findIndex((item) => item.docId === member.docId);
        if (index !== -1) {
          member.subgraphId = update[index].subgraphId;
        }
      });
      localStorage.setItem("memberList", JSON.stringify(memberList));
      update.forEach((item) => {
        updateMemberToDb(item, { subgraphId: item.subgraphId, used: false });
      });
      setDesc(description);
      setSelected(false);
      setNodeInTree(null);
      setRefreshMemberList(true);
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
          {selected && (
            <Button
              id="delete-button"
              className="mr-10"
              type="primary"
              onClick={() => {
                setShowAlert(true);
              }}
            >
              REMOVE MEMBER
            </Button>
          )}
          <Button
            type="primary"
            onClick={() => {
              this.save();
              // this.render();
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
      <div className="flex ">
        <div className="justify-center w-two-third">
          {projectName && (isEditing ? (
            <h1
              contentEditable
              onBlur={(event) => {
                setProjectName(event.target.textContent);
                setIsEditing(false);
              }}
              autoFocus
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '2em',
                fontWeight: 'bold'
              }}
            >
              {projectName}
            </h1>
          ) : (
            <h1 onClick={handleInputClick} style={{ cursor: 'text' }}>
              {projectName}
            </h1>
          ))}


          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          {hasNode && <App />}
        </div>
        <div className=" bg-white mr-10">
          <Toolbar />
        </div>
      </div>
    </div>
  );
};

export default observer(TreeEditor);

//FIXME: only project memberlist; input name length limit & input warning