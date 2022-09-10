import { makeAutoObservable } from 'mobx';
import { ISerializedTokenStore } from '@src/common/constants';
import AccountStore, { ISerializedAccountStore } from '@src/stores/AccountStore';
import LendStore, { ISerializedLendStore } from '@src/stores/LendStore';
import TokenStore from '@src/stores/TokenStore';
import UsersStore from '@src/stores/UsersStore';
import NotificationStore from '@src/stores/NotificationStore';

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
  tokenStore?: ISerializedTokenStore;
  usersStore?: ISerializedTokenStore;
  lendStore?: ISerializedLendStore;
}

export default class RootStore {
  public accountStore: AccountStore;

  public lendStore: LendStore;

  public tokenStore: TokenStore;

  public usersStore: UsersStore;

  public notificationStore: NotificationStore;

  constructor(initState?: ISerializedRootStore) {
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.lendStore = new LendStore(this, initState?.lendStore);
    this.tokenStore = new TokenStore(this, initState?.tokenStore);
    this.usersStore = new UsersStore(this, initState?.usersStore);
    this.notificationStore = new NotificationStore(this);
    makeAutoObservable(this);
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
  });
}
