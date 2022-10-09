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
      });
    } catch (er) {
      console.log(er, 'error');
    }
  },
  getBorrowSupplyUsers: async (contractAddress: string, assetsId: string[]): Promise<any> => {
    let usersData: any = [];
    const params = new URLSearchParams();

    for (let i = 0; i <= assetsId.length - 1; i++) {
      params.append('assetIds[]=', assetsId[i]);
    }

    const url = `https://wavescap.com/api/assets-info.php?${params.toString()}`;
    const response = await axios.get(url);
    const tokensData = response.data.assets;

    try {
      const userData: any[] = await Promise.all(
        assetsId.map(async (itemId) => {
          const stringParams = buildUrlParams(
            {
              all_borrowers_suppliers: `.*_(supplied%7Cborrowed)_${itemId}`,
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
            const tokenData = tokensData.find((tokenItem: any) => tokenItem.id === keyName);
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
          expr: `getUserCollateral(false, "${userId}", true, "")`,
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
  // address: CURRENT USER
  // contractAddress: contract Address of POOL
  getPoolsStats: async (address?: string, contractAddress?: string): Promise<IAssetResponse[]> => {
    const assetsArrData: any = [];

    let tokensPoolSetup: any = [];
    let tokensRates: any = {};
    let setupRate: any = {};
    let tokensPricesRates: any = {};

    try {
      const stringParams = buildUrlParams({
        setup_tokens: 'setup_tokens',
      });

      const urlSupply = `https://nodes.wavesnodes.com/addresses/data/${contractAddress}?${stringParams}`;
      const responseAssets = await axios.get(urlSupply);
      tokensPoolSetup = responseAssets?.data[0]?.value?.split(',');
    } catch (err) {
      console.log(err, 'ERR');
    }

    tokensPoolSetup.forEach((item: string) => {
      const asset = TOKENS_BY_ASSET_ID[item];
      assetsArrData.push(asset);
    });

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
      tokensPoolSetup.map(async (itemId: string) => {
        const stringParams = buildUrlParams({
          total_supply: `total_supplied_${itemId}`,
          total_borrow: `total_borrowed_${itemId}`,
          setup_roi: 'setup_roi',
          setup_ltvs: 'setup_ltvs',
          setup_lts: 'setup_lts',
          setup_penalties: 'setup_penalties',
          address_supply: `${address}_supplied_${itemId}`,
          address_borrow: `${address}_borrowed_${itemId}`,
        });

        const urlSupply = `https://nodes.wavesnodes.com/addresses/data/${contractAddress}?${stringParams}`;
        const responseAssets = await axios.get(urlSupply);
        return { [itemId]: responseAssets.data };
      })
    );
    console.log(tokensPoolSetup, '----tokensPoolSetup');
    console.log(assetsNodeData, '----assetsNodeData');

    const fullAssetsData = assetsArrData.map((tokenData: any) => {
      const itemData = {
        ...tokenData,
        precision: tokenData.decimals,
        total_supply: BN.ZERO,
        total_borrow: BN.ZERO,
        // penalties/ltv
        setup_penalties: BN.ZERO,
        setup_lts: BN.ZERO,
        // loan to value %
        setup_ltv: BN.ZERO,
        // interest rate for supply/borrow interest
        setup_interest: BN.ZERO,
        // borrow APY
        // todo: change to APY naming
        setup_borrow_apr: BN.ZERO,
        // supply APY/ supply interest
        setup_supply_apy: BN.ZERO,
        supply_interest: BN.ZERO,
        // user borrow/supply + daily income
        self_supply: BN.ZERO,
        self_borrowed: BN.ZERO,
        self_daily_income: BN.ZERO,
        self_daily_borrow_interest: BN.ZERO,
        // sRate, need for counting SUPPLY compound on front
        supply_rate: BN.ZERO,
        // bRate, need for counting BORROW compound on front
        borrow_rate: BN.ZERO,
        // min price for all counting except ->
        // max price only for counting borrow and withdraw
        min_price: BN.ZERO,
        max_price: BN.ZERO,
      };

      const assetExtraData = Object.values(assetsNodeData).find((assetItem) => assetItem[tokenData.assetId]);

      if (assetExtraData && assetExtraData[tokenData.assetId]) {
        const poolValue = assetExtraData[tokenData.assetId].find(
          (pool: any) => `total_supplied_${tokenData.assetId}` === pool.key
        );
        const poolBorrowed = assetExtraData[tokenData.assetId].find(
          (pool: any) => `total_borrowed_${tokenData.assetId}` === pool.key
        );
        const ltv = assetExtraData[tokenData.assetId].find((pool: any) => pool.key === 'setup_ltvs')?.value?.split(',');
        // setupToken is order for Tokens in current pool > [Waves, pluto...]
        // all other rates comparing to it
        const setupTokens = tokensPoolSetup;
        const selfSupply = assetExtraData[tokenData.assetId].find(
          (pool: any) => pool.key === `${address}_supplied_${tokenData.assetId}`
        );
        const selfBorrowed = assetExtraData[tokenData.assetId].find(
          (pool: any) => pool.key === `${address}_borrowed_${tokenData.assetId}`
        );

        const penalties = assetExtraData[tokenData.assetId].find((pool: any) => pool.key === 'setup_penalties')?.value;
        const lts = assetExtraData[tokenData.assetId].find((pool: any) => pool.key === 'setup_lts')?.value;

        // setupTokens and tokensRatesArr have same order
        // so we compare them and searching for ltv and rates
        setupTokens.forEach((token_id: any, key: any) => {
          if (itemData.assetId === token_id) {
            itemData.setup_ltv = BN.formatUnits(ltv[key], 6);

            if (tokensRatesArr && tokensRatesArr.length) {
              const rates = tokensRatesArr[key];
              const splittedRates = rates.split('|');

              // bRate should be always bigger than sRate
              // bRate/sRate format = 16 decimals which are percents
              // because of it 10 ** 16 (Decimal) and / 100 to get integer for use it later
              itemData.borrow_rate = BN.formatUnits(+splittedRates[0], 16);
              itemData.supply_rate = BN.formatUnits(+splittedRates[1], 16);
            }

            if (penalties && penalties.length) {
              const penaltyArr = penalties.split(',');
              const penaltyItem = penaltyArr[key];

              itemData.setup_penalties = BN.formatUnits(penaltyItem, 6);
            }

            if (lts && lts.length) {
              const ltsArr = lts.split(',');
              const ltsItem = ltsArr[key];

              itemData.setup_lts = BN.formatUnits(ltsItem, 6);
            }

            // same as Rates, passing setup_interest
            // firstly its %, all percents in 6 decimals
            console.log(tokensinterestArr, itemData.name, '----tokensinterestArr');
            if (tokensinterestArr && +tokensinterestArr[key])
              itemData.setup_interest = BN.formatUnits(+tokensinterestArr[key], 8);

            // adding ORACLE prices of tokens, price in $ (6 decimals)
            // 0 - min price, 1 - max price
            if (tokensPricesArr && tokensPricesArr[key]) {
              const prices = tokensPricesArr[key].split(',');
              itemData.min_price = BN.formatUnits(prices[0], 6);
              itemData.max_price = BN.formatUnits(prices[1], 6);
            }
          }
        });

        // setup_roi === borrow interest
        if (itemData.setup_interest)
          itemData.setup_borrow_apr = itemData.setup_interest.plus(1).pow(365).minus(1).times(100);

        // for simplicity
        // all values gonna be convert to real numbers with decimals only in TEMPLATE
        if (poolValue) itemData.total_supply = BN.formatUnits(poolValue.value, 0).times(itemData.supply_rate);
        if (poolBorrowed) itemData.total_borrow = BN.formatUnits(poolBorrowed.value, 0).times(itemData.borrow_rate);

        if (selfSupply) itemData.self_supply = BN.formatUnits(selfSupply.value, 0).times(itemData.supply_rate);
        if (selfBorrowed) itemData.self_borrowed = BN.formatUnits(selfBorrowed.value, 0).times(itemData.borrow_rate);

        const UR = BN.formatUnits(itemData.total_borrow, 0).div(itemData.total_supply);
        const supplyInterest = itemData.setup_interest.times(UR);
        // protocol SHARE 20% because of it, .times(0.8)
        const supplyAPY = supplyInterest.plus(1).pow(365).minus(1).times(100).times(0.8);

        // borrow daily interest && daily INCOME
        const supplyFormatted = BN.formatUnits(itemData.self_supply, itemData.precision);
        const borrowFormatted = BN.formatUnits(itemData.self_borrowed, itemData.precision);
        // protocol SHARE 20% because of it, .times(0.8)
        const dailyIncome = supplyFormatted.times(itemData.min_price).times(supplyInterest).times(0.8);
        const dailyBorrowInterest = borrowFormatted.times(itemData.min_price).times(itemData.setup_interest);

        itemData.self_daily_borrow_interest = dailyBorrowInterest;
        itemData.self_daily_income = dailyIncome;
        itemData.setup_supply_apy = supplyAPY;
        itemData.supply_interest = supplyInterest;
      }

      return itemData;
    });
    console.log(fullAssetsData, 'fullAsset');
    return fullAssetsData != null ? fullAssetsData.filter((v: any) => v != null) : [];
  },
};

export default wavesNodesService;
