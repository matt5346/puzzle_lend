/* eslint-disable no-return-assign */
import RootStore from '@src/stores/RootStore';
import { makeAutoObservable, reaction, action } from 'mobx';
import BN from '@src/common/utils/BN';
import { TTokenStatistics } from '@src/stores/TokenStore';

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

  dashboardModalOpened = false;

  dashboardModalStep = 0;

  choosenToken: TTokenStatistics = {
    assetId: '',
    decimals: 0,
    name: '',
    symbol: '',
    totalSupply: BN.ZERO,
    circulatingSupply: BN.ZERO,
    totalBurned: BN.ZERO,
    fullyDilutedMC: BN.ZERO,
    marketCap: BN.ZERO,
    currentPrice: BN.ZERO,
    change24H: BN.ZERO,
    change24HUsd: BN.ZERO,
    volume24: BN.ZERO,
    changeStr: '',
    setupLtv: '',
    setupBorrowAPR: '',
    setupSupplyAPY: '',
    selfSupply: BN.ZERO,
    selfBorrow: BN.ZERO,
    selfSupplyRate: '',
    totalPoolSupply: BN.ZERO,
    totalPoolBorrow: BN.ZERO,
  };

  @action.bound setModalStep = (step: number) => {
    this.dashboardModalStep = step;
  };

  @action.bound setDashboardModalOpened = (state: boolean, id: string, step: number) => {
    const { tokenStore } = this.rootStore;

    this.dashboardModalOpened = state;
    const token = tokenStore.statisticsByAssetId[id];
    this.dashboardModalStep = step;
    this.choosenToken = token;
  };
}
