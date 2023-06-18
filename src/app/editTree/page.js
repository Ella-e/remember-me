import { Button } from "antd";
import MermaidChart from "./Mermaid";
import React, { useState, useEffect } from "react";
import Toolbar from "./Toolbar";
import { observer } from "mobx-react-lite";
import { treeStore } from "./store";

const TreeEditor = () => {
  const [start, setStart] = useState(false);
  const [useTool, setUseTool] = useState(false);
  const [chartDefinition, setChartDefinition] = useState(`graph TD
  add(("✚"))
  click add callback`);
  const { currentNode } = treeStore;
  const handleClick = () => {
    setStart(true);
  }

  useEffect(() => {
    if (currentNode) {
      //TODO: add a node + re-render
    }
  }, [currentNode]);

  // `${chartDefinition} ${currentNode} --- [${currentNode}]`

  const callBack = () => setUseTool(true);

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
          <MermaidChart chartDefinition={chartDefinition} callBack={callBack} />
          {useTool && <div className="flex flex-col bg-white min-w-[248px] w-1/4">
            <Toolbar />
          </div>}
        </div>}
    </div>
  );
};

export default observer(TreeEditor);
