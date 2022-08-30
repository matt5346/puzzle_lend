import { makeAutoObservable } from 'mobx';
import AccountStore, { ISerializedAccountStore } from '@src/stores/AccountStore';
import LendStore from '@src/stores/LendStore';
import TokenStore from '@src/stores/TokenStore';
import { ISerializedTokenStore } from '@src/common/constants';
import PoolsStore, { ISerializedPoolsStore } from '@src/stores/PoolsStore';

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
  tokenStore?: ISerializedTokenStore;
  poolsStore?: ISerializedPoolsStore;
}

export default class RootStore {
  public accountStore: AccountStore;

  public poolsStore: PoolsStore;

  public tokenStore: TokenStore;

  public lendStore: LendStore;

  constructor(initState?: ISerializedRootStore) {
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.poolsStore = new PoolsStore(this, initState?.poolsStore);
    this.tokenStore = new TokenStore(this, initState?.tokenStore);
    this.lendStore = new LendStore(this);
    makeAutoObservable(this);
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
  });
}
