import { makeAutoObservable } from "mobx";
class TreeStore {
  generable = false;
  hasNode = false;
  onRootNode = false;
  callback = "";
  selected = false;
  relation = "Partner";
  description = "";
  refreshMemberList = false;
  nodeInTree = null;
  unchoose = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUnchoose = (member) => {
    this.unchoose = member;
  };

  setNodeInTree = (node) => {
    this.nodeInTree = node;
  };

  setRefreshMemberList = (bool) => {
    this.refreshMemberList = bool;
  };

  setGenerable = (bool) => {
    this.generable = bool;
  };

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
  };

  setSelected = (bool) => {
    this.selected = bool;
  };

  setDescription = (str) => {
    this.description = str;
  };
}
export const treeStore = new TreeStore();
