/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-return-assign */
import RootStore from '@src/stores/RootStore';
import { makeAutoObservable, action } from 'mobx';
import {
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
  TOKENS_LIST,
  LENDS_CONTRACTS,
  TTokenStatistics,
  ISerializedTokenStore,
  PoolDataType,
  IToken,
  POOL_CONFIG,
} from '@src/common/constants';
import wavesNodesService from '@src/common/services/wavesNodesService';
import Pool from '@src/common/entities/Pool';
import BN from '@src/common/utils/BN';

export default class TokenStore {
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

  pools: Pool[] = [];

  @action.bound setPools = (pools: Pool[]) => (this.pools = pools);

  private setPoolData = (poolStats: PoolDataType) => {
    const getPool = this.poolStatsArr.find((item) => item.contractId === poolStats.contractId);

    if (getPool) {
      this.poolStatsArr.forEach((item, key) => {
        item.contractId === poolStats.contractId ? Object.assign(this.poolStatsArr[key], poolStats) : null;
      });
    }

    if (!getPool) {
      this.poolStatsArr.push(poolStats);
    }
  };

  private setInitialized = (v: boolean) => (this.initialized = v);

  private setUserHealth = (v: BN) => {
    if (+v > 100) {
      return 100;
    }

    if (+v < 0) {
      return 0;
    }

    return +v.toFixed(2);
  };

