/* eslint-disable no-return-assign */
import React, { useMemo } from 'react';
import { useVM } from '@src/hooks/useVM';
import { makeAutoObservable } from 'mobx';
import { RootStore, useStores } from '@src/stores';

const ctx = React.createContext<DashboardVM | null>(null);

export const DashboardVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const store = useMemo(() => new DashboardVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useDashboardVM = () => useVM(ctx);

class DashboardVM {
  public rootStore: RootStore;

  tokenNameFilter = '';

  setTokenNameFilter = (v: string) => (this.tokenNameFilter = v);

  tokenCategoryFilter = 0;

  setTokenCategoryFilter = (v: number) => (this.tokenCategoryFilter = v);

  tokenUserFilter = 0;

  setUserFilter = (v: number) => (this.tokenUserFilter = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}
