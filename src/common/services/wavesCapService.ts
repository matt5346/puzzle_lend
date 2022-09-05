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
  getUserExtraStats: async (userId: string, contractAddress: string): Promise<any> => {
    let userCollateral = 0;

    try {
      const tokensRatesUrl = `http://nodes.wavesnodes.com/utils/script/evaluate/${contractAddress}`;
      const response = await axios(tokensRatesUrl, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        data: {
          expr: `getUserCollateral(false, "${userId}", true)`,
        },
      });
      console.log(response, 'response');
      console.log(contractAddress, 'getUserExtraStats');

      // eslint-disable-next-line no-underscore-dangle
      userCollateral = response?.data?.result?.value?._2?.value;
      // const stringParams = buildUrlParams({
      //   total_suppliers: `.*_supplied_${assetId}`,
      // });

      // const urlSupply = `https://nodes.wavesnodes.com/addresses/data/${contractAddress}?${stringParams}`;
      // const responseAssets = await axios.get(urlSupply);
      // console.log(responseAssets, '.*_supplied_USDN');
      // data = responseAssets.data;
    } catch (err) {
      console.log(err, 'ERR');
    }

    return userCollateral;
  },
  getAssetsStats: async (assetsId: string[]): Promise<IAssetResponse[]> => {
    const params = new URLSearchParams();
    for (let i = 0; i < assetsId.length - 1; i++) {
      params.append('assetIds[]=', assetsId[i]);
    }
    const url = `https://wavescap.com/api/assets-info.php?${params.toString()}`;
    const response = await axios.get(url);
    return response.data.assets != null ? response.data.assets.filter((v: any) => v != null) : [];
  },
  // loading assets data for current pool
  // assetsId: any number of assets
  // address: CURRENT USER
  // contractAddress: contract Address of POOL
  getPoolsStats: async (assetsId: string[], address?: string, contractAddress?: string): Promise<IAssetResponse[]> => {
    const params = new URLSearchParams();
    console.log(contractAddress, 'contractAddress');

    for (let i = 0; i <= assetsId.length - 1; i++) {
      params.append('assetIds[]=', assetsId[i]);
    }
    const url = `https://wavescap.com/api/assets-info.php?${params.toString()}`;
    const response = await axios.get(url);

    let tokensRates: any = {};
    let setupRate: any = {};

    try {
      const tokensRatesUrl = `http://nodes.wavesnodes.com/utils/script/evaluate/${contractAddress}`;

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

    try {
      const tokensInterestUrl = `http://nodes.wavesnodes.com/utils/script/evaluate/${contractAddress}`;
      setupRate = await axios(tokensInterestUrl, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        data: {
          expr: 'calculateTokensInterest(false)',
        },
      });
    } catch (err) {
      console.log(err, 'ERR');
    }

    console.log(tokensRates, 'tokensRates 2');
    // eslint-disable-next-line no-underscore-dangle
    const tokensRatesArr: string[] = tokensRates?.data?.result?.value?._2?.value.split(',');
    // eslint-disable-next-line no-underscore-dangle
    const tokensinterestArr: string[] = setupRate?.data?.result?.value?._2?.value.split(',');
    console.log(tokensRatesArr, 'tokensRatesArr 2');
    console.log(tokensinterestArr, 'tokensinterestArr 2');

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

        const urlSupply = `https://nodes.wavesnodes.com/addresses/data/${contractAddress}?${stringParams}`;
        const responseAssets = await axios.get(urlSupply);
        console.log(responseAssets, 'SUUPLY');
        return { [itemId]: responseAssets.data };
      })
    );
    console.log(response, '----response');

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
        // supply APY/ supply interest
        setup_supply_apy: 0,
        supply_interest: 0,
        // user borrow/supply + daily income
        self_supply: 0,
        self_borrowed: 0,
        self_daily_income: 0,
        self_daily_borrow_interest: 0,
        // sRate, need for counting SUPPLY compound on front
        supply_rate: 0,
        // bRate, need for counting BORROW compound on front
        borrow_rate: 0,
      };

      const assetExtraData = Object.values(assetsData).find((assetItem) => assetItem[item.id]);
      console.log(assetExtraData, '----assetExtraData');

      if (assetExtraData && assetExtraData[item.id]) {
        console.log(assetExtraData[item.id], '----assetExtraData[item.id]');
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

            // same as Rates, passing setup_interest
            // firstly its %, all percents in 6 decimals
            if (tokensinterestArr && +tokensinterestArr[key])
              itemData.setup_interest = +tokensinterestArr[key] / 10 ** 6 / 100;
          }
        });

        assetExtraData[item.id].forEach((pool: any) => {
          // setup_roi === borrow interest
          if (pool.key === 'setup_interest') {
            itemData.setup_borrow_apr = itemData.setup_interest * 365 * 100;
            // itemData.setup_interest = pool.value / 10 ** 8;
          }
        });

        console.log(poolValue, poolBorrowed, itemData.supply_rate, '--poolValue, poolBorrowed---spply');
        console.log(selfSupply, selfBorrowed, itemData.borrow_rate, '--selfSupply, selfBorrowe---spply');
        console.log(
          itemData.name,
          itemData.supply_rate,
          itemData.borrow_rate,
          '--titemData.supply_rate, itemData.borrow_rate----'
        );

        // for simplicity
        // all values gonna be convert to real numbers with decimals only in TEMPLATE
        console.log(poolValue, 'poolValue.setup_interest');
        const currentPrice = new BN(itemData.data?.['lastPrice_usd-n'] ?? 0);
        if (poolValue) itemData.total_supply = poolValue.value * itemData.supply_rate;
        if (poolBorrowed) itemData.total_borrow = poolBorrowed.value * itemData.borrow_rate;

        if (selfSupply) itemData.self_supply = selfSupply.value * itemData.supply_rate;
        if (selfBorrowed) itemData.self_borrowed = selfBorrowed.value * itemData.borrow_rate;

        const UR = itemData.total_borrow / itemData.total_supply;
        const supplyInterest = +itemData.setup_interest * UR;
        const supplyAPY = ((1 + supplyInterest) ** 365 - 1) * 100;

        // borrow daily interest && daily INCOME
        const dailyIncome = supplyInterest * ((itemData.self_supply / 10 ** itemData.precision) * +currentPrice);
        const dailyBorrowInterest =
          supplyInterest * ((itemData.self_borrowed / 10 ** itemData.precision) * +currentPrice);

        console.log(itemData.setup_interest, +currentPrice, 'itemData.setup_interest');
        console.log(supplyInterest, UR, '----supplyInterest, UR');
        console.log(
          dailyIncome,
          itemData.self_supply,
          itemData.precision,
          '----dailyIncome itemData.self_supply, itemData.precision'
        );

        itemData.self_daily_borrow_interest = dailyBorrowInterest || null;
        itemData.self_daily_income = dailyIncome || null;
        itemData.setup_supply_apy = supplyAPY || null;
        itemData.supply_interest = supplyInterest;
      }
      console.log(itemData, '----itemData');

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
