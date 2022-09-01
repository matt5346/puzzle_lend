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
  getTokenStats: async (assetId: string): Promise<any> => {
    console.log(assetId, 'assetId getTokenStats');
    let data = null;
    let userCollateral: any = {};

    try {
      const tokensRatesUrl = 'http://nodes.wavesnodes.com/utils/script/evaluate/3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT';
      userCollateral = await axios(tokensRatesUrl, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        data: {
          expr: 'getUserCollateral(false, "3PAxdDSmN758L5SHSGRC5apEtQE2aApZotG", true)',
        },
      });
      console.log(userCollateral, '.*userCollateral');

      const stringParams = buildUrlParams({
        total_suppliers: `.*_supplied_${assetId}`,
      });

      const urlSupply = `https://nodes.wavesnodes.com/addresses/data/3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT?${stringParams}`;
      const responseAssets = await axios.get(urlSupply);
      console.log(responseAssets, '.*_supplied_USDN');
      data = responseAssets.data;
    } catch (err) {
      console.log(err, 'ERR');
    }

    return data;
  },
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
    console.log(tokensRates, 'tokensRates 1');

    // eslint-disable-next-line no-underscore-dangle
    const tokensRatesArr: string[] = tokensRates?.data?.result?.value?._2?.value.split(',');
    console.log(tokensRatesArr, 'tokensRatesArr 2');

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
        return { [itemId]: responseAssets.data };
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
        // user borrow/supply
        self_supply: 0,
        self_borrowed: 0,
        // sRate, need for counting SUPPLY compound on front
        supply_rate: 0,
        // bRate, need for counting BORROW compound on front
        borrow_rate: 0,
      };

      const assetExtraData = Object.values(assetsData).find((assetItem) => assetItem[item.id]);

      if (assetExtraData && assetExtraData[item.id]) {
        console.log(assetExtraData[item.id], 'assetExtraData[item.id]');

        const poolValue = assetExtraData[item.id].find((pool: any) => `total_supplied_${item.id}` === pool.key);
        const poolBorrowed = assetExtraData[item.id].find((pool: any) => `total_borrowed_${item.id}` === pool.key);
        const ltv = assetExtraData[item.id].find((pool: any) => pool.key === 'setup_ltvs')?.value?.split(',');
        const setupTokens = assetExtraData[item.id].find((pool: any) => pool.key === 'setup_tokens')?.value?.split(',');
        const selfSupply = assetExtraData[item.id].find((pool: any) => pool.key === `${address}_supplied_${item.id}`);
        const selfBorrowed = assetExtraData[item.id].find((pool: any) => pool.key === `${address}_borrowed_${item.id}`);

        // setupTokens and tokensRatesArr have same order
        // so we compare them and searching for ltv and rates
        setupTokens.forEach((token_id: any, key: any) => {
          if (itemData.id === token_id) {
            itemData.setup_ltv = ltv[key] / 10 ** 6;

            if (tokensRatesArr && tokensRatesArr.length) {
              const rates = tokensRatesArr[key];
              const splittedRates = rates.split('|');

              // bRate should be always bigger than sRate
              // bRate/sRate format = 16 decimals which are percents
              // because of it 10 ** 16 (Decimal) and / 100 to get integer for use it later
              itemData.borrow_rate = (Number(splittedRates[0]!) / 10 ** 16).toFixed(8);
              itemData.supply_rate = (Number(splittedRates[1]!) / 10 ** 16).toFixed(8);
            }
          }
        });
        assetExtraData[item.id].forEach((pool: any) => {
          // setup_roi === borrow interest
          if (pool.key === 'setup_interest') {
            itemData.setup_borrow_apr = (pool.value / 10 ** 8) * 365 * 100;
            itemData.setup_interest = pool.value / 10 ** 8;
          }
        });

        console.log(poolValue, poolBorrowed, '--poolValue, poolBorrowed---spply');
        console.log(selfSupply, selfBorrowed, '--selfSupply, selfBorrowe---spply');
        console.log(
          itemData.name,
          itemData.supply_rate,
          itemData.borrow_rate,
          '--titemData.supply_rate, itemData.borrow_rate----'
        );
        // for simplicity
        // all values gonna be convert to real numbers with decimals only in TEMPLATE
        if (poolValue) itemData.total_supply = poolValue.value * itemData.supply_rate;
        if (poolBorrowed) itemData.total_borrow = poolBorrowed.value * itemData.borrow_rate;

        if (selfSupply) itemData.self_supply = selfSupply.value * itemData.supply_rate;
        if (selfBorrowed) itemData.self_borrowed = selfBorrowed.value * itemData.borrow_rate;

        console.log(itemData, 'itemData.total_supply');
        const UR = itemData.total_borrow / itemData.total_supply;
        const supplyInterest = itemData.setup_interest * UR;
        const supplyAPY = ((1 + supplyInterest) ** 365 - 1) * 100;
        itemData.setup_supply_apy = supplyAPY;
      }

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
