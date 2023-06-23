import { action, makeAutoObservable } from 'mobx';
class TreeStore {
  addNode = null;
  generable = false;
  hasNode = false;//FIXME: move
  callback = "";
  selected = false;
  relation = "";
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
  }
  setCallBack = (str) => {
    this.callback = str;
  }
  setRelation = (str) => {
    this.relation = str;
  }

  setSelected = (bool) => {
    this.selected = bool;
  }

}
export const treeStore = new TreeStore();
