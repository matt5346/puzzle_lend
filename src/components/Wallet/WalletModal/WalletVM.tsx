/* eslint-disable no-return-assign */
import React, { useMemo } from 'react';
import { useVM } from '@src/hooks/useVM';
import { makeAutoObservable, reaction, when } from 'mobx';
import { RootStore, useStores } from '@src/stores';
import copy from 'copy-to-clipboard';
import Balance from '@src/common/entities/Balance';
import { LOGIN_TYPE } from '@src/stores/AccountStore';
import centerEllipsis from '@src/common/utils/centerEllipsis';
import BN from '@src/common/utils/BN';
import wavesNodesService from '@src/common/services/wavesNodesService';
import { ROUTES, TOKENS_LIST, IToken } from '@src/common/constants';

const ctx = React.createContext<WalletVM | null>(null);

export const useWalletVM = () => useVM(ctx);

class WalletVM {
  rootStore: RootStore;

  headerExpanded = true;

  setHeaderExpanded = (state: boolean) => (this.headerExpanded = state);

  // tokenToSend: Balance | null = null;
  // public setTokenToSend = (v: Balance) => (this.tokenToSend = v);

  balanceAssetsStats: Record<string, BN> | null = null;

  public setBalanceAssetsStats = (v: Record<string, BN>) => (this.balanceAssetsStats = v);

  assetsStats: IToken[] | [] = [];

  public setAssetsStats = (v: IToken[]) => (this.assetsStats = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    when(() => this.rootStore.accountStore.assetBalances != null, this.getAssetsStats);
    reaction(() => this.rootStore.accountStore?.address, this.getAssetsStats);
    setInterval(this.getAssetsStats, 60 * 1000);
  }

  handleCopyAddress = () => {
    const { accountStore } = this.rootStore;
    if (accountStore.address) {
      copy(accountStore.address ?? '');
      // notificationStore.notify("Your address was copied", {
      //   type: "success",
      //   title: "Congratulations!",
      // });
    } else {
      // notificationStore.notify('There is no address', { type: 'error' });
    }
  };

  handleLogOut = async () =>
    Promise.all([
      this.rootStore.accountStore.setWalletModalOpened(false),
      this.rootStore.accountStore.setAssetBalances(null),
      this.rootStore.accountStore.setAddress(null),
      this.rootStore.accountStore.setLoginType(null),
    ]);

  get signInInfo() {
    const { loginType, address } = this.rootStore.accountStore;
    return `${loginType === LOGIN_TYPE.KEEPER ? 'Keeper' : 'Signer'}: ${centerEllipsis(address ?? '', 6)}`;
  }

  get balances() {
    const { accountStore } = this.rootStore;
    return TOKENS_LIST('allTokens')
      .map((t) => {
        const balance = accountStore.findBalanceByAssetId(t.assetId);
        return balance ?? new Balance(t);
      })
      .filter(({ balance }) => balance && !balance.eq(0))
      .sort((a, b) => {
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
        if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
        return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
      });
  }

  get totalInvestmentAmount() {
    const { tokenStore } = this.rootStore;

    const balancesAmount = this.balances.reduce((acc: any, b) => {
      const stats = tokenStore.poolDataTokensWithStats[b.assetId];

      tokenStore.usdnRate(b.assetId);

      return BN.formatUnits(b?.balance || BN.ZERO, b.decimals)
        .times(stats?.minPrice)
        .plus(acc);
    }, BN.ZERO);

    return balancesAmount.toFixed(4);
  }

  getAssetsStats = async () => {
    const { tokenStore } = this.rootStore;
    const poolsData = tokenStore.poolDataTokens;
    this.setAssetsStats(poolsData);
  };

  getBalanceAssetsStats = async () => {
    if (this.balances.length === 0) return;
    const topAssets = this.balances.slice(0, 10).reduce<string[]>((acc, v) => [...acc, v.assetId], []);
    const responses = await wavesNodesService.getAssetsStats(topAssets);
    const assetInfo = responses.reduce<Record<string, BN>>((acc, value) => {
      if (value == null) return acc;
      const firstPrice = new BN(value.data?.['firstPrice_usd-n'] ?? 0);
      const lastPrice = new BN(value.data?.['lastPrice_usd-n'] ?? 0);
      const rate = lastPrice.div(firstPrice).minus(1).times(100);
      return { ...acc, [value.id]: rate };
    }, {});
    this.setBalanceAssetsStats(assetInfo);
  };
}

export const WalletVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new WalletVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};
