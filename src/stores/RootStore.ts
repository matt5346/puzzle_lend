import { makeAutoObservable } from 'mobx';
import AccountStore, { ISerializedAccountStore } from '@src/stores/AccountStore';
import LendStore from '@src/stores/LendStore';

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
}

export default class RootStore {
  public accountStore: AccountStore;

  public lendStore: LendStore;

  constructor(initState?: ISerializedRootStore) {
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.lendStore = new LendStore(this);
    makeAutoObservable(this);
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
  });
}
