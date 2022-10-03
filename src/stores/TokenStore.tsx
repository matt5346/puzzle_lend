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
import Pool, { IData, IShortPoolInfo } from '@src/common/entities/Pool';
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

  private setUserHealth = (v: number) => {
    if (v > 100) {
      return 100;
    }

    if (v < 0) {
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

  usdnRate = (tokenAssetId: string, coefficient = 1): BN | null => {
    const { tokenStore } = this.rootStore;
    const usdn = TOKENS_BY_SYMBOL.USDN.assetId;
    const puzzle = TOKENS_BY_SYMBOL.PUZZLE.assetId;
    const pool = this.pools.find(({ tokens }) => tokens.some((t) => t.assetId === tokenAssetId));
    const startPrice = TOKENS_BY_ASSET_ID[tokenAssetId]?.startPrice;
    // todo fix this pizdez !!!
    if (pool == null && startPrice != null) {
      return new BN(startPrice ?? 0);
    }
    if (pool == null) return null;
    if (pool.currentPrice(tokenAssetId, puzzle) == null && pool.tokens.some((t) => t.assetId === puzzle)) {
      return new BN(startPrice ?? 0);
    }
    if (pool.currentPrice(tokenAssetId, usdn) == null && pool.tokens.some((t) => t.assetId === usdn)) {
      return new BN(startPrice ?? 0);
    }

    if (pool.tokens.some(({ assetId }) => assetId === usdn)) {
      return pool.currentPrice(tokenAssetId, usdn, coefficient);
    }
    if (pool.tokens.some(({ assetId }) => assetId === puzzle)) {
      const puzzleRate = tokenStore.poolDataTokensWithStats[puzzle]?.currentPrice;
      const priceInPuzzle = pool.currentPrice(tokenAssetId, puzzle, coefficient);
      return priceInPuzzle != null && puzzleRate != null ? priceInPuzzle.times(puzzleRate) : null;
    }
    return null;
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
    const { accountStore, lendStore } = this.rootStore;
    const contractPoolId = contractId || lendStore.activePoolContract;
    const contractPoolName = lendStore.poolNameById(contractPoolId);
    const assets = TOKENS_LIST(contractPoolName).map(({ assetId }) => assetId);
    const userContract = userId || accountStore.address;

    const stats = await wavesNodesService.getPoolsStats(assets, userContract!, contractPoolId).catch((e) => {
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
    // const base =
    // const net_apy =

    const statistics = stats.map((details: any) => {
      const asset = TOKENS_BY_ASSET_ID[details.assetId] ?? details.precision;
      const { decimals } = asset;
      const currentPrice = new BN(details.min_price ?? 0);

      // pool Total
      poolTotal += (details.total_supply / 10 ** details.precision) * +currentPrice;

      // net APY
      supplyAmountApy += (details.self_supply / 10 ** details.precision) * +currentPrice * details.setup_supply_apy;
      borrowedAmountApr += (details.self_borrowed / 10 ** details.precision) * +currentPrice * details.setup_borrow_apr;
      baseAmount += (details.self_supply / 10 ** details.precision) * +currentPrice;

      // console.log(
      //   details.name,
      //   details.self_supply / 10 ** details.precision,
      //   details.supply_rate,
      //   'supplyAmountCurrent'
      // );
      // console.log(
      //   details.name,
      //   details.self_borrowed / 10 ** details.precision,
      //   details.borrow_rate,
      //   +currentPrice,
      //   'borrowedAmountCurrent'
      // );
      // count balance supply/borrow
      supplyAmountCurrent += (details.self_supply / 10 ** details.precision) * +currentPrice;
      borrowedAmountCurrent += (details.self_borrowed / 10 ** details.precision) * +currentPrice;

      // console.log(
      //   details.self_supply,
      //   details.setup_ltv,
      //   details.self_borrowed,
      //   +currentPrice,
      //   details.name,
      //   '(details.self_supply * details.setup_ltv) / details.self_borrowed'
      // );

      // count USER HEALTH for SAME ASSETS
      if (details.self_supply > 0) {
        borrowCapacity += (details.self_supply / 10 ** details.precision) * +currentPrice * (details.setup_ltv / 100);
      }

      if (details.self_borrowed > 0) {
        borrowCapacityUsed += (details.self_borrowed / 10 ** details.precision) * +currentPrice;
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
        selfSupply: BN.formatUnits(details.self_supply, 0),
        selfBorrow: BN.formatUnits(details.self_borrowed, 0),
        selfDailyIncome: details.self_daily_income,
        selfDailyBorrowInterest: details.self_daily_borrow_interest,
        supplyInterest: details.supply_interest,
        selfSupplyRate: details.supply_rate,
        totalAssetBorrow: BN.formatUnits(details.total_borrow, 0),
        totalAssetSupply: BN.formatUnits(details.total_supply, 0),
        currentPrice,
        maxPrice: BN.formatUnits(details.max_price, 0),
      };
    });

    let netAPY = 0;
    let accountHealth = 0;

    if (baseAmount !== 0) netAPY = (supplyAmountApy - borrowedAmountApr) / baseAmount;
    if (borrowCapacity !== 0) accountHealth = (1 - borrowCapacityUsed / borrowCapacity) * 100;

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

    // Object.values(LENDS_CONTRACTS).map((item) => this.calculateUR(item));
    setInterval(() => {
      this.syncTokenStatistics(rootStore.lendStore.activePoolContract, rootStore.accountStore.address!);
    }, 60 * 2000);
  }

  serialize = (): ISerializedTokenStore => ({
    watchList: this.watchList,
  });
}
