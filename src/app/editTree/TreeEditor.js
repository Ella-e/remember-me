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
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});

const TreeEditor = () => {
  const [editVisible, setEditVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
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
  const [project, setProject] = useState(null);
  const [subgraphs, setSubgraphs] = useState([]);

  useEffect(() => {
    if (auth.currentUser) {
      setAuthWarning(false);
      setPid(searchParams.get("tab").slice(6, 32));
    } else {
      router.push("/login");
    }
    return () => {
      localStorage.removeItem("memberList");
      // setRefreshMemberList(false);
      // const memberList = JSON.parse(localStorage.getItem("memberList"));
      // if (pid) {
      //   const docRef = doc(db, "trees", pid);
      //   getDoc(docRef).then((docSnap) => {
      //     if (docSnap.exists()) {
      //       for (let i = 0; i < memberList.length; i++) {
      //         if (
      //           docSnap.data() &&
      //           docSnap.data().desc.indexOf(memberList[i].docId) === -1
      //         ) {
      //           updateMemberToDb(memberList[i], {
      //             subgraphId: "",
      //             used: false,
      //           });
      //         }
      //       }
      //     }
      //   });
      // }
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

  const download = () => {
    const chartElement = document.getElementById("mermaid-chart");
    html2canvas(chartElement).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, `${project.name}.png`);
      });
    });
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
  }, [desc]);

  const saveTreeToDb = async (desc) => {
    setRelation("Partner");
    setSelected(false);
    setChooseAble(false);
    if (nodeInTree) {
      desc = desc.replace("style " + nodeInTree.docId + " fill:#bbf", "");
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
      const memberList = JSON.parse(localStorage.getItem("memberList"));
      if (!desc) {
        let tempDesc = `graph TD
        subgraph ${tempNode.docId.slice(0, 10)}[ ]
        direction LR
        ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
        end
        click ${tempNode.docId} callback`;
        setDesc(tempDesc);
        setSubgraphs([{ id: tempNode.docId.slice(0, 10), members: [tempNode.docId] }]);
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
            .replace("style " + nodeInTree.docId + " fill:#bbf", "") +
          `        click ${tempNode.docId} callback`
        );
        let index = subgraphs.findIndex((subgraph) => subgraph.id === nodeInTree.subgraphId);
        subgraphs[index].members.push(tempNode.docId);
        setSubgraphs(subgraphs);
        index = memberList.findIndex(
          (member) => member.id === tempNode.id
        );
        memberList[index].subgraphId = nodeInTree.subgraphId;
        // updateMemberToDb(tempNode, {
        //   subgraphId: nodeInTree.docId.slice(0, 10),
        // });
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
          ) + `        click ${tempNode.docId} callback`
        );
        subgraphs.push({ id: tempNode.docId.slice(0, 10), members: [tempNode.docId] });
        setSubgraphs(subgraphs);
        const index = memberList.findIndex(
          (member) => member.id === tempNode.id
        );
        memberList[index].subgraphId = tempNode.docId.slice(0, 10);
        // updateMemberToDb(tempNode, { subgraphId: tempNode.docId.slice(0, 10) });
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
          ) + `        click ${tempNode.docId} callback`
        );
        subgraphs.push({ id: tempNode.docId.slice(0, 10), members: [tempNode.docId] });
        setSubgraphs(subgraphs);
        const index = memberList.findIndex(
          (member) => member.id === tempNode.id
        );
        memberList[index].subgraphId = tempNode.docId.slice(0, 10);
        // updateMemberToDb(tempNode, { subgraphId: tempNode.docId.slice(0, 10) });
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

    handleDelete() {
      const index = subgraphs.findIndex((subgraph) => subgraph.id === nodeInTree.subgraphId)
      const memberList = JSON.parse(localStorage.getItem("memberList"));
      if (subgraphs[index].members.length > 1) {
        let tempDesc = desc.replace(
          `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) --- `,
          ""
        ).replace(
          ` --- ${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))`, ""
        ).replace(
          `click ${nodeInTree.docId} callback`, ""
        ).replace(
          "style " + nodeInTree.docId + " fill:#bbf", ""
        );
        setDesc(tempDesc);
        subgraphs[index].members.splice(
          subgraphs[index].members.indexOf(nodeInTree.docId),
          1
        );
        setSubgraphs(subgraphs);
        const memberIndex = memberList.findIndex(
          (member) => member.id === nodeInTree.id
        );
        memberList[memberIndex].subgraphId = "";
        memberList[memberIndex].used = false;
      }
      else {
        let tempDesc = desc;
        const members = [];
        const subgraphMembers = subgraphs[index].members;
        for (let i = 0; i < subgraphMembers.length; i++) {
          const id = subgraphMembers[i];
          tempDesc = tempDesc.replace(
            `click ${id} callback`, ""
          )
          const memberIndex = memberList.findIndex(
            (member) => member.id === id
          );
          memberList[memberIndex].subgraphId = "";
          memberList[memberIndex].used = false;
          members.push({ id: id, firstName: memberList[memberIndex].firstName, lastName: memberList[memberIndex].lastName });
        }
        tempDesc = tempDesc.replace(
          "style " + nodeInTree.docId + " fill:#bbf", ""
        ).replace(
          ` --- ${nodeInTree.subgraphId}`, ""
        );
        if (members.length === 1) {
          console.log(`subgraph ${nodeInTree.subgraphId}[ ]
          direction LR
          ${members[0].id}((${members[0].firstName} ${members[0].lastName}))
          end`);
          console.log(`subgraph ${nodeInTree.subgraphId}[ ]
          direction LR
          ${members[0].id}((${members[0].firstName} ${members[0].lastName}))
          end` === `subgraph 01H5SZ69JW[ ]
          direction LR
          01H5SZ69JWE737Z276JX1AX5Z9((3 3))
          end`);
          console.log("want to replace:", `subgraph ${nodeInTree.subgraphId}[ ]
          direction LR
          ${members[0].id}((${members[0].firstName} ${members[0].lastName}))
          end`);
          tempDesc = tempDesc.replace(
            `subgraph ${nodeInTree.subgraphId}[ ]
            direction LR
            ${members[0].id}((${members[0].firstName} ${members[0].lastName}))
            end`, ""
          );
        }
        else {
          tempDesc = tempDesc.replace(
            `subgraph ${nodeInTree.subgraphId}[ ]
             direction LR
             ${members[0].id}((${members[0].firstName} ${members[0].lastName})) --- ${members[1].id}((${members[1].firstName} ${members[1].lastName}))
             end`, ""
          );
        }
        let subgraphId = nodeInTree.subgraphId;
        //FIXME: multiple children
        while (tempDesc.indexOf(`${subgraphId} ---`) !== -1) {
          console.log("subgraphId", subgraphId);
          let sub = desc.slice(
            desc.indexOf(`${subgraphId} ---`) + 15,
            desc.indexOf(`${subgraphId} ---`) + 25
          );
          const subgraphIndex = subgraphs.findIndex((subgraph) => subgraph.id === sub);
          const members = [];
          for (const id in subgraphs[subgraphIndex].members) {
            tempDesc = tempDesc.replace(
              `click ${id} callback`, ""
            )
            const memberIndex = memberList.findIndex(
              (member) => member.id === id
            );
            memberList[memberIndex].subgraphId = "";
            memberList[memberIndex].used = false;
            members.push({ id: id, firstName: memberList[memberIndex].firstName, lastName: memberList[memberIndex].lastName });
          }
          tempDesc = tempDesc.replace(
            `${subgraphId} --- ${sub}`, ""
          );
          if (members.length === 1) {
            tempDesc = tempDesc.replace(
              `subgraph ${sub}[ ]
            direction LR
            ${members[0].id}((${members[0].firstName} ${members[0].lastName}))
            end`, ""
            );
          }
          else {
            tempDesc = tempDesc.replace(
              `subgraph ${sub}[ ]
              direction LR
              ${members[0].id}((${members[0].firstName} ${members[0].lastName})) --- ${members[1].id}((${members[1].firstName} ${members[1].lastName}))
              end`, ""
            );
          }
          subgraphs.splice(subgraphIndex, 1);
          subgraphId = sub;
        }
        setDesc(tempDesc);
        setSubgraphs(subgraphs);
      }
      localStorage.setItem("memberList", JSON.stringify(memberList));
      setNodeInTree(null);
      setSelected(false);
      setRefreshMemberList(true);




      // function deleteChildren(desc, subgraphId, updateList) {
      //   while (desc.indexOf(`${subgraphId} ---`) !== -1) {
      //     console.log("recurse");
      //     let sub = desc.slice(
      //       desc.indexOf(`${subgraphId} ---`) + 15,
      //       desc.indexOf(`${subgraphId} ---`) + 25
      //     );
      //     console.log(sub);
      //     desc = desc
      //       .replace(`${subgraphId} --- ${sub}`, "")
      //       .replace(`subgraph ${sub}\ndirection LR\n` + /.*/ + `\nend`, "");
      //   }
      //   return { desc: desc, update: updateList };
      // }
      // let description = desc.replace(
      //   "style " + nodeInTree.docId + " fill:#bbf",
      //   ""
      // );
      // let update = [
      //   {
      //     docId: nodeInTree.docId,
      //     subgraphId: nodeInTree.docId.slice(0, 10),
      //     id: nodeInTree.id,
      //   },
      // ];
      // const memberList = JSON.parse(localStorage.getItem("memberList"));
      // console.log(memberList);
      // //FIXME: 有的时候即使是相等的也会判断false
      // if (nodeInTree.subgraphId == nodeInTree.docId.slice(0, 10)) {
      //   console.log("1");
      //   let subgraphID = nodeInTree.subgraphId;
      //   description = description.replace(
      //     `click ${nodeInTree.docId} callback`,
      //     ""
      //   );
      //   if (
      //     description.indexOf(
      //       `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) ---`
      //     ) === -1
      //   ) {
      //     console.log("2");
      //     console.log(`subgraph ${nodeInTree.subgraphId}[ ]
      //     direction LR
      //     ${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))
      //     end`);
      //     description = description.replace(
      //       `subgraph ${nodeInTree.subgraphId}[ ]\ndirection LR\n${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName}))\nend`,
      //       ""
      //     );
      //     if (
      //       description.indexOf("subgraph", description.indexOf("subgraph") + 8)
      //     ) {
      //       description = "";
      //       setDesc("");
      //     }
      //   } else {
      //     console.log("3");
      //     const index = description.indexOf(
      //       `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) ---`
      //     );
      //     const len =
      //       36 + nodeInTree.firstName.length + nodeInTree.lastName.length;
      //     const subId = description.slice(index + len, index + len + 10);
      //     description = description
      //       .replace(`subgraph ${nodeInTree.subgraphId}`, `subgraph ${subId}`)
      //       .replace(
      //         `${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) --- `,
      //         ""
      //       );
      //   }

      //   if (description.indexOf(`${subgraphID} ---`) !== -1) {
      //     description = deleteChildren(description, subgraphID, update).desc;
      //     update = deleteChildren(description, subgraphID, update).update;
      //   }
      // } else {
      //   //TODO: see if it has partner
      // }
      // memberList.forEach((member) => {
      //   const index = update.findIndex((item) => item.docId === member.docId);
      //   if (index !== -1) {
      //     member.subgraphId = update[index].subgraphId;
      //   }
      // });
      // localStorage.setItem("memberList", JSON.stringify(memberList));
      // update.forEach((item) => {
      //   updateMemberToDb(item, { subgraphId: item.subgraphId, used: false });
      // });
      // setDesc(description);
      // setSelected(false);
      // setNodeInTree(null);
      // setRefreshMemberList(true);
    }

    download() {
      download();
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
              setLoading(true);
              this.refresh();
              setLoading(false);
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
            className="mr-10"
            disabled={generable}
            onClick={() => {
              this.save();
              // this.render();
            }}
          >
            SAVE
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.download();
            }}
          >
            DOWNLOAD
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
