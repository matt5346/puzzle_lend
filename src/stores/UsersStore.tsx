/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-return-assign */
import RootStore from '@src/stores/RootStore';
import { makeAutoObservable } from 'mobx';
import {
  TOKENS_BY_ASSET_ID,
  TOKENS_LIST,
  LENDS_CONTRACTS,
  TTokenStatistics,
  ISerializedTokenStore,
  PoolDataType,
  IToken,
} from '@src/common/constants';
import wavesCapService from '@src/common/services/wavesCapService';
import BN from '@src/common/utils/BN';

export default class UsersStore {
  public rootStore: RootStore;

  initialized = false;

  statistics: Array<TTokenStatistics> = [];

  poolStatsArr: Array<PoolDataType> = [];

  netAPY = 0;

  userHealth = 0;

  supplyUserTotal = 0;

  borrowUserTotal = 0;

  poolTotal = 0;

  userCollateral = 0;

  usersStatsByPool: any = [];

  private setInitialized = (v: boolean) => (this.initialized = v);

  private setUsersPoolData = (poolStats: PoolDataType) => {
    console.log(poolStats, 'poolStats 1');
    const getPool = this.poolStatsArr.find((item) => item.contractId === poolStats.contractId);

    if (getPool) {
      this.poolStatsArr.forEach((item, key) => {
        item.contractId === poolStats.contractId ? Object.assign(this.poolStatsArr[key], poolStats) : null;
      });
    }

    if (!getPool) {
      this.poolStatsArr.push(poolStats);
    }
    console.log(this.poolStatsArr, 'this.poolStatsArr2');
  };

  private setUserHealth = (v: number) => {
    console.log('accountHealth', v);
    if (v > 100) {
      return 100;
    }

    if (v < 0) {
      return 0;
    }

    return +v.toFixed(2);
  };

  // get FULL POOL DATA by id, poolId: ...data
  get poolStatsByContractId(): Record<string, PoolDataType> {
    return this.poolStatsArr.reduce(
      (acc, stats) => ({ ...acc, [stats.contractId]: stats }),
      {} as Record<string, PoolDataType>
    );
  }

  // get ACTIVE POOL TOKENS without STATS
  get poolDataTokens(): IToken[] {
    const { lendStore } = this.rootStore;

    return TOKENS_LIST(lendStore.activePoolName).filter(({ assetId }) => {
      const poolData = this.poolStatsByContractId[lendStore.activePoolContract];

      if (poolData && poolData.tokens) {
        const tokensById = poolData.tokens.reduce(
          (acc, stats) => ({ ...acc, [stats.assetId]: stats }),
          {} as Record<string, TTokenStatistics>
        );

        return Object.keys(tokensById).includes(assetId);
      }

      return false;
    });
  }

  // get ACTIVE POOL TOKENS without STATS for userStats
  filterPoolDataTokens(contractId?: string): IToken[] {
    const { lendStore } = this.rootStore;

    return TOKENS_LIST(lendStore.activePoolName).filter(({ assetId }) => {
      const poolData = this.poolStatsByContractId[contractId || lendStore.activePoolContract];

      if (poolData && poolData.tokens) {
        const tokensById = poolData.tokens.reduce(
          (acc, stats) => ({ ...acc, [stats.assetId]: stats }),
          {} as Record<string, TTokenStatistics>
        );

        return Object.keys(tokensById).includes(assetId);
      }

      return false;
    });
  }

  // get POOL TOKENS STATS, with contractId
  filterPoolDataTokensStats(contractId: string): Record<string, TTokenStatistics> {
    let activePoolTokensWithStats: Record<string, TTokenStatistics>;
    const { lendStore } = this.rootStore;
    const poolName = lendStore.poolNameById(contractId);
    console.log(contractId, poolName, 'filterPoolDataTokensStats');

    TOKENS_LIST(poolName).forEach(() => {
      const poolData = this.poolStatsByContractId[contractId];
      console.log(poolData, this.poolStatsByContractId, 'poolData111');

      if (poolData && poolData.tokens) {
        const data = poolData.tokens.reduce(
          (acc, stats) => ({ ...acc, [stats.assetId]: stats }),
          {} as Record<string, TTokenStatistics>
        );
        console.log(data, 'data111');
        activePoolTokensWithStats = data;
      }
    });

    return activePoolTokensWithStats!;
  }

  // get ACTIVE POOL TOKENS with STATS
  get poolDataTokensWithStats(): Record<string, TTokenStatistics> {
    let activePoolTokensWithStats: Record<string, TTokenStatistics>;
    const { lendStore } = this.rootStore;

    TOKENS_LIST(lendStore.activePoolName).forEach(() => {
      const poolData = this.poolStatsByContractId[lendStore.activePoolContract];

      if (poolData && poolData.tokens) {
        const data = poolData.tokens.reduce(
          (acc, stats) => ({ ...acc, [stats.assetId]: stats }),
          {} as Record<string, TTokenStatistics>
        );
        activePoolTokensWithStats = data;
      }
    });

    return activePoolTokensWithStats!;
  }

