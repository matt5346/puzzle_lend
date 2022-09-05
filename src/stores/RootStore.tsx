import { makeAutoObservable } from 'mobx';
import { ISerializedTokenStore } from '@src/common/constants';
import AccountStore, { ISerializedAccountStore } from '@src/stores/AccountStore';
import LendStore, { ISerializedLendStore } from '@src/stores/LendStore';
import TokenStore from '@src/stores/TokenStore';
import PoolsStore, { ISerializedPoolsStore } from '@src/stores/PoolsStore';
import NotificationStore from '@src/stores/NotificationStore';

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
  tokenStore?: ISerializedTokenStore;
  poolsStore?: ISerializedPoolsStore;
  lendStore?: ISerializedLendStore;
}

export default class RootStore {
  public accountStore: AccountStore;

  public poolsStore: PoolsStore;

  public lendStore: LendStore;

  public tokenStore: TokenStore;

  public notificationStore: NotificationStore;

  constructor(initState?: ISerializedRootStore) {
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.poolsStore = new PoolsStore(this, initState?.poolsStore);
    this.lendStore = new LendStore(this, initState?.lendStore);
    this.tokenStore = new TokenStore(this, initState?.tokenStore);
    this.notificationStore = new NotificationStore(this);
    makeAutoObservable(this);
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
  });
}
