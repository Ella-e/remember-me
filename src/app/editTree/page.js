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

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});

const TreeEditor = () => {
  const [start, setStart] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [desc, setDesc] = useState(null);
  const [nodeInTree, setNodeInTree] = useState(null);
  const {
    addNode,
    generable,
    hasNode,
    setSelected,
    relation,
    description,
    setDescription,
  } = treeStore;
  const handleClick = () => {
    setStart(true);
  };

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.selected = "";
      const tempNode = JSON.parse(localStorage.getItem("selectedMember"));
      if (!desc) {
        let tempDesc = `graph TD
        ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
        click ${tempNode.docId} callback`;
        setDesc(tempDesc);
      }
      // this.setState({
      //   description: `graph TD
      // ${addNode.docId}((${addNode.firstName} ${addNode.lastName}))
      // click ${addNode.docId} callback`,
      // });

      // this.state = {
      //   description: `graph TD
      //   B((B))
      //   click B callback
      //   A((A))---B((B))
      //   click A callback`,
      // };
      // setDesc(this.state.description);
      this.callBack = (e) => {
        console.log("e");
        console.log(e);
        const memberList = JSON.parse(localStorage.getItem("memberList"));
        // select member by id from memberlist
        for (let i = 0; i < memberList.length; i++) {
          if (memberList[i].docId === e) {
            setNodeInTree(memberList[i]);
          }
        }
        if (this.selected) {
          this.selected = "";
          setSelected(false);
          // setSelectedNode(null);
        } else {
          this.selected = e;
          setSelected(true);
          // setSelectedNode(JSON.parse(localStorage.getItem("selectedMember")));
        }

        // let onFocusNodeDocId = e;
        // get selectedMember from local storage
        // console.log(JSON.parse(localStorage.getItem("selectedMember")));

        // if (!this.selected) {
        //   this.setState({
        //     description: desc.toString() + `\nstyle ${e} fill:#bbf`,
        //   });
        //   this.selected = e;
        //   setSelected(true);
        //   // setSelectedNode(treeStore.addNode);
        //   setSelectedNode(JSON.parse(localStorage.getItem("selectedMember")));
        //   setDesc(this.state.description);
        //   //FIXME: have to click twice
        // } else {
        //   this.setState({
        //     description: `${desc}
        //     style ${e} fill:#ECECFF`,
        //   });
        //   this.selected = "";
        //   setSelected(false);
        // }
      };
    }

    refresh() {
      // treeStore.setDescription(
      //   treeStore.description +
      //     `\nstyle ${selectedNode.docId} fill:#ECECFF
      // ${selectedNode.docId} --- ${addNode.docId}((${addNode.firstName} ${addNode.lastName}))
      // click ${addNode.docId} callback`
      // );
      console.log(selectedNode);
      const tempNode = JSON.parse(localStorage.getItem("selectedMember"));
      setDesc(
        desc +
          `\nstyle ${nodeInTree.docId} fill:#ECECFF
      ${nodeInTree.docId}((${nodeInTree.firstName} ${nodeInTree.lastName})) --- ${tempNode.docId}((${tempNode.firstName} ${tempNode.lastName}))
      click ${tempNode.docId} callback`
      );
      // this.setState({
      //   description:
      //     desc +
      //     `\nstyle ${selectedNode.docId} fill:#ECECFF
      //   ${selectedNode.docId}((${selectedNode.firstName} ${selectedNode.lastName})) --- ${addNode.docId}((${addNode.firstName} ${addNode.lastName}))
      //   click ${selectedNode.docId} callback`,
      // });
    }

    render() {
      // let chart = this.state.description;
      let chart = desc;
      console.log("chart");
      console.log(chart);
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
    <div>
      {/* {!start && (
        <div>
          <h1>Start to create your new family tree!</h1>
          <Button type="primary" onClick={handleClick}>
            Let's Go
          </Button>
        </div>
      )} */}
      {start && (
        <div className="flex-1 flex justify-end">
          <div className="justify-center h-full w-half">
            <h1>Family Tree</h1>
            {hasNode && <App />}
          </div>
          <div className=" bg-white w-half">
            <Toolbar />
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(TreeEditor);
