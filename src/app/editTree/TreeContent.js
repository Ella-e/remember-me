import { Button, Input } from "antd";
import React, { useState, useEffect } from "react";
const TreeContent = () => {
  const [editNode, setEditNode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const handleAddMember = () => {
    //TODO: update db
    setEditNode(false);
  }
  useEffect(() => {
    //TODO: get member list
  }, []);

  return <div>
    {!editNode && <div><h1>Add New Member</h1>
      <Button type="primary" onClick={() => setEditNode(true)}>
        Add Member
      </Button>
      <h1>Edit Member</h1></div >
    }
    {
      editNode && <div className="border-line-[#E4E6F0] rounded-2xl leading-5 overflow-auto h-[189px] mb-[26px]">
        <h1>First Name</h1>
        <Input.TextArea
          value={firstName}
          className="px-4 py-2 outline-none resize-none !h-full !border-none flex"
          onChange={e => setFirstName(e.target.value)}
        // placeholder=""
        ></Input.TextArea>
        <h1>Last Name</h1>
        <Input.TextArea
          value={lastName}
          className="px-4 py-2 outline-none resize-none !h-full !border-none flex"
          onChange={e => setLastName(e.target.value)}
        // placeholder=""
        ></Input.TextArea>
        <Button type="primary" onClick={handleAddMember}>
          Add Member
        </Button>
      </div>
    }
  </div >
    ;
};

export default TreeContent;
