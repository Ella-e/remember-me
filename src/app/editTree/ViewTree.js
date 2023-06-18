import { Button } from "antd";
import MermaidChart from "./Mermaid";
import React, { useState } from "react";
import Toolbar from "./Toolbar";

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
  return <div><MermaidChart chartDefinition={chartDefinition} callBack={undefined} /></div>
};

export default ViewTree;
