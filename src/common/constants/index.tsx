/* eslint-disable prettier/prettier */
import tokenLogos from '@src/common/constants/tokenLogos';
import BN from '@src/common/utils/BN';

import tokensPuzzleList from '@src/common/constants/tokens_mainPool.json';
import tokensWavesList from '@src/common/constants/tokens_wavesPool.json';
import tokensFullList from '@src/common/constants/tokens_full.json';

const tokensList = {
  mainPool: tokensWavesList,
  puzzlePool: tokensPuzzleList,
  allTokens: [
    ...tokensWavesList,
    ...tokensPuzzleList,
  ],
};

export const poolsTitles = {
  mainPool: 'Main pool',
  puzzlePool: 'PUZZLE pool',
};

export type PoolDataType = {
  netAPY: BN;
  userHealth: number;
  supplyUserTotal: BN;
  borrowUserTotal: BN;
  poolTotal: BN;
  userCollateral: number;
  contractId: string;
  tokens: Array<TTokenStatistics>;
};

export interface ISerializedTokenStore {
  watchList: string[];
}

export type TTokenStatistics = {
  assetId: string;
  decimals: number;
  name: string;
  symbol: string;
  setupLtv: BN;
  setupLts: BN;
  setupPenalty: BN;
  setupBorrowAPR: BN;
  setupSupplyAPY: BN;
  selfSupply: BN;
  selfBorrow: BN;
  selfSupplyRate: BN;
  selfDailyIncome: BN;
  selfDailyBorrowInterest: BN;
  supplyInterest: BN;
  totalAssetSupply: BN;
  totalAssetBorrow: BN;
  maxPrice: BN;
  currentPrice: BN;
};

export function createITokenStat(): TTokenStatistics {
  return {
    assetId: '',
    name: '',
    symbol: '',
    decimals: 0,
    setupLtv: BN.ZERO,
    setupLts: BN.ZERO,
    setupPenalty: BN.ZERO,
    setupBorrowAPR: BN.ZERO,
    setupSupplyAPY: BN.ZERO,
    selfSupplyRate: BN.ZERO,
    selfSupply: BN.ZERO,
    selfBorrow: BN.ZERO,
    selfDailyIncome: BN.ZERO,
    selfDailyBorrowInterest: BN.ZERO,
    supplyInterest: BN.ZERO,
    totalAssetSupply: BN.ZERO,
    totalAssetBorrow: BN.ZERO,
    currentPrice: BN.ZERO,
    maxPrice: BN.ZERO,
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
};

export const LENDS_CONTRACTS = {
  mainPool: '3P6dkRGSqgsNpQFbSYn9m8n4Dd8KRaj5TUU',
  puzzlePool: '3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT',
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  // supply/borrow/all separating on mobile
  DASHBOARD_MOBILE: '/dashboard/:assetType',
  USER_STATS: '/user/:userId',
  USERS_LIST: '/users/list',
  DASHBOARD_POOl: '/dashboard/pool/:poolId',
  DASHBOARD_TOKEN: '/dashboard/token/:assetId',
  NOT_FOUND: '/404',
};

// loading tokens depend on poolName, some pools could have 2 tokens, some 20

// eslint-disable-next-line @typescript-eslint/naming-convention
export function TOKENS_LIST(poolName: string): IToken[] {
  let objectValues: any = Object.entries(tokensList).filter(([key, value]) => {
    return key === poolName ? value : false
  })[0]

  objectValues = Object.values(objectValues[1]);

  // case for merged pools token list
  if (poolName === 'allTokens') {
    objectValues = objectValues.filter((v: any, i: any, a: any) => {
      return a.findIndex((t: any) => (t.assetId === v.assetId)) === i
    })
  }

  if (objectValues && objectValues.length) {
    return objectValues.map((t: any) => ({
      ...t,
      logo: tokenLogos[t.symbol],
    }));
  }

  return []
}
console.log(TOKENS_LIST('allTokens'), 'TOKENS_LIST(1allTokens)');

export const TOKENS_LIST_FULL: Array<IToken> = Object.values(tokensFullList).map((t) => ({
  ...t,
  logo: tokenLogos[t.symbol],
}));

export const NODE_URL = 'https://nodes-puzzle.wavesnodes.com';
export const EXPLORER_URL = 'https://new.wavesexplorer.com';

export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST_FULL.reduce(
  (acc, t) => ({ ...acc, [t.symbol]: t }),
  {}
);
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST_FULL.reduce(
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
