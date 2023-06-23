import { Button } from "antd";
import MermaidChart from "./Mermaid";
import React, { useEffect, useState } from "react";
import Toolbar from "./Toolbar";
import mermaid from "mermaid";

const ViewTree = () => {
  //TODO: add fontawesome

  const chartDefinition = `
graph TD
subgraph Grandparents[ ]
      Grandfather((Grandfather)) === Grandmother((Grandmother))
  end

  subgraph Parents[ ]
      direction RL
      Father((Father)) === Mother((Mother))
  end

  subgraph Siblings[ ]
      Brother((Brother)) -.- Sister((Sister))
  end

  subgraph UncleAunt[ ]
      direction RL
      Uncle((Uncle)) === Aunt((Aunt))
  end

  subgraph Cousins[ ]
      Cousin1((Cousin1)) -.- Cousin2((Cousin2)) -.- Cousin3((Cousin3))
  end

  Grandparents --- Parents
  Grandparents --- UncleAunt
  Parents --- Siblings
  UncleAunt --- Cousins
`;

  const testContent = `
  graph TD
  subgraph Layer1[ ]
  direction LR
    Father((Father)) --- B((B))
  end
  `;

  useEffect(() => {
    const clickOnNode = () => {
      console.log("node clicked");
    };
    window.addEventListener("graphDiv", clickOnNode);
    return () => {
      window.removeEventListener("graphDiv", clickOnNode);
    };
  }, []);

  // Example of using the bindFunctions
  const drawDiagram = async function () {
    const element = document.querySelector(".graphDiv");
    // const graphDefinition = "graph TB\na-->b";
    const graphDefinition = testContent;
    const { svg, bindFunctions } = await mermaid.render(
      "graphDiv",
      graphDefinition
    );
    element.innerHTML = svg;
    // This can also be written as `bindFunctions?.(element);` using the `?` shorthand.
    console.log(bindFunctions);
    if (bindFunctions) {
      console.log("run Bind function");
      bindFunctions(element);
    }
  };

  return (
    <div className="graphDiv">
      {/* <MermaidChart chartDefinition={testContent} callBack={undefined} /> */}
      <button onClick={drawDiagram}>draw</button>
    </div>
  );
};

export default ViewTree;
