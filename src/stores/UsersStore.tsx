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

  private setInitialized = (v: boolean) => (this.initialized = v);

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

  // get ACTIVE POOL TOKENS with STATS
  get poolDataTokensWithStats(): Record<string, TTokenStatistics> {
    let activePoolTokensWithStats: Record<string, TTokenStatistics>;
    const { lendStore } = this.rootStore;

    TOKENS_LIST(lendStore.activePoolName).forEach(() => {
      const poolData = this.poolStatsByContractId[lendStore.activePoolContract];
      console.log(poolData, 'poolData111');

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
      stats = await wavesCapService
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

  // TODO REMOVE unrequired data

  // loading all data about tokens, their apy/apr, supply/borrow and evth
  public syncTokenStatistics = async (contractId?: string, userId?: string) => {
    console.log(this.poolStatsArr, 'syncTokenStatistics 1!');
    const { accountStore, lendStore } = this.rootStore;
    const contractPoolId = contractId || lendStore.activePoolContract;
    const contractPoolName = lendStore.poolNameById(contractPoolId);
    const assets = TOKENS_LIST(contractPoolName).map(({ assetId }) => assetId);
    console.log(contractPoolId, lendStore.activePoolContract, '------lendStore.activePoolContract');
    const userContract = userId || accountStore.address;

    console.log(
      lendStore.poolNameById(contractId || lendStore.activePoolContract),
      'endStore.poolNameById(contractId)'
    );
    console.log(assets, 'ASSETS');
    console.log(contractPoolId, 'lendStore.activePoolContract 2');
    const stats = await wavesCapService.getPoolsStats(assets, userContract!, contractPoolId).catch((e) => {
      // notifi\cationStore.notify(e.message ?? e.toString(), {
      //   type: 'error',
      // });
      console.log(e, 'getAssetsStats');
      return [];
    });
    console.log(stats, 'stats ');

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
      const asset = TOKENS_BY_ASSET_ID[details.id] ?? details.precision;
      const { decimals } = asset;
      console.log(decimals, 'decimal');
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

      // count balance supply/borrow
      console.log(
        details.name,
        details.self_supply / 10 ** details.precision,
        details.supply_rate,
        'supplyAmountCurrent'
      );
      console.log(
        details.name,
        details.self_borrowed / 10 ** details.precision,
        details.borrow_rate,
        +currentPrice,
        'borrowedAmountCurrent'
      );
      supplyAmountCurrent += (details.self_supply / 10 ** details.precision) * +currentPrice;
      borrowedAmountCurrent += (details.self_borrowed / 10 ** details.precision) * +currentPrice;

      // console.log(
      //   details.self_borrowed,
      //   details.setup_ltv,
      //   supplyAmountApy,
      //   'details.self_borrowed, details.setup_ltv, suppliedAmount'
      // );

      // count USER HEALTH
      // NEXT COMMENTED case for DIFFERENT assets pairs as usdc/waves pool
      // currently invalid, cause all pools in same pairs

      // if (details.self_borrowed > 0) {
      //   borrowCapacity += (details.setup_ltv / 100) * 1 * supplyAmountApy * Number(details.data?.['firstPrice_usd-n']);
      //   borrowCapacityUsed +=
      //     (borrowedAmountApr * Number(details.data?.['firstPrice_usd-n'])) / (details.setup_ltv / 100);
      // }

      console.log(
        details.self_supply,
        details.setup_ltv,
        details.self_borrowed,
        +currentPrice,
        details.name,
        '(details.self_supply * details.setup_ltv) / details.self_borrowed'
      );

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
    console.log(borrowCapacityUsed / borrowCapacity, 'borrowCapacity borrowCapacityUsed');

    const netAPY: number = (supplyAmountApy - borrowedAmountApr) / baseAmount;
    const accountHealth: number = (1 - borrowCapacityUsed / borrowCapacity) * 100;

    console.log(netAPY, accountHealth, 'netapy accountHealth');

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

    console.log(statistics, 'syncTokenStatistics 2!');

    Object.values(LENDS_CONTRACTS).map((item) => this.loadUserDetails(item));
    return stats;
  };

  constructor(rootStore: RootStore, initState?: ISerializedTokenStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.watchList = initState?.watchList ?? [];
  }

  serialize = (): ISerializedTokenStore => ({
    watchList: this.watchList,
  });
}
