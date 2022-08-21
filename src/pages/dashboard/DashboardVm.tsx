/* eslint-disable no-return-assign */
import React, { useMemo } from 'react';
import { useVM } from '@src/hooks/useVM';
import { makeAutoObservable } from 'mobx';
import { RootStore, useStores } from '@src/stores';
import { TOKENS_LIST } from '@src/common/constants';

const ctx = React.createContext<ExploreVM | null>(null);

export const ExploreVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const store = useMemo(() => new ExploreVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useExploreVM = () => useVM(ctx);

class ExploreVM {
  public rootStore: RootStore;

  tokenNameFilter = '';

  setTokenNameFilter = (v: string) => (this.tokenNameFilter = v);

  tokenCategoryFilter = 0;

  setTokenCategoryFilter = (v: number) => (this.tokenCategoryFilter = v);

  tokenUserFilter = 0;

  setUserFilter = (v: number) => (this.tokenUserFilter = v);

  get assetsWithStats() {
    const { statisticsByAssetId } = this.rootStore.tokenStore;
    return TOKENS_LIST.filter(({ assetId }) => Object.keys(statisticsByAssetId).includes(assetId));
  }

  get top3Gainers() {
    return this.rootStore.tokenStore.statistics
      .slice()
      .sort((a, b) => (a.change24H.gt(b.change24H) ? -1 : 1))
      .slice(0, 3);
  }

  get top3Losers() {
    return this.rootStore.tokenStore.statistics
      .slice()
      .sort((a, b) => (a.change24H.gt(b.change24H) ? 1 : -1))
      .slice(0, 3);
  }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}
