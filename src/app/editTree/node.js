import React from 'react';

const Node = ({ id, name, children }) => {
  const renderChildren = () => {
    return children.map((childId) => (
      <Node name={`Child ${childId}`} children={[]}
      //   avatar={node.avatar} 
      />
    ));
  };

  return (
    <div className="p-2 m-2 bg-gray-200 rounded">
      <div className="text-lg font-bold">{name}</div>
      {renderChildren()}
    </div>
  );
};

export default Node;