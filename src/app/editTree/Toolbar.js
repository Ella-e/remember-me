import { Button } from 'antd';
import React from 'react';
import { observer } from "mobx-react-lite";
import { treeStore } from './store';

const Toolbar = () => {
  const handleClick = () => {
    treeStore.setCurrentNode("test");
    treeStore.setGenerable(true);
  }
  return (
    <div className="flex flex-col justify-center px-[32px] py-6 parent-full flex-grow">
      <div className="flex justify-between items-center">
        <div className="font-bold text-[22px]">
          Choose Member
        </div>
        <Button type="primary" onClick={handleClick}>
          Choose
        </Button>
      </div>
    </div>
  );
};

export default observer(Toolbar);
