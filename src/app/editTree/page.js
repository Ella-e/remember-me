"use client"
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
  const [desc, setDesc] = useState("");
  const { addNode, generable, hasNode, setSelected, relation } = treeStore;
  const handleClick = () => {
    setStart(true);
  };

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.selected = "";
      this.state = {
        description: `graph LR
        ${addNode.docId}((${addNode.firstName} ${addNode.lastName}))
        click ${addNode.docId} callback`,
      };
      setDesc(this.state.description.toString());
      this.callBack = (e) => {
        console.log(e);
        if (!this.selected) {
          this.setState({
            description: desc.toString() + `\nstyle ${e} fill:#bbf`,
          });
          this.selected = e;
          setSelected(true);
          setSelectedNode(e);
          setDesc(this.state.description);
          //FIXME: have to click twice
        }
        else {
          this.setState({
            description: `${desc}
            style ${e} fill:#ECECFF`,
          });
          this.selected = "";
          setSelected(false);
        }
      };
    }

    refresh() {
      this.setState({
        description: desc + `\nstyle ${selectedNode.docId} fill:#ECECFF
        ${selectedNode.docId} --- ${addNode.docId}((${addNode.firstName} ${addNode.lastName}))
        click ${addNode.docId} callback`,
      });
    }

    render() {
      let chart = this.state.description;

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
            {hasNode &&
              <App />
            }
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
