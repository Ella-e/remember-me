import React from 'react';
import Node from './node';

//get data
const familyData = [
  { id: 1, name: 'M', children: [2, 3] },
];

const FamilyTree = () => {
  const renderNodes = (nodes) => {
    return nodes.map((node, index) => (
      <Node name={node.name} children={node.children} id={index} />
    ));
  };

  return <div className="flex flex-col items-center">{renderNodes(familyData)}</div>; //layout
};

export default FamilyTree;