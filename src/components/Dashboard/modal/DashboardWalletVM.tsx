/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-return-assign */
import React, { useMemo } from 'react';
import { useVM } from '@src/hooks/useVM';
import { makeAutoObservable, action } from 'mobx';
import { RootStore, useStores } from '@src/stores';
import copy from 'copy-to-clipboard';
import Balance from '@src/common/entities/Balance';
import { LOGIN_TYPE } from '@src/stores/AccountStore';
import centerEllipsis from '@src/common/utils/centerEllipsis';
import BN from '@src/common/utils/BN';
import wavesNodesService from '@src/common/services/wavesNodesService';
import { TOKENS_LIST, EXPLORER_URL } from '@src/common/constants';

const ctx = React.createContext<DashboardWalletVM | null>(null);

export const DashboardWalletUseVM = () => useVM(ctx);

class DashboardWalletVM {
  rootStore: RootStore;

  headerExpanded = true;

  setHeaderExpanded = (state: boolean) => (this.headerExpanded = state);

  // tokenToSend: Balance | null = null;
  // public setTokenToSend = (v: Balance) => (this.tokenToSend = v);

  assetsStats: Record<string, BN> | null = null;

  public setAssetsStats = (v: Record<string, BN>) => (this.assetsStats = v);

  supplyAmount: BN = BN.ZERO;

  borrowAmount: BN = BN.ZERO;

  repayAmount: BN = BN.ZERO;

  withdrawAmount: BN = BN.ZERO;

  @action.bound setSupplyAmount = (amount: BN) => {
    this.supplyAmount = amount;
  };

  @action.bound setBorrowAmount = (amount: BN) => (this.borrowAmount = amount);

  @action.bound setRepayAmount = (amount: BN) => (this.repayAmount = amount);

  @action.bound setWithdrawAmount = (amount: BN) => (this.withdrawAmount = amount);

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

  onCloseModal = () => {
    const { lendStore } = this.rootStore;
    lendStore.setDashboardModalOpened(false, '', lendStore.dashboardModalStep);
  };

  submitBorrow = async (amount: any, assetId: any, contractAddress: string) => {
    const { accountStore, lendStore, tokenStore, notificationStore } = this.rootStore;
    lendStore.setPreloader(true);
    console.log('submit uspply');

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [],
        call: {
          function: 'borrow',
          args: [
            { type: 'string', value: assetId },
            { type: 'integer', value: amount.toString() },
          ],
        },
      })
      .then((txId) => {
        lendStore.setDashboardModalOpened(false, '', 0);
        lendStore.setPreloader(false);
        txId &&
          notificationStore.notify(
            `Congrats, You successfully borrowed some money! You can track the transaction on Waves Explorer.`,
            {
              type: 'success',
              title: `Success`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: 'View on Explorer',
            }
          );
      })
      .catch((e) => {
        console.log(e, '---e');
        lendStore.setPreloader(false);
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: 'error',
          title: 'Oops, transaction is not completed',
        });
      })
      .then(async () => {
        await accountStore.updateAccountAssets(true);
        await tokenStore.syncTokenStatistics(lendStore.activePoolContract);
        lendStore.setPreloader(false);
      });
  };

  submitSupply = async (amount: any, assetId: any, contractAddress: string) => {
    const { accountStore, lendStore, tokenStore, notificationStore } = this.rootStore;
    lendStore.setPreloader(true);
    console.log('submit uspply');

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [
          {
            assetId,
            amount: amount.toString(),
          },
        ],
        call: {
          function: 'supply',
          args: [],
        },
      })
      .then((txId) => {
        lendStore.setDashboardModalOpened(false, '', 0);
        txId &&
          notificationStore.notify(
            `Congrats with successfull supply! You can track the transaction on Waves Explorer.`,
            {
              type: 'success',
              title: `Success`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: 'View on Explorer',
            }
          );
      })
      .catch((e) => {
        console.log(e, '---e');
        lendStore.setPreloader(false);
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: 'error',
          title: 'Oops, transaction is not completed',
        });
      })
      .then(async () => {
        await accountStore.updateAccountAssets(true);
        await tokenStore.syncTokenStatistics(lendStore.activePoolContract);
        lendStore.setPreloader(false);
      });
  };

  submitWithdraw = async (amount: any, assetId: any, contractAddress: string) => {
    const { accountStore, lendStore, tokenStore, notificationStore } = this.rootStore;
    lendStore.setPreloader(true);
    console.log(+amount, assetId, 'submitWithdraw');

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [],
        call: {
          function: 'withdraw',
          args: [
            { type: 'string', value: assetId },
            { type: 'integer', value: amount.toString() },
          ],
        },
      })
      .then((txId) => {
        lendStore.setDashboardModalOpened(false, '', 0);
        txId &&
          notificationStore.notify(
            `Congrats, it's successfull Withdraw! You can track the transaction on Waves Explorer.`,
            {
              type: 'success',
              title: `Success`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: 'View on Explorer',
            }
          );
      })
      .catch((e) => {
        console.log(e, '---e');
        lendStore.setPreloader(false);
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: 'error',
          title: 'Oops, transaction is not completed',
        });
      })
      .then(async () => {
        await accountStore.updateAccountAssets(true);
        await tokenStore.syncTokenStatistics(lendStore.activePoolContract);
        lendStore.setPreloader(false);
      });
  };

  submitRepay = async (amount: any, assetId: any, contractAddress: string) => {
    const { accountStore, lendStore, tokenStore, notificationStore } = this.rootStore;
    lendStore.setPreloader(true);

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [
          {
            assetId,
            amount: amount.toString(),
          },
        ],
        call: {
          function: 'repay',
          args: [],
        },
      })
      .then((txId) => {
        lendStore.setDashboardModalOpened(false, '', 0);
        txId &&
          notificationStore.notify(
            `Congrats, successfully Repaid you'r loan! You can track the transaction on Waves Explorer.`,
            {
              type: 'success',
              title: `Success`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: 'View on Explorer',
            }
          );
      })
      .catch((e) => {
        console.log(e, '---e');
        lendStore.setPreloader(false);
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: 'error',
          title: 'Oops, transaction is not completed',
        });
      })
      .then(async () => {
        await accountStore.updateAccountAssets(true);
        await tokenStore.syncTokenStatistics(lendStore.activePoolContract);
        lendStore.setPreloader(false);
      });
  };

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

  get signInInfo() {
    const { loginType, address } = this.rootStore.accountStore;
    return `${loginType === LOGIN_TYPE.KEEPER ? 'Keeper' : 'Signer'}: ${centerEllipsis(address ?? '', 6)}`;
  }

  get balances() {
    const { accountStore, lendStore } = this.rootStore;
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
    const balancesAmount = this.balances.reduce((acc, b) => acc.plus(b.usdnEquivalent ?? 0), BN.ZERO);
    return balancesAmount.plus(BN.ZERO).toFormat(2);
  }

  getAssetsStats = async () => {
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
    this.setAssetsStats(assetInfo);
  };
}

export const DashboardWalletVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new DashboardWalletVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};
