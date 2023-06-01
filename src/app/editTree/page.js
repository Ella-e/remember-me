import FamilyTree from './tree';
import TreeEditor from './createNode';
import React from 'react';
import { Layout } from 'antd';

const { Header, Content } = Layout;

const EditTree = () => {
  return (
    <Layout className=" bg-white h-screen flex flex-1">
      <div className="relative parent-full">
        <div className="w-3/4 p-4 h-full">
          {<FamilyTree />}
        </div>
        <div className="absolute t-0 r-0 w-1/4 p-4">
          <TreeEditor />
        </div>
      </div>
    </Layout>
  );

};

export default EditTree;