import tokenLogos from "@src/common/constants/tokenLogos";
import tokensList from "@src/common/constants/tokens.json";

export interface IToken {
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
  startPrice?: number;
  description?: string;
  logo: string;
  category?: string[];
}

export const ROUTES = {
  HOME: "/",
  NOT_FOUND: "/404",
  DASHBOARD: "/dashboard",
};

export const TOKENS_LIST: Array<IToken> = Object.values(tokensList).map((t) => ({
  ...t,
  logo: tokenLogos[t.symbol],
}));

export const NODE_URL = "https://nodes-puzzle.wavesnodes.com";
export const EXPLORER_URL = "https://new.wavesexplorer.com";
