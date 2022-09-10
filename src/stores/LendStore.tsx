/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-return-assign */
import RootStore from '@src/stores/RootStore';
import { makeAutoObservable, reaction, action } from 'mobx';
import { LENDS_CONTRACTS, TTokenStatistics, createITokenStat, poolsTitles, TOKENS_LIST } from '@src/common/constants';

export interface ISerializedLendStore {
  watchList: string[];
}

export default class LendStore {
  public rootStore: RootStore;

  constructor(rootStore: RootStore, initState?: ISerializedLendStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
    this.setActivePoolOnLoad();
    this.watchList = initState?.watchList ?? [];
  }

  serialize = (): ISerializedLendStore => ({
    watchList: this.watchList,
  });

  public watchList: string[];

  dashboardModalOpened = false;

  dashboardModalStep = 0;

  activePoolContract = '';

  get activePoolName(): string {
    let poolName: any = Object.entries(LENDS_CONTRACTS).filter(([key, value]) => {
      return value === this.activePoolContract ? key : false;
    })[0] || ['mainPool'];

    // eslint-disable-next-line prefer-destructuring
    if (poolName && poolName.length) poolName = poolName[0];

    return poolName;
  }

  get activePoolTitle(): string {
    const object = Object.entries(poolsTitles).filter(([key, value]) => {
      return key === this.activePoolName ? value : false;
    })[0];

    return object ? object[1] : '';
  }

  choosenToken: TTokenStatistics = createITokenStat();

  poolNameById = (contractId?: string) => {
    let poolName: any = Object.entries(LENDS_CONTRACTS).filter(([key, value]) => {
      return value === contractId ? key : false;
    })[0] || ['mainPool'];

    // eslint-disable-next-line prefer-destructuring
    if (poolName && poolName.length) poolName = poolName[0];

    return poolName;
  };

  @action.bound setModalStep = (step: number) => {
    this.dashboardModalStep = step;
  };

  @action.bound setActivePool = (pool: string) => {
    this.activePoolContract = pool;
  };

  // todo: remake on more optimal way for retrieving id on LOAD
  @action.bound setActivePoolOnLoad = () => {
    const url = window.location.toString();
    const params = url?.split('/');
    let poolId = '';

    if (params[params.length - 2] === 'pool') poolId = params[params.length - 1];
    this.activePoolContract = poolId || LENDS_CONTRACTS.mainPool;
  };

  @action.bound setDashboardModalOpened = (state: boolean, id: string, step: number) => {
    const { tokenStore } = this.rootStore;

    this.dashboardModalOpened = state;
    const token = tokenStore.poolDataTokensWithStats[id];
    this.dashboardModalStep = step;
    this.choosenToken = token;
  };
}
