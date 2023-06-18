import { action, makeAutoObservable } from 'mobx';
class TreeStore {
  currentNode = "";
  constructor() {
    makeAutoObservable(this);
  }

  setCurrentNode(str) {
    this.currentNode = str;
    console.log(str);
  }


}
export const treeStore = new TreeStore();
