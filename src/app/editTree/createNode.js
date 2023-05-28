import React,{useState} from 'react';

const TreeEditor = () => {
    const [newNode, setNode] = React.useState(false);
    const [nodeName, setNodeName] = useState('');
    const handleNodeNameChange = (e) => {
    setNodeName(e.target.value);
};

    const handleCreateNode = () => {
    //upload to db
    setNodeName('');
    setNode(false);
  };

  return (
    <div>
       { !newNode && (
        <button //TODO: change to antd
          onClick={() => setNode(true)}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Add member
        </button>)}
        {newNode && (
            <div>
              <input
                type="text"
                placeholder="Name"
                value={nodeName}
                onChange={handleNodeNameChange}
                className="w-full p-2 mb-2 border border-gray-400 rounded"
              />
              <button
                onClick={handleCreateNode}
                className="w-full p-2 bg-blue-500 text-white rounded"
              >
                Create new member
              </button>
            </div>
          )}
      </div>
    );
  };
  
  export default TreeEditor;