/* eslint-disable no-return-assign */
import RootStore from '@src/stores/RootStore';
import { makeAutoObservable, reaction, action } from 'mobx';
import { LENDS_CONTRACTS, TTokenStatistics, createITokenStat } from '@src/common/constants';

export interface ISerializedLendStore {
  watchList: string[];
}

export default class LendStore {
  public rootStore: RootStore;

  constructor(rootStore: RootStore, initState?: ISerializedLendStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.watchList = initState?.watchList ?? [];
  }

  serialize = (): ISerializedLendStore => ({
    watchList: this.watchList,
  });

  public watchList: string[];

  dashboardModalOpened = false;

  dashboardModalStep = 0;

  activePoolContract = LENDS_CONTRACTS.wavesPool;

  get activePoolName(): string {
    let poolName: any =
      Object.entries(LENDS_CONTRACTS).filter(([key, value]) => {
        return value === this.activePoolContract ? key : false;
      })[0] || 'mainPool';

    // eslint-disable-next-line prefer-destructuring
    if (poolName && poolName.length) poolName = poolName[0];

    return poolName;
  }

  choosenToken: TTokenStatistics = createITokenStat();

  poolNameById = (contractId?: string) => {
    let poolName: any =
      Object.entries(LENDS_CONTRACTS).filter(([key, value]) => {
        return value === contractId ? key : false;
      })[0] || 'mainPool';

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

  @action.bound setDashboardModalOpened = (state: boolean, id: string, step: number) => {
    const { tokenStore } = this.rootStore;

    this.dashboardModalOpened = state;
    const token = tokenStore.poolDataTokensWithStats[id];
    this.dashboardModalStep = step;
    this.choosenToken = token;
  };
}