  // for Users LIST page
  public loadBorrowSupplyUsers = async (contractId: string) => {
    const { accountStore, notificationStore, lendStore } = this.rootStore;
    const contractPoolId = contractId || lendStore.activePoolContract;
    const contractPoolName = lendStore.poolNameById(contractPoolId);
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

  // loading DATA for CUSTOM USER
  public syncTokenStatistics = async (contractId?: string, userId?: string): Promise<PoolDataType> => {
    console.log(this.poolStatsArr, 'syncTokenStatistics 1!');
    const { accountStore, lendStore } = this.rootStore;
    const contractPoolId = contractId || lendStore.activePoolContract;
    const contractPoolName = lendStore.poolNameById(contractPoolId);
    const assets = TOKENS_LIST(contractPoolName).map(({ assetId }) => assetId);
    console.log(contractPoolId, lendStore.activePoolContract, '------lendStore.activePoolContract');
    const userContract = userId || accountStore.address;

    const stats = await wavesCapService.getPoolsStats(assets, userContract!, contractPoolId).catch((e) => {
      // notifi\cationStore.notify(e.message ?? e.toString(), {
      //   type: 'error',
      // });
      console.log(e, 'getAssetsStats');
      return [];
    });

    // count pool Total
    let poolTotal = 0;

    // count net apy
    let supplyAmountApy = 0;
    let borrowedAmountApr = 0;

    // count current user Balance
    let supplyAmountCurrent = 0;
    let borrowedAmountCurrent = 0;

    let baseAmount = 0;
    let borrowCapacity = 0;
    let borrowCapacityUsed = 0;

    const statistics = stats.map((details: any) => {
      const asset = TOKENS_BY_ASSET_ID[details.id] ?? details.precision;
      const { decimals } = asset;
      const firstPrice = new BN(details.data?.['firstPrice_usd-n'] ?? 0);
      const currentPrice = new BN(details.data?.['lastPrice_usd-n'] ?? 0);

      const totalSupply = BN.formatUnits(details.totalSupply, decimals);
      const circulatingSupply = BN.formatUnits(details.circulating, decimals);

      const change24H = currentPrice.div(firstPrice).minus(1).times(100);
      const change24HUsd = change24H.div(100).times(currentPrice);

      const changePrefix = change24H?.gte(0) ? '+' : '-';
      const formatChange24HUsd = change24HUsd?.times(change24H?.gte(0) ? 1 : -1).toFormat(2);
      const formatChange24H = change24H?.times(change24H?.gte(0) ? 1 : -1).toFormat(2);
      const changeStr = `${changePrefix} $${formatChange24HUsd} (${formatChange24H}%)`;

      // pool Total
      poolTotal += (details.total_supply / 10 ** details.precision) * +currentPrice;

      // net APY
      supplyAmountApy += (details.self_supply / 10 ** details.precision) * +currentPrice * details.setup_supply_apy;
      borrowedAmountApr += (details.self_borrowed / 10 ** details.precision) * +currentPrice * details.setup_borrow_apr;
      baseAmount += (details.self_supply / 10 ** details.precision) * +currentPrice;

      // user Borrow/Supply Total
      supplyAmountCurrent += (details.self_supply / 10 ** details.precision) * +currentPrice;
      borrowedAmountCurrent += (details.self_borrowed / 10 ** details.precision) * +currentPrice;

      // count USER HEALTH for SAME ASSETS
      if (details.self_supply > 0) {
        borrowCapacity += (details.self_supply / 10 ** details.precision) * +currentPrice * (details.setup_ltv / 100);
      }

      if (details.self_borrowed > 0) {
        borrowCapacityUsed += (details.self_borrowed / 10 ** details.precision) * +currentPrice;
      }

      return {
        assetId: details.id,
        decimals,
        name: details.name,
        symbol: details.shortcode,
        totalSupply,
        setupLtv: details.setup_ltv,
        setupBorrowAPR: details.setup_borrow_apr,
        setupSupplyAPY: details.setup_supply_apy,
        selfSupply: BN.formatUnits(details.self_supply, 0),
        selfBorrow: BN.formatUnits(details.self_borrowed, 0),
        selfDailyIncome: details.self_daily_income,
        selfDailyBorrowInterest: details.self_daily_borrow_interest,
        supplyInterest: details.supply_interest,
        selfSupplyRate: details.supply_rate,
        totalAssetBorrow: BN.formatUnits(details.total_borrow, 0),
        totalAssetSupply: BN.formatUnits(details.total_supply, 0),
        circulatingSupply: BN.formatUnits(details.circulating, 0),
        change24H,
        change24HUsd,
        currentPrice,
        changeStr,
        fullyDilutedMC: totalSupply.times(currentPrice),
        marketCap: circulatingSupply.times(currentPrice),
        totalBurned: totalSupply.minus(circulatingSupply),
        volume24: new BN(details['24h_vol_usd-n']),
      };
    });

    const netAPY: number = (supplyAmountApy - borrowedAmountApr) / baseAmount;
    const accountHealth: number = (1 - borrowCapacityUsed / borrowCapacity) * 100;

    const poolData = {
      netAPY,
      userHealth: this.setUserHealth(accountHealth),
      supplyUserTotal: supplyAmountCurrent,
      borrowUserTotal: borrowedAmountCurrent,
      poolTotal,
      contractId: contractId || lendStore.activePoolContract,
      userCollateral: 0,
      tokens: statistics,
    };

    this.setUsersPoolData(poolData);
    return poolData;
  };

  constructor(rootStore: RootStore, initState?: ISerializedTokenStore) {
    this.rootStore = rootStore;
    Promise.all(Object.values(LENDS_CONTRACTS).map((item) => this.loadBorrowSupplyUsers(item))).then(() =>
      this.setInitialized(true)
    );
  }
}
