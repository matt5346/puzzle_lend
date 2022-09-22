/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
import axios from 'axios';
import BN from '@src/common/utils/BN';
import { TOKENS_BY_ASSET_ID } from '@src/common/constants';
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

const wavesNodesService = {
  getAssetUsers: async (contractAddress: string, assetsId: string[]): Promise<any> => {
    let usersData = [];

    try {
      const usersDataResponse: any[] = await Promise.all(
        assetsId.map(async (itemId) => {
          const stringParams = buildUrlParams(
            {
              total_suppliers: `.*_(supplied%7Cborrowed)_${itemId}`,
            },
            'matches'
          );

          const urlSupply = `https://nodes.wavesnodes.com/addresses/data/${contractAddress}?${stringParams}`;
          const responseAssets = await axios.get(urlSupply);
          return { [itemId]: responseAssets.data };
        })
      );

      usersData = usersDataResponse;
    } catch (er) {
      console.log(er, 'error');
    }

    return usersData;
  },
  updateUR: async (contractAddress: string, assetsId: string[]): Promise<any> => {
    try {
      assetsId.forEach(async (item) => {
        const tokensRatesUrl = `http://nodes.wavesnodes.com/utils/script/evaluate/${contractAddress}`;
        const response = await axios(tokensRatesUrl, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          data: {
            expr: `calculateUtilizationRatio("${item}", false)`,
          },
        });
        console.log(response, 'updateUR');
      });
    } catch (er) {
      console.log(er, 'error');
    }
  },
  getBorrowSupplyUsers: async (contractAddress: string, assetsId: string[]): Promise<any> => {
    let usersData: any = [];

    const tokensData: any = [];

    assetsId.forEach((item) => {
      const asset = TOKENS_BY_ASSET_ID[item];
      tokensData.push(asset);
    });

    try {
      const userData: any[] = await Promise.all(
        assetsId.map(async (itemId) => {
          const stringParams = buildUrlParams(
            {
              total_suppliers: `.*_(supplied%7Cborrowed)_${itemId}`,
            },
            'matches'
          );

          const urlSupply = `https://nodes.wavesnodes.com/addresses/data/${contractAddress}?${stringParams}`;
          const responseAssets = await axios.get(urlSupply);
          return { [itemId]: responseAssets.data };
        })
      );
      const users: any = [];

      assetsId.map((item) => {
        const val: any = {
          [item]: [],
        };

        const assetData: Record<string, any[]> = userData.find(
          (userDataItem: any) => Object.keys(userDataItem)[0] === item
        );

        Object.entries(assetData).forEach(([keyName, objData]) => {
          const suppliedUsers: any = [];
          const borrowedUsers: any = [];

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          objData!.forEach((userObj: any) => {
            const userDataObj = {
              owner: null,
              supplied: 0,
              borrowed: 0,
              poolContract: '',
            };

            const objDataSplitted = userObj.key.split('_');
            const tokenData = tokensData.find((tokenItem: any) => tokenItem.assetId === keyName);
            const currentPrice = new BN(tokenData.data?.['lastPrice_usd-n'] ?? 0);
            let userIndex = -1;
            if (users && users.length)
              userIndex = users.map((itemObj: any) => itemObj.owner).indexOf(objDataSplitted[0]);

            userDataObj.owner = objDataSplitted[0];
            userDataObj.poolContract = contractAddress;

            // counting TOTAL SUPPLY for user in dollars
            if (objDataSplitted[1] === 'supplied') {
              userDataObj.supplied = (userObj.value / 10 ** tokenData.precision) * +currentPrice;
              suppliedUsers.push(userDataObj);

              if (userIndex >= 0) {
                users[userIndex].supplied += (userObj.value / 10 ** tokenData.precision) * +currentPrice;
              } else {
                users.push(userDataObj);
              }
            }

            // counting TOTAL BORROW for user in dollars
            if (objDataSplitted[1] === 'borrowed') {
              userDataObj.borrowed = (userObj.value / 10 ** tokenData.precision) * +currentPrice;
              borrowedUsers.push(userDataObj);

              if (users && users.length && userIndex >= 0) {
                users[userIndex].borrowed += (userObj.value / 10 ** tokenData.precision) * +currentPrice;
              } else {
                users.push(userDataObj);
              }
            }
          });

          val[item] = {
            suppliedUsers,
            borrowedUsers,
          };
        });

        return val;
      });
      usersData = users;
      // eslint-disable-next-line no-underscore-dangle
      // data = responseAssets.data;
    } catch (err) {
      console.log(err, 'ERR');
    }

    return usersData;
  },
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

      // eslint-disable-next-line no-underscore-dangle
      userCollateral = response?.data?.result?.value?._2?.value;
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
    let response: any = [];

    try {
      const url = `https://wavescap.com/api/assets-info.php?${params.toString()}`;
      response = await axios.get(url);
    } catch (err) {
      console.log(err, 'ERR');
    }

    return response.data.assets != null ? response.data.assets.filter((v: any) => v != null) : [];
  },
  // loading assets data for current pool
  // assetsId: any number of assets
  // address: CURRENT USER
  // contractAddress: contract Address of POOL
  getPoolsStats: async (assetsId: string[], address?: string, contractAddress?: string): Promise<IAssetResponse[]> => {
    const assetsArrData: any = [];

    assetsId.forEach((item) => {
      const asset = TOKENS_BY_ASSET_ID[item];
      assetsArrData.push(asset);
    });

    let tokensRates: any = {};
    let setupRate: any = {};
    let tokensPricesRates: any = {};

    try {
      const tokensRatesUrl = `http://nodes.wavesnodes.com/utils/script/evaluate/${contractAddress}`;

      // for counting supply/borrow interest on each token
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

      // getting setup interest on each token
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

    try {
      const tokensRatesUrl = `http://nodes.wavesnodes.com/utils/script/evaluate/${contractAddress}`;
      tokensPricesRates = await axios(tokensRatesUrl, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        data: {
          expr: `getPrices(false)`,
        },
      });
    } catch (err) {
      console.log(err, 'ERR');
    }
    const tokensRatesArr: string[] = tokensRates?.data?.result?.value?._2?.value.split(',');
    const tokensinterestArr: string[] = setupRate?.data?.result?.value?._2?.value.split(',');
    const tokensPricesArr: string[] = tokensPricesRates?.data?.result?.value?._2?.value.split('|');

    const assetsNodeData = await Promise.all(
      assetsId.map(async (itemId) => {
        const stringParams = buildUrlParams({
          total_supply: `total_supplied_${itemId}`,
          total_borrow: `total_borrowed_${itemId}`,
          setup_roi: 'setup_roi',
          setup_ltvs: 'setup_ltvs',
          setup_lts: 'setup_lts',
          setup_penalties: 'setup_penalties',
          setup_tokens: 'setup_tokens',
          setup_interest: 'setup_interest',
          address_supply: `${address}_supplied_${itemId}`,
          address_borrow: `${address}_borrowed_${itemId}`,
        });

        const urlSupply = `https://nodes.wavesnodes.com/addresses/data/${contractAddress}?${stringParams}`;
        const responseAssets = await axios.get(urlSupply);
        return { [itemId]: responseAssets.data };
      })
    );

    const fullAssetsData = assetsArrData.map((tokenData: any) => {
      const itemData = {
        ...tokenData,
        precision: tokenData.decimals,
        total_supply: 0,
        total_borrow: 0,
        // penalties/ltv
        setup_penalties: 0,
        setup_lts: 0,
        // loan to value %
        setup_ltv: 0,
        // interest rate for supply/borrow interest
        setup_interest: 0,
        // borrow APY
        // todo: change to Apy naming
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
        // min price for all counting except ->
        // max price only for counting borrow and withdraw
        min_price: 0,
        max_price: 0,
      };

      const assetExtraData = Object.values(assetsNodeData).find((assetItem) => assetItem[tokenData.assetId]);
      console.log(assetExtraData, assetsNodeData, 'assetExtraData');

      if (assetExtraData && assetExtraData[tokenData.assetId]) {
        console.log(assetExtraData[tokenData.assetId], '1');
        const poolValue = assetExtraData[tokenData.assetId].find(
          (pool: any) => `total_supplied_${tokenData.assetId}` === pool.key
        );
        const poolBorrowed = assetExtraData[tokenData.assetId].find(
          (pool: any) => `total_borrowed_${tokenData.assetId}` === pool.key
        );
        const ltv = assetExtraData[tokenData.assetId].find((pool: any) => pool.key === 'setup_ltvs')?.value?.split(',');
        // setupToken is order for Tokens in current pool > [Waves, pluto...]
        // all other rates comparing to it
        const setupTokens = assetExtraData[tokenData.assetId]
          .find((pool: any) => pool.key === 'setup_tokens')
          ?.value?.split(',');
        const selfSupply = assetExtraData[tokenData.assetId].find(
          (pool: any) => pool.key === `${address}_supplied_${tokenData.assetId}`
        );
        const selfBorrowed = assetExtraData[tokenData.assetId].find(
          (pool: any) => pool.key === `${address}_borrowed_${tokenData.assetId}`
        );

        const penalties = assetExtraData[tokenData.assetId].find((pool: any) => pool.key === 'setup_penalties')?.value;
        const lts = assetExtraData[tokenData.assetId].find((pool: any) => pool.key === 'setup_lts')?.value;
        console.log(penalties, '----penalties');

        // setupTokens and tokensRatesArr have same order
        // so we compare them and searching for ltv and rates
        setupTokens.forEach((token_id: any, key: any) => {
          if (itemData.assetId === token_id) {
            itemData.setup_ltv = ltv[key] / 10 ** 6;

            if (tokensRatesArr && tokensRatesArr.length) {
              const rates = tokensRatesArr[key];
              const splittedRates = rates.split('|');

              // bRate should be always bigger than sRate
              // bRate/sRate format = 16 decimals which are percents
              // because of it 10 ** 16 (Decimal) and / 100 to get integer for use it later
              itemData.borrow_rate = +(Number(splittedRates[0]!) / 10 ** 16).toFixed(8);
              itemData.supply_rate = +(Number(splittedRates[1]!) / 10 ** 16).toFixed(8);
            }

            if (penalties && penalties.length) {
              const penaltyArr = penalties.split(',');
              const penaltyItem = penaltyArr[key];

              itemData.setup_penalties = +penaltyItem / 10 ** 6;
            }

            if (lts && lts.length) {
              const ltsArr = lts.split(',');
              const ltsItem = ltsArr[key];

              itemData.setup_lts = +ltsItem / 10 ** 6;
            }

            // same as Rates, passing setup_interest
            // firstly its %, all percents in 6 decimals
            if (tokensinterestArr && +tokensinterestArr[key])
              itemData.setup_interest = +tokensinterestArr[key] / 10 ** 6 / 100;

            // adding ORACLE prices of tokens, price in $ (6 decimals)
            // 0 - min price, 1 - max price
            if (tokensPricesArr && tokensPricesArr[key]) {
              const prices = tokensPricesArr[key].split(',');
              itemData.min_price = +prices[0] / 10 ** 6;
              itemData.max_price = +prices[1] / 10 ** 6;
            }
          }
        });

        assetExtraData[tokenData.assetId].forEach((pool: any) => {
          // setup_roi === borrow interest
          if (pool.key === 'setup_interest') {
            itemData.setup_borrow_apr = ((1 + itemData.setup_interest) ** 365 - 1) * 100;
          }
        });

        // debug, remove later
        // console.log(poolValue, poolBorrowed, itemData.supply_rate, '--poolValue, poolBorrowed---spply');
        // console.log(selfSupply, selfBorrowed, itemData.borrow_rate, '--selfSupply, selfBorrowe---spply');
        // console.log(
        //   itemData.name,
        //   itemData.supply_rate,
        //   itemData.borrow_rate,
        //   '--titemData.supply_rate, itemData.borrow_rate----'
        // );

        console.log(poolValue, 'poolValue');
        // for simplicity
        // all values gonna be convert to real numbers with decimals only in TEMPLATE
        if (poolValue) itemData.total_supply = poolValue.value * itemData.supply_rate;
        if (poolBorrowed) itemData.total_borrow = poolBorrowed.value * itemData.borrow_rate;

        if (selfSupply) itemData.self_supply = selfSupply.value * +itemData.supply_rate;
        if (selfBorrowed) itemData.self_borrowed = selfBorrowed.value * +itemData.borrow_rate;

        const UR = itemData.total_borrow / itemData.total_supply;
        const supplyInterest = +itemData.setup_interest * UR;
        const supplyAPY = ((1 + supplyInterest) ** 365 - 1) * 100;

        // borrow daily interest && daily INCOME
        const dailyIncome = supplyInterest * ((itemData.self_supply / 10 ** itemData.precision) * +itemData.min_price);
        const dailyBorrowInterest =
          +itemData.setup_interest * ((itemData.self_borrowed / 10 ** itemData.precision) * +itemData.min_price);

        itemData.self_daily_borrow_interest = dailyBorrowInterest || null;
        itemData.self_daily_income = dailyIncome || null;
        itemData.setup_supply_apy = supplyAPY || null;
        itemData.supply_interest = supplyInterest;
      }

      return itemData;
    });
    console.log(fullAssetsData, 'fullAsset');
    return fullAssetsData != null ? fullAssetsData.filter((v: any) => v != null) : [];
  },
};

export default wavesNodesService;
