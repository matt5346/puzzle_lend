import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@src/stores";
import copy from "copy-to-clipboard";
import Balance from "@src/common/entities/Balance";
import { LOGIN_TYPE } from "@src/stores/AccountStore";
import centerEllipsis from "@src/common/utils/centerEllipsis";
import BN from "@src/common/utils/BN";
import wavesCapService from "@src/services/wavesCapService";
import { ROUTES, TOKENS_LIST } from "@src/common/constants";

const ctx = React.createContext<WalletVM | null>(null);

export const WalletVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new WalletVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useWalletVM = () => useVM(ctx);

class WalletVM {
  rootStore: RootStore;

  headerExpanded: boolean = true;
  setHeaderExpanded = (state: boolean) => (this.headerExpanded = state);

  // tokenToSend: Balance | null = null;
  // public setTokenToSend = (v: Balance) => (this.tokenToSend = v);

  assetsStats: Record<string, BN> | null = null;
  public setAssetsStats = (v: Record<string, BN>) => (this.assetsStats = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.getAssetsStats();
    makeAutoObservable(this);
    // when(
    //   () => this.rootStore.accountStore.assetBalances != null,
    //   this.getAssetsStats
    // );
    // reaction(() => this.rootStore.accountStore?.address, this.getAssetsStats);
    setInterval(this.getAssetsStats, 15 * 1000);
  }

  handleCopyAddress = () => {
    console.log('copy')
    // const { accountStore, notificationStore } = this.rootStore;
    // if (accountStore.address) {
    //   copy(accountStore.address ?? "");
    //   // notificationStore.notify("Your address was copied", {
    //   //   type: "success",
    //   //   title: "Congratulations!",
    //   // });
    // } else {
    //   notificationStore.notify("There is no address", { type: "error" });
    // }
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
    return `${
      loginType === LOGIN_TYPE.KEEPER ? "Keeper" : "Signer"
    }: ${centerEllipsis(address ?? "", 6)}`;
  }

  get balances() {
    const { accountStore } = this.rootStore;
    return TOKENS_LIST.map((t) => {
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
    const balancesAmount = this.balances.reduce(
      (acc, b) => acc.plus(b.usdnEquivalent ?? 0),
      BN.ZERO
    );
    return balancesAmount.plus(BN.ZERO).toFormat(2);
  }

  getAssetsStats = async () => {
    if (this.balances.length === 0) return;
    const topAssets = this.balances
      .slice(0, 10)
      .reduce<string[]>((acc, v) => [...acc, v.assetId], []);
    const responses = await wavesCapService.getAssetsStats(topAssets);
    const assetInfo = responses.reduce<Record<string, BN>>((acc, value) => {
      if (value == null) return acc;
      const firstPrice = new BN(value.data?.["firstPrice_usd-n"] ?? 0);
      const lastPrice = new BN(value.data?.["lastPrice_usd-n"] ?? 0);
      let rate = lastPrice.div(firstPrice).minus(1).times(100);
      return { ...acc, [value.id]: rate };
    }, {});
    this.setAssetsStats(assetInfo);
  };
}
