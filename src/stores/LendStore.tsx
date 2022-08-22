/* eslint-disable no-return-assign */
import RootStore from '@src/stores/RootStore';
import { makeAutoObservable, reaction, action } from 'mobx';
import BN from '@src/common/utils/BN';

export type TTokenStatistics = {
  assetId: string;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: BN;
  circulatingSupply: BN;
  totalBurned: BN;
  fullyDilutedMC: BN;
  marketCap: BN;
  currentPrice: BN;
  change24H: BN;
  change24HUsd: BN;
  volume24: BN;
  changeStr: string;
};

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

  choosenToken: TTokenStatistics = {
    assetId: '',
    decimals: 0,
    name: '',
    symbol: '',
    totalSupply: new BN(0),
    circulatingSupply: new BN(0),
    totalBurned: new BN(0),
    fullyDilutedMC: new BN(0),
    marketCap: new BN(0),
    currentPrice: new BN(0),
    change24H: new BN(0),
    change24HUsd: new BN(0),
    volume24: new BN(0),
    changeStr: '',
  };

  @action.bound setDashboardModalOpened = (state: boolean, id: string) => {
    const { tokenStore } = this.rootStore;

    this.dashboardModalOpened = state;
    const token = tokenStore.statisticsByAssetId[id];
    this.choosenToken = token;
  };
}
