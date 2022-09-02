/* eslint-disable no-return-assign */
import RootStore from '@src/stores/RootStore';
import { makeAutoObservable, reaction, action } from 'mobx';
import BN from '@src/common/utils/BN';
import { TTokenStatistics, createITokenStat } from '@src/common/constants';

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

  choosenToken: TTokenStatistics = createITokenStat();

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
