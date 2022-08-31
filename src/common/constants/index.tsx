import tokenLogos from '@src/common/constants/tokenLogos';
import tokensList from '@src/common/constants/tokens.json';
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

export function createITokenStat(): TTokenStatistics {
  return {
    assetId: '',
    name: '',
    symbol: '',
    decimals: 0,
    setupLtv: '',
    setupBorrowAPR: '',
    setupSupplyAPY: '',
    changeStr: '',
    selfSupplyRate: '',
    selfSupply: BN.ZERO,
    selfBorrow: BN.ZERO,
    totalSupply: BN.ZERO,
    totalPoolSupply: BN.ZERO,
    totalPoolBorrow: BN.ZERO,
    circulatingSupply: BN.ZERO,
    totalBurned: BN.ZERO,
    fullyDilutedMC: BN.ZERO,
    marketCap: BN.ZERO,
    currentPrice: BN.ZERO,
    change24H: BN.ZERO,
    change24HUsd: BN.ZERO,
    volume24: BN.ZERO,
  };
}

export interface IToken {
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  startPrice?: number;
  description?: string;
  category?: string[];
}

export function createIToken(): IToken {
  return {
    assetId: '',
    name: '',
    symbol: '',
    decimals: 0,
    logo: '',
  };
}

export interface IPoolConfig {
  domain: string;
  isCustom?: boolean;
  contractAddress: string;
  layer2Address?: string;
  baseTokenId: string;
  title: string;
  defaultAssetId0?: string;
  defaultAssetId1?: string;
  tokens: Array<IToken & { share: number }>;
  poolTokenName?: string;
  owner?: string;
  artefactOriginTransactionId?: string;
  swapFee?: number;
  createdAt?: string;
  logo?: string;
  statistics?: IPoolConfigStatistics;
}

export interface IPoolConfigStatistics {
  apy: string;
  boostedApy?: string;
  boostedDate?: string;
  monthlyVolume: string;
  weeklyVolume: string;
  monthlyFees: string;
  fees: string;
  liquidity: string;
  volume: Array<{ date: number; volume: string }>;
}

export const CONTRACT_ADDRESSES = {
  staking: '3PFTbywqxtFfukX3HyT881g4iW5K4QL3FAS',
  ultraStaking: '3PKUxbZaSYfsR7wu2HaAgiirHYwAMupDrYW',
  aggregator: '3PGFHzVGT4NTigwCKP1NcwoXkodVZwvBuuU',
  nfts: '3PFQjjDMiZKQZdu5JqTHD7HwgSXyp9Rw9By',
  createArtefacts: '3PFkgvC9y6zHy64zEAscKKgaNY3yipiLqbW',
  boost: '3PAeY7RgwuNUZNscGqahqJxFTFDkh7fbNwJ',
  ltv1: '3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT',
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  DASHBOARD_POOl: '/dashboard/pool/:poolId',
  DASHBOARD_TOKEN: '/dashboard/token/:assetId',
  NOT_FOUND: '/404',
};

export const TOKENS_LIST: Array<IToken> = Object.values(tokensList).map((t) => ({
  ...t,
  logo: tokenLogos[t.symbol],
}));

export const NODE_URL = 'https://nodes-puzzle.wavesnodes.com';
export const EXPLORER_URL = 'https://new.wavesexplorer.com';

export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce((acc, t) => ({ ...acc, [t.symbol]: t }), {});
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId]: t }),
  {}
);

export const POOL_CONFIG: IPoolConfig[] = [
  // {
  //   domain: "vlad",
  //   contractAddress: "3P98RJpxfwZpNfAcLjLWMnesX65dpW64Rim",
  //   layer2Address: "3PEsmFNhWpPW9AA8Th95hfLWz3bCVY18QAA",
  //   baseTokenId: TOKENS_BY_SYMBOL.VLAD.assetId,
  //   title: "VLAD Pool",
  //   logo: tokenLogos.VLAD,
  //   defaultAssetId0: TOKENS_BY_SYMBOL.VLAD.assetId,
  //   defaultAssetId1: TOKENS_BY_SYMBOL.PUZZLE.assetId,
  //   tokens: [
  //     { ...TOKENS_BY_SYMBOL.VLAD, share: 50, logo: tokenLogos.VLAD },
  //     { ...TOKENS_BY_SYMBOL.PUZZLE, share: 50, logo: tokenLogos.PUZZLE }
  //   ],
  // },
  {
    domain: 'puzzle',
    contractAddress: '3PFDgzu1UtswAkCMxqqQjbTeHaX4cMab8Kh',
    baseTokenId: TOKENS_BY_SYMBOL.USDN.assetId,
    title: 'Puzzle Pool',
    logo: tokenLogos.PUZZLE,
    defaultAssetId0: TOKENS_BY_SYMBOL.PUZZLE.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.USDT, share: 10, logo: tokenLogos.USDT },
      { ...TOKENS_BY_SYMBOL.PUZZLE, share: 80, logo: tokenLogos.PUZZLE },
      { ...TOKENS_BY_SYMBOL.USDN, share: 10, logo: tokenLogos.USDN },
    ],
  },
];
