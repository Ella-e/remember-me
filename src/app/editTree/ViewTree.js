"use client";
import React, { useEffect, useState } from "react";
import mermaid from "mermaid";
import MermaidChartComponent from "./Mermaid";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useSearchParams } from "next/navigation";
import { Backdrop, CircularProgress } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import html2canvas from "html2canvas";
import saveAs from "file-saver";
import { LightBlueBtn } from "../utils/customBtn";
import "./page.css";
import "suneditor/dist/css/suneditor.min.css";
import SunEditor from "suneditor-react";

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});

const ViewTree = () => {
  const [desc, setDesc] = useState("");
  const [nodeInTree, setNodeInTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [projectName, setProjectName] = useState("");
  const [memberList, setMemberList] = useState(null);


  const download = () => {
    const chartElement = document.getElementById("mermaid-chart");
    html2canvas(chartElement).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, `${projectName}.png`);
      });
    });
  };

  useEffect(() => {
    setLoading(true);
    getTree();
    getMember();
    onAuthStateChanged(auth, (user) => {
      // setUser(user);
    });
  }, []);

  const getMember = async () => {
    const q = query(
      collection(db, "nodes"),
      where("pid", "==", searchParams.get("tab").slice(6, 32))
    );
    const querySnapshot = await getDocs(q);
    let tempMemberList = new Array();
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
        docId: doc.id,
      };
      tempMemberList.push(tempMember);
    });
    setMemberList(tempMemberList);
    setLoading(false);
  }

  const getTree = async () => {
    const projectRef = doc(db, "projects", searchParams.get("tab").slice(6, 32));
    const projectSnap = await getDoc(projectRef);
    const project = projectSnap.data();
    setProjectName(project.name);
    const docRef = doc(db, "trees", searchParams.get("tab").slice(6, 32));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setDesc(data.desc);
    }
  };
  class App extends React.Component {
    constructor(props) {
      super(props);

      this.callBack = (e) => {
        console.log(e);
        if (nodeInTree && nodeInTree.docId === e) {
          // setSelected(false);
          setDesc(desc.replace("style " + e + " color:#fff,stroke-dasharray: 5 5", ""));
          setNodeInTree(null);
        } else {
          if (!nodeInTree) {
            setDesc(desc + "\nstyle " + e + " color:#fff,stroke-dasharray: 5 5");
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
          // setSelected(true);
        }
      };
    }

    download() {
      download();
    }

    render() {
      let chart = desc;

      return (
        <div className="App">
          <LightBlueBtn variant="contained"
            style={{ marginBottom: "10px" }}
            onClick={() => {
              this.download();
            }}>
            DOWNLOAD
          </LightBlueBtn>
          {desc && (
            <MermaidChartComponent chart={chart} callBack={this.callBack} />
          )}
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </div>
      );
    }
  }

  return (

    <div className="flex ">
      <div className="justify-center w-two-third">
        {desc && <App />}
      </div>
      <div className=" bg-white" style={{ minWidth: "490px" }}>
        <h2>Member Details</h2>
        {!nodeInTree && (<h3 style={{ color: "#bbf" }}>{`Click a member on the left\nand view his/her life stories!`}</h3>)}
        {nodeInTree && (
          <div>
            <h3 style={{ color: "#bbf" }}>Name</h3>
            <h3>{nodeInTree.firstName + " " + nodeInTree.lastName}</h3>
            {nodeInTree.nickName && (<div>
              <h3 style={{ color: "#bbf" }}>Nick Name</h3>
              <h3>{nodeInTree.nickName}</h3>
            </div>)}
            {nodeInTree.gender && (<div>
              <h3 style={{ color: "#bbf" }}>Gender</h3>
              <h3>{nodeInTree.gender === "other" ? (nodeInTree.otherGender ? nodeInTree.otherGender : "other") : nodeInTree.gender}</h3>
            </div>)
            }
            {nodeInTree.status && (<div>
              <h3 style={{ color: "#bbf" }}>Status</h3>
              <h3>{nodeInTree.status}</h3>
            </div>)
            }
            {nodeInTree.story && (<div>
              <h3 style={{ color: "#bbf" }}>Life Story</h3>
              <SunEditor
                disable
                disableToolbar
                setContents={nodeInTree.story}
              />
            </div>)
            }
          </div>
        )}
      </div>

    </div>
  );
};

export default ViewTree;
