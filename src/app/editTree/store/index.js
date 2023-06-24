import { action, makeAutoObservable } from "mobx";
class TreeStore {
  generable = false;
  hasNode = false; //FIXME: move
  onRootNode = false;
  callback = "";
  selected = false;
  relation = "Partner";
  description = "";

  constructor() {
    makeAutoObservable(this);
  }

  setGenerable(bool) {
    this.generable = bool;
  }

  setHasNode = (bool) => {
    this.hasNode = bool;
  };

  setOnRootNode = (bool) => {
    this.onRootNode = bool;
  };

  setCallBack = (str) => {
    this.callback = str;
  };

  setRelation = (str) => {
    this.relation = str;
    console.log(this.relation);
  };

  setSelected = (bool) => {
    this.selected = bool;
  };

  setDescription = (str) => {
    this.description = str;
  };
}
export const treeStore = new TreeStore();
