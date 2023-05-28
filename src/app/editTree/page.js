import FamilyTree from './tree';
import TreeEditor from './createNode';
const EditTree = () => {
        return (
          <div className="flex">
            <div className="w-3/4 p-4">
              <FamilyTree />
            </div>
            <div className="w-1/4 p-4">
              <TreeEditor />
            </div>
          </div>
        );

};

export default EditTree;