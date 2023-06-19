import { Button } from "antd";
import MermaidChart from "./Mermaid";
import React, { useState, useEffect } from "react";
import Toolbar from "./Toolbar";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";
import MermaidChartComponent from "./Mermaid";
import mermaid from "mermaid";

const TreeEditor = () => {
  const [start, setStart] = useState(false);
  const [useTool, setUseTool] = useState(false);
  const { currentNode, generable } = treeStore;
  const handleClick = () => {
    setStart(true);
  }

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        description: `graph TD
      add(("✚"))
      click add callback` };
      this.callBack = () => {
        setUseTool(true);
      }
    }

    refresh() {
      this.setState({
        description: `graph TD
        currentNode((${currentNode}))
        currentNode --- add(("✚"))
        click add callback`
      });
    }

    render() {
      let chart =
        this.state.description;

      return (
        <div className="App">
          <MermaidChartComponent chart={chart} callBack={this.callBack} />
          <Button type="primary" onClick={() => {
            this.refresh();
            // treeStore.setGenerable(false);
          }} disabled={!generable}>
            generate tree
          </Button>
        </div >
      );
    }
  }

  return (
    <div>
      {!start && (
        <div>
          <h1>Start to create your new family tree!</h1>
          <Button type="primary" onClick={handleClick}>
            Let's Go
          </Button></div>)}
      {start &&
        <div className="flex-1 min-h-0 flex justify-end">
          <App />
          {useTool && <div className="flex flex-col bg-white min-w-[248px] w-1/4">
            <Toolbar />
          </div>}
        </div>}
    </div>
  );
};

export default observer(TreeEditor);
