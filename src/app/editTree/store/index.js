import { action, makeAutoObservable } from 'mobx';
class TreeStore {
  currentNode = "";
  generable = false;
  constructor() {
    makeAutoObservable(this);
  }

  setCurrentNode(str) {
    this.currentNode = str;
  }

  setGenerable(bool) {
    this.generable = bool;
  }


}
export const treeStore = new TreeStore();
