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

    const assetsData = await Promise.all(
      assetsId.map(async (itemId) => {
        // todo: pass pools
        const stringParams = buildUrlParams({
          total_supply: `total_supplied_${itemId}`,
          setup_roi: 'setup_roi',
          setup_ltvs: 'setup_ltvs',
          setup_tokens: 'setup_tokens',
          address_supply: `${address}_supplied_${itemId}`,
          address_borrow: `${address}_borrowed_${itemId}`,
        });
        console.log(stringParams, 'PARAMS');

        const urlSupply = `https://nodes.wavesnodes.com/addresses/data/3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT?${stringParams}`;
        const responseAssets = await axios.get(urlSupply);
        console.log(responseAssets, 'SUUPLY');
        return responseAssets.data;
      })
    );

    const fullAssetsData = response.data.assets.map((item: any) => {
      const itemData = {
        ...item,
        total_lend_supply: 0,
        setup_ltv: 0,
        setup_roi: 0,
        self_supply: 0,
        self_borrowed: 0,
      };

      assetsData.forEach((assetPoolData) => {
        console.log(assetPoolData, 'assetPoolData');
        const poolValue = assetPoolData.find((pool: any) => `total_supplied_${item.id}` === pool.key);
        const ltv = assetPoolData.find((pool: any) => pool.key === 'setup_ltvs')?.value?.split(',');
        const setupTokens = assetPoolData.find((pool: any) => pool.key === 'setup_tokens')?.value?.split(',');
        const selfSupply = assetPoolData.find((pool: any) => pool.key === `${address}_supplied_${item.id}`);
        const selfBorrowed = assetPoolData.find((pool: any) => pool.key === `${address}_borrowed_${item.id}`);

        setupTokens.forEach((token_id: any, key: any) => {
          if (itemData.id === token_id) itemData.setup_ltv = `${ltv[key] / 10000}%`;
        });

        assetPoolData.forEach((pool: any) => {
          if (pool.key === 'setup_roi') {
            itemData.setup_roi = `${pool.value / 10000}%`;
          }
        });

        if (selfSupply) itemData.self_supply = selfSupply.value;
        if (selfBorrowed) itemData.self_borrowed = selfBorrowed.value;
        if (poolValue) itemData.total_lend_supply = poolValue.value;
        if (ltv) itemData.setup_ltvs = `${(Number(ltv[0]) / Number(ltv[1])) * 100}%`;
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
