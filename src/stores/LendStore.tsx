/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-return-assign */
import RootStore from '@src/stores/RootStore';
import { makeAutoObservable, reaction, action } from 'mobx';
import { LENDS_CONTRACTS, TTokenStatistics, createITokenStat, poolsTitles, TOKENS_LIST } from '@src/common/constants';
import wavesCapService from '@src/common/services/wavesCapService';

export interface ISerializedLendStore {
  watchList: string[];
}

export default class LendStore {
  public rootStore: RootStore;

  constructor(rootStore: RootStore, initState?: ISerializedLendStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
    this.setActivePoolOnLoad();
    Object.values(LENDS_CONTRACTS).map((item) => this.loadBorrowSupplyUsers(item));
    this.watchList = initState?.watchList ?? [];
  }

  serialize = (): ISerializedLendStore => ({
    watchList: this.watchList,
  });

  public watchList: string[];

  dashboardModalOpened = false;

  usersStatsByPool: any = [];

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
    if (poolName && poolName.length) {
      console.log(poolName, '-------poolName[0]=====');
      // eslint-disable-next-line prefer-destructuring
      poolName = poolName[0];
    }

    return poolName;
  };

  // for Users LIST page
  public loadBorrowSupplyUsers = async (contractId: string) => {
    const { accountStore, notificationStore } = this.rootStore;
    const contractPoolId = contractId || this.activePoolContract;
    const contractPoolName = this.poolNameById(contractPoolId);
    const assets = TOKENS_LIST(contractPoolName).map(({ assetId }) => assetId);

    let stats = null;
    if (accountStore.address) {
      stats = await wavesCapService.getBorrowSupplyUsers(contractId, assets).catch((e) => {
        notificationStore.notify(e.message ?? e.toString(), {
          type: 'error',
        });
        console.log(e, 'getAssetsStats');
        return [];
      });
    }
    const userData = {
      contractId: contractPoolId,
      tokens: stats,
    };

    console.log(userData, '==stat==');
    this.setUsersStats(userData);
  };

  private setUsersStats = (userStats: any) => {
    console.log(userStats, 'poolStats 1');
    const getPool = this.usersStatsByPool.find((item: any) => item.contractId === userStats.contractId);

    if (getPool) {
      this.usersStatsByPool.forEach((item: any, key: any) => {
        item.contractId === userStats.contractId ? Object.assign(this.usersStatsByPool[key], userStats) : null;
      });
    }

    if (!getPool) {
      this.usersStatsByPool.push(userStats);
    }
    console.log(this.usersStatsByPool, 'this.usersStatsByPool');
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
