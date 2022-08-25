import axios from 'axios';
import BN from '@src/common/utils/BN';
import buildUrlParams from '@src/common/utils/build-url-params';

interface IAssetResponse {
  id: string;
  totalSupply: number;
  circulating: number;
  '24h_vol_usd-n': number;
  precision: number;
  name: string;
  shortcode: string;
  data: {
    'firstPrice_usd-n': number;
    'lastPrice_usd-n': number;
  } | null;
}

const wavesCapService = {
  getAssetsStats: async (assetsId: string[], address?: string): Promise<IAssetResponse[]> => {
    const params = new URLSearchParams();

    for (let i = 0; i < assetsId.length - 1; i++) {
      params.append('assetIds[]=', assetsId[i]);
    }
    const url = `https://wavescap.com/api/assets-info.php?${params.toString()}`;
    const response = await axios.get(url);

    let tokensRates: any = {};

    try {
      const tokensRatesUrl = 'http://nodes.wavesnodes.com/utils/script/evaluate/3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT';
      tokensRates = await axios(tokensRatesUrl, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        data: {
          expr: 'calculateTokenRates(false)',
        },
      });
    } catch (err) {
      console.log(err, 'ERR');
    }

    // eslint-disable-next-line no-underscore-dangle
    const tokensRatesArr: string[] = tokensRates?.data?.result?.value?._2?.value.split(',');
    console.log(tokensRates, 'tokensRates');

    const assetsData = await Promise.all(
      assetsId.map(async (itemId) => {
        // todo: pass pools as const
        const stringParams = buildUrlParams({
          total_supply: `total_supplied_${itemId}`,
          total_borrow: `total_borrowed_${itemId}`,
          setup_roi: 'setup_roi',
          setup_ltvs: 'setup_ltvs',
          setup_tokens: 'setup_tokens',
          setup_interest: 'setup_interest',
          address_supply: `${address}_supplied_${itemId}`,
          address_borrow: `${address}_borrowed_${itemId}`,
        });

        const urlSupply = `https://nodes.wavesnodes.com/addresses/data/3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT?${stringParams}`;
        const responseAssets = await axios.get(urlSupply);
        console.log(responseAssets, 'SUUPLY');
        return responseAssets.data;
      })
    );

    const fullAssetsData = response.data.assets.map((item: any) => {
      const itemData = {
        ...item,
        total_supply: 0,
        total_borrow: 0,
        setup_ltv: 0,
        setup_borrow_apr: 0,
        setup_supply_apy: 0,
        self_supply: 0,
        self_borrowed: 0,
        supply_rate: 0,
        borrow_rate: 0,
      };

      assetsData.forEach((assetPoolData) => {
        console.log(assetPoolData, 'assetPoolData');
        const poolValue = assetPoolData.find((pool: any) => `total_supplied_${item.id}` === pool.key);
        const poolBorrowed = assetPoolData.find((pool: any) => `total_borrowed_${item.id}` === pool.key);
        const ltv = assetPoolData.find((pool: any) => pool.key === 'setup_ltvs')?.value?.split(',');
        const setupTokens = assetPoolData.find((pool: any) => pool.key === 'setup_tokens')?.value?.split(',');
        const selfSupply = assetPoolData.find((pool: any) => pool.key === `${address}_supplied_${item.id}`);
        const selfBorrowed = assetPoolData.find((pool: any) => pool.key === `${address}_borrowed_${item.id}`);

        setupTokens.forEach((token_id: any, key: any) => {
          if (itemData.id === token_id) {
            itemData.setup_ltv = `${ltv[key] / 10 ** 6}%`;

            if (tokensRatesArr && tokensRatesArr.length) {
              const rates = tokensRatesArr[key];
              const splittedRates = rates.split('|');
              console.log(splittedRates, 'splittedRates');

              itemData.supply_rate = (Number(splittedRates[0]!) / 10 ** 16).toFixed(8);
              itemData.borrow_rate = (Number(splittedRates[1]!) / 10 ** 16).toFixed(8);
            }
          }
        });

        assetPoolData.forEach((pool: any) => {
          // setup_roi === borrow interest
          if (pool.key === 'setup_roi') {
            itemData.setup_borrow_apr = (pool.value / 10 ** 4) * 365;
          }
        });

        if (poolBorrowed) itemData.total_borrow = poolBorrowed.value;
        if (poolValue) itemData.total_supply = poolValue.value;

        if (selfSupply) itemData.self_supply = selfSupply.value;
        if (selfBorrowed) itemData.self_borrowed = selfBorrowed.value;

        if (ltv) itemData.setup_ltvs = `${(Number(ltv[0]) / Number(ltv[1])) * 100}%`;

        console.log(itemData, 'itemData.total_supply');
        const UR =
          itemData.total_borrow / 10 ** itemData.precision / (itemData.total_supply / 10 ** itemData.precision);
        const supplyInterest = (itemData.setup_borrow_apr * UR) / 100;
        // too big value for ~Supply APY = ((1 + supply interest) ** 365 - 1) * 100%
        // official formula --- APY = (1 + r/n)**n - 1
        const supplyAPY = ((1 + supplyInterest / 365) ** 365 - 1) * 100;
        itemData.setup_supply_apy = supplyAPY.toFixed(2);
        console.log(UR, supplyInterest, 'UR-------supplyInterest');
        console.log(supplyAPY, '-------supplyAPY');
      });

      return itemData;
    });
    console.log(fullAssetsData, 'fullAsset');
    return fullAssetsData != null ? fullAssetsData.filter((v: any) => v != null) : [];
  },
  getAllAssetsStats: async (): Promise<IAssetResponse[]> => {
    const response = await axios.get('https://wavescap.com/api/assets.json');
    return response.data;
  },
  getAssetRate: async (assetsId: string): Promise<BN | null> => {
    const url = `https://wavescap.com/api/asset/${assetsId}.json`;
    const { data: res } = await axios.get<IAssetResponse>(url);
    return res.data && res.data['lastPrice_usd-n'] ? new BN(res.data['lastPrice_usd-n']) : null;
  },
};

export default wavesCapService;
