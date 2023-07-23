"use client";
import { Button } from "antd";
import MermaidChart from "./Mermaid";
import React, { useEffect, useState } from "react";
import Toolbar from "./Toolbar";
import mermaid from "mermaid";
import MermaidChartComponent from "./Mermaid";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useSearchParams } from "next/navigation";
import { Backdrop, CircularProgress } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import html2canvas from "html2canvas";
import saveAs from "file-saver";
import { LightBlueBtn } from "../utils/customBtn";

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


  const download = () => {
    const chartElement = document.getElementById("mermaid-chart");
    html2canvas(chartElement).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, `${projectName}.png`);
      });
    });
  };

  useEffect(() => {
    getTree();
    onAuthStateChanged(auth, (user) => {
      // setUser(user);
    });
  }, []);

  const getTree = async () => {
    setLoading(true);
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
    setLoading(false);
  };
  class App extends React.Component {
    constructor(props) {
      super(props);

      this.callBack = (e) => {
        console.log(e);
        const memberList = JSON.parse(localStorage.getItem("memberList"));
        if (nodeInTree && nodeInTree.docId === e) {
          // setSelected(false);
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

  // useEffect(() => {
  //   const clickOnNode = () => {
  //     console.log("node clicked");
  //   };
  //   window.addEventListener("graphDiv", clickOnNode);
  //   return () => {
  //     window.removeEventListener("graphDiv", clickOnNode);
  //   };
  // }, []);

  // // Example of using the bindFunctions
  // const drawDiagram = async function () {
  //   const element = document.querySelector(".graphDiv");
  //   // const graphDefinition = "graph TB\na-->b";
  //   const graphDefinition = testContent;
  //   const { svg, bindFunctions } = await mermaid.render(
  //     "graphDiv",
  //     graphDefinition
  //   );
  //   element.innerHTML = svg;
  //   // This can also be written as `bindFunctions?.(element);` using the `?` shorthand.
  //   console.log(bindFunctions);
  //   if (bindFunctions) {
  //     console.log("run Bind function");
  //     bindFunctions(element);
  //   }
  // };

  return (
    <div>
      {/* <MermaidChart chartDefinition={testContent} callBack={undefined} /> */}
      {desc && <App />}
    </div>
  );
};

export default ViewTree;
