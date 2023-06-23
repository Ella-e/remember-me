import { action, makeAutoObservable } from "mobx";
class TreeStore {
  addNode = null;
  generable = false;
  hasNode = false; //FIXME: move
  callback = "";
  selected = false;
  relation = "";
  description = "graph LR";

  constructor() {
    makeAutoObservable(this);
  }

  setAddNode(node) {
    this.addNode = node;
  }

  setGenerable(bool) {
    this.generable = bool;
  }

  setHasNode = (bool) => {
    this.hasNode = bool;
  };

  setCallBack = (str) => {
    this.callback = str;
  };

  setRelation = (str) => {
    this.relation = str;
  };

  setSelected = (bool) => {
    this.selected = bool;
  };

  setDescription = (str) => {
    this.description = str;
  };
}
export const treeStore = new TreeStore();