  private setUserCollateral = (v: number, contractId: string) => {
    this.userCollateral = v;
    const value = v || 0;
    this.poolStatsArr.forEach((item, key) => {
      item.contractId === contractId ? (this.poolStatsArr[key].userCollateral = value) : false;
    });
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

  usdnRate = (tokenAssetId: string): BN | null => {
    const { tokenStore } = this.rootStore;
    let rate = BN.ZERO;

    this.poolStatsArr.forEach((item) => {
      item.tokens.forEach((poolToken) => {
        if (poolToken.assetId === tokenAssetId) rate = poolToken.minPrice;
      });
    });

    return rate;
  };

  // get ACTIVE POOL TOKENS without extra STATS for userStats, with contractId
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

    TOKENS_LIST(poolName).forEach(() => {
      const poolData = this.poolStatsByContractId[contractId];

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

  // Calculating UR on contract
  public calculateUR = (contractId: string): any => {
    const { lendStore } = this.rootStore;
    const contractPoolName = lendStore.poolNameById(contractId);
    const assets = TOKENS_LIST(contractPoolName).map(({ assetId }) => assetId);

    wavesNodesService.updateUR(contractId, assets).catch((e: any) => {
      // notifi\cationStore.notify(e.message ?? e.toString(), {
      //   type: 'error',
      // });
      console.log(e, 'getAssetsStats');
      return [];
    });
  };

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

  syncPools = async () => {
    const pools = Object.values(POOL_CONFIG).map((pool) => new Pool({ ...pool, isCustom: false }));
    this.setPools(pools);
    await Promise.all(this.pools.map((pool) => pool.syncLiquidity()));
  };

  // for Token Detailed page
  public loadTokenUsers = async (contractId: string) => {
    const { accountStore, notificationStore, lendStore } = this.rootStore;
    const contractPoolId = contractId || lendStore.activePoolContract;
    const contractPoolName = lendStore.poolNameById(contractPoolId);
    const assets = TOKENS_LIST(contractPoolName).map(({ assetId }) => assetId);

    let stats = null;

    stats = await wavesNodesService.getAssetUsers(contractId, assets).catch((e) => {
      notificationStore.notify(e.message ?? e.toString(), {
        type: 'error',
      });
      console.log(e, 'getAssetsStats');
      return [];
    });

    return stats;
  };

  public watchList: string[];

  public addToWatchList = (assetId: string) => this.watchList.push(assetId);

  public removeFromWatchList = (assetId: string) => {
    const index = this.watchList.indexOf(assetId);
    index !== -1 && this.watchList.splice(index, 1);
  };

  // currently only for collateral
  // further can be used for other info
  // remove to account STORE
  public loadUserDetails = async (contractId: string) => {
    const { accountStore, lendStore } = this.rootStore;
    let stats = null;
    if (accountStore.address) {
      stats = await wavesNodesService
        .getUserExtraStats(accountStore.address, contractId || lendStore.activePoolContract)
        .catch((e) => {
          // notificationStore.notify(e.message ?? e.toString(), {
          //   type: 'error',
          // });
          console.log(e, 'getAssetsStats');
          return [];
        });
    }

    this.setUserCollateral(stats, contractId);

    return stats;
  };

  // loading all data about tokens, their apy/apr, supply/borrow and evth
  public syncTokenStatistics = async (contractId?: string, userId?: string) => {
    const { accountStore, lendStore, notificationStore } = this.rootStore;
    const contractPoolId = contractId || lendStore.activePoolContract;
    const userContract = userId || accountStore.address;

    const stats = await wavesNodesService.getPoolsStats(userContract!, contractPoolId).catch((e) => {
      console.log(e, 'getAssetsStats');
      return [];
    });

    // count pool Total
    let poolTotal = BN.ZERO;

    // count net apy
    let supplyAmountApy = BN.ZERO;
    let borrowedAmountApr = BN.ZERO;

    // count current user Balance
    let supplyAmountCurrent = BN.ZERO;
    let borrowedAmountCurrent = BN.ZERO;

    let baseAmount = BN.ZERO;
    let borrowCapacity = BN.ZERO;
    let borrowCapacityUsed = BN.ZERO;

    const statistics = stats.map((details: any) => {
      const asset = TOKENS_BY_ASSET_ID[details.assetId] ?? details.precision;
      const { decimals } = asset;
      const currentPrice = details.min_price;

      // pool Total
      poolTotal = BN.formatUnits(details.total_supply, details.precision).times(currentPrice).plus(poolTotal);

      // net APY
      supplyAmountApy = BN.formatUnits(details.self_supply, details.precision)
        .times(currentPrice)
        .times(details.setup_supply_apy)
        .plus(supplyAmountApy);

      borrowedAmountApr = BN.formatUnits(details.self_borrowed, details.precision)
        .times(currentPrice)
        .times(details.setup_borrow_apr)
        .plus(borrowedAmountApr);

      baseAmount = BN.formatUnits(details.self_supply, details.precision).times(currentPrice).plus(baseAmount);

      // count balance supply/borrow
      supplyAmountCurrent = BN.formatUnits(details.self_supply, details.precision)
        .times(currentPrice)
        .plus(supplyAmountCurrent);

      borrowedAmountCurrent = BN.formatUnits(details.self_borrowed, details.precision)
        .times(currentPrice)
        .plus(borrowedAmountCurrent);

      // count USER HEALTH for SAME ASSETS
      if (+details.self_supply > 0) {
        borrowCapacity = BN.formatUnits(details.self_supply, details.precision)
          .times(currentPrice)
          .times(details.setup_ltv)
          .div(100)
          .plus(borrowCapacity);
      }

      if (+details.self_borrowed > 0) {
        borrowCapacityUsed = BN.formatUnits(details.self_borrowed, details.precision)
          .times(currentPrice)
          .plus(borrowCapacityUsed);
      }

      return {
        assetId: details.assetId,
        decimals,
        name: details.name,
        symbol: details.shortcode,
        setupLtv: details.setup_ltv,
        setupLts: details.setup_lts,
        setupPenalty: details.setup_penalties,
        setupBorrowAPR: details.setup_borrow_apr,
        setupSupplyAPY: details.setup_supply_apy,
        selfSupply: details.self_supply,
        selfBorrow: details.self_borrowed,
        selfDailyIncome: details.self_daily_income,
        selfDailyBorrowInterest: details.self_daily_borrow_interest,
        supplyInterest: details.supply_interest,
        selfSupplyRate: details.supply_rate,
        totalAssetBorrow: details.total_borrow,
        totalAssetSupply: details.total_supply,
        currentPrice,
        minPrice: details.min_price,
        maxPrice: details.max_price,
      };
    });

    let netAPY = BN.ZERO;
    let accountHealth = BN.ZERO;

    if (+baseAmount !== 0) netAPY = supplyAmountApy.minus(borrowedAmountApr).div(baseAmount);
    if (+borrowCapacity !== 0)
      accountHealth = BN.formatUnits(1, 0).minus(borrowCapacityUsed.div(borrowCapacity)).times(100);

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

    this.setPoolData(poolData);

    Object.values(LENDS_CONTRACTS).map((item) => this.loadUserDetails(item));
  };

  constructor(rootStore: RootStore, initState?: ISerializedTokenStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.watchList = initState?.watchList ?? [];
    Promise.all(
      Object.values(LENDS_CONTRACTS).map((item) => this.syncTokenStatistics(item, rootStore.accountStore.address!))
    ).then(() => this.setInitialized(true));

    console.log(rootStore, 'STORE');
    // Object.values(LENDS_CONTRACTS).map((item) => this.calculateUR(item));
    setInterval(() => {
      this.syncTokenStatistics(rootStore.lendStore.activePoolContract, rootStore.accountStore.address!);
    }, 60 * 2000);
  }

  serialize = (): ISerializedTokenStore => ({
    watchList: this.watchList,
  });
}
