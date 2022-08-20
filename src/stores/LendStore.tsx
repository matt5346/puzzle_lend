import RootStore from "@src/stores/RootStore";
import { makeAutoObservable, reaction } from "mobx";

export default class LendStore {
  public rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    reaction(
      () => this.rootStore.accountStore.address,
      () => console.log('REACTOPN')
    );
  }
}
