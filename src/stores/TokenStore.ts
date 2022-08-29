/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-return-assign */
import RootStore from '@src/stores/RootStore';
import { makeAutoObservable } from 'mobx';
import { TOKENS_BY_ASSET_ID, TOKENS_LIST } from '@src/common/constants';
import wavesCapService from '@src/common/services/wavesCapService';
import BN from '@src/common/utils/BN';

export interface ISerializedTokenStore {
  watchList: string[];
}

export type TTokenStatistics = {
  assetId: string;
  decimals: number;
  name: string;
  symbol: string;
  setupLtv: string;
  setupBorrowAPR: string;
  setupSupplyAPY: string;
  selfSupply: BN;
  selfBorrow: BN;
  selfSupplyRate: string;
  totalSupply: BN;
  totalPoolSupply: BN;
  totalPoolBorrow: BN;
  circulatingSupply: BN;
  totalBurned: BN;
  fullyDilutedMC: BN;
  marketCap: BN;
  currentPrice: BN;
  change24H: BN;
  change24HUsd: BN;
  volume24: BN;
  changeStr: string;
};

export default class TokenStore {
  public rootStore: RootStore;

  initialized = false;

  statistics: Array<TTokenStatistics> = [];

  netAPY = 0;

  userHealth = 0;

  supplyUserTotal = 0;

  borrowUserTotal = 0;

  private setInitialized = (v: boolean) => (this.initialized = v);

  private setNetAPY = (v: number) => (this.netAPY = v);

  private setUserHealth = (v: number) => (this.userHealth = v);

  private setSupplyBorrow = (s: number, b: number) => {
    this.supplyUserTotal = s;
    this.borrowUserTotal = b;
  };

  private setStatistics = (v: Array<TTokenStatistics>) => (this.statistics = v);

  get statisticsByAssetId(): Record<string, TTokenStatistics> {
    return this.statistics.reduce(
      (acc, stats) => ({ ...acc, [stats.assetId]: stats }),
      {} as Record<string, TTokenStatistics>
    );
  }

  public watchList: string[];

  public addToWatchList = (assetId: string) => this.watchList.push(assetId);

  public removeFromWatchList = (assetId: string) => {
    const index = this.watchList.indexOf(assetId);
    index !== -1 && this.watchList.splice(index, 1);
  };

  // loading all data about tokens, their apy/apr, supply/borrow and evth
  private syncTokenStatistics = async () => {
    const { accountStore } = this.rootStore;
    const assets = TOKENS_LIST.map(({ assetId }) => assetId);
    const stats = await wavesCapService.getAssetsStats(assets, accountStore.address!).catch((e) => {
      // notificationStore.notify(e.message ?? e.toString(), {
      //   type: 'error',
      // });
      console.log(e, 'getAssetsStats');
      return [];
    });

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

      // net APY
      supplyAmountApy += (details.self_supply / 10 ** details.precision) * details.setup_supply_apy;
      borrowedAmountApr += (details.self_borrowed / 10 ** details.precision) * details.setup_borrow_apr;
      baseAmount += details.self_supply / 10 ** details.precision;

      // count balance supply/borrow
      console.log(details.self_supply, details.self_borrowed, 'TEEEEST');
      supplyAmountCurrent += (details.self_supply / 10 ** details.precision) * details.supply_rate;
      borrowedAmountCurrent += (details.self_borrowed / 10 ** details.precision) * details.borrow_rate;

      console.log(
        details.self_borrowed,
        details.setup_ltv,
        supplyAmountApy,
        'details.self_borrowed, details.setup_ltv, suppliedAmount'
      );

      // count USER HEALTH
      // NEXT COMMENTED case for DIFFERENT assets pairs as usdc/waves pool
      // currently invalid, cause all pools in same pairs

      // if (details.self_borrowed > 0) {
      //   borrowCapacity += (details.setup_ltv / 100) * 1 * supplyAmountApy * Number(details.data?.['firstPrice_usd-n']);
      //   borrowCapacityUsed +=
      //     (borrowedAmountApr * Number(details.data?.['firstPrice_usd-n'])) / (details.setup_ltv / 100);
      // }

      // count USER HEALTH for SAME ASSETS
      if (details.self_borrowed > 0) {
        console.log(
          details.self_supply,
          details.setup_ltv,
          details.self_borrowed,
          '(details.self_supply * details.setup_ltv) / details.self_borrowed'
        );
        borrowCapacity += details.self_supply * (details.setup_ltv / 100) * Number(details.data?.['firstPrice_usd-n']);
        borrowCapacityUsed += details.self_borrowed * Number(details.data?.['firstPrice_usd-n']);
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
        selfSupplyRate: details.supply_rate,
        totalPoolBorrow: BN.formatUnits(details.total_borrow, decimals),
        totalPoolSupply: BN.formatUnits(details.total_supply, decimals),
        circulatingSupply: BN.formatUnits(details.circulating, decimals),
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
    console.log(borrowCapacity, borrowCapacityUsed, 'borrowCapacity borrowCapacityUsed');

    const netAPY: number = (supplyAmountApy - borrowedAmountApr) / baseAmount;
    const accountHealth: number = borrowCapacity / borrowCapacityUsed;
    console.log(netAPY, accountHealth, 'netapy accountHealth');

    this.setNetAPY(netAPY);
    this.setSupplyBorrow(supplyAmountCurrent, borrowedAmountCurrent);
    this.setUserHealth(accountHealth);
    this.setStatistics(statistics);
  };

  constructor(rootStore: RootStore, initState?: ISerializedTokenStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.watchList = initState?.watchList ?? [];
    Promise.all([this.syncTokenStatistics()]).then(() => this.setInitialized(true));
    setInterval(this.syncTokenStatistics, 60 * 1000);
  }

  serialize = (): ISerializedTokenStore => ({
    watchList: this.watchList,
  });
}
