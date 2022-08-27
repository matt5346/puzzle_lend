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
        headers: {
          'Content-type': 'application/json',
        },
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
        // loan to value %
        setup_ltv: 0,
        // interest rate for supply/borrow interest
        setup_interest: 0,
        // borrow APR
        setup_borrow_apr: 0,
        // supply APY
        setup_supply_apy: 0,
        self_supply: 0,
        self_borrowed: 0,
        // sRate, need for counting SUPPLY compound on front
        supply_rate: 0,
        // bRate, need for counting BORROW compound on front
        borrow_rate: 0,
      };

      assetsData.forEach((assetPoolData) => {
        const poolValue = assetPoolData.find((pool: any) => `total_supplied_${item.id}` === pool.key);
        const poolBorrowed = assetPoolData.find((pool: any) => `total_borrowed_${item.id}` === pool.key);
        const ltv = assetPoolData.find((pool: any) => pool.key === 'setup_ltvs')?.value?.split(',');
        const setupTokens = assetPoolData.find((pool: any) => pool.key === 'setup_tokens')?.value?.split(',');
        const selfSupply = assetPoolData.find((pool: any) => pool.key === `${address}_supplied_${item.id}`);
        const selfBorrowed = assetPoolData.find((pool: any) => pool.key === `${address}_borrowed_${item.id}`);

        setupTokens.forEach((token_id: any, key: any) => {
          if (itemData.id === token_id) {
            itemData.setup_ltv = ltv[key] / 10 ** 6;

            if (tokensRatesArr && tokensRatesArr.length) {
              const rates = tokensRatesArr[key];
              const splittedRates = rates.split('|');

              itemData.supply_rate = (Number(splittedRates[0]!) / 10 ** 16).toFixed(8);
              itemData.borrow_rate = (Number(splittedRates[1]!) / 10 ** 16).toFixed(8);
            }
          }
        });

        assetPoolData.forEach((pool: any) => {
          // setup_roi === borrow interest
          if (pool.key === 'setup_interest') {
            itemData.setup_borrow_apr = (pool.value / 10 ** 8) * 365 * 100;
            itemData.setup_interest = pool.value / 10 ** 8;
          }
        });

        if (poolBorrowed) itemData.total_borrow = poolBorrowed.value * itemData.borrow_rate;
        if (poolValue) itemData.total_supply = poolValue.value * itemData.supply_rate;

        if (selfSupply) itemData.self_supply = selfSupply.value * itemData.supply_rate;
        if (selfBorrowed) itemData.self_borrowed = selfBorrowed.value * itemData.borrow_rate;

        console.log(itemData, 'itemData.total_supply');
        const UR = itemData.total_borrow / itemData.total_supply;
        const supplyInterest = itemData.setup_interest * UR;
        const supplyAPY = ((1 + supplyInterest) ** 365 - 1) * 100;
        itemData.setup_supply_apy = supplyAPY.toFixed(5);
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
