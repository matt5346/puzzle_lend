import axios from 'axios';
import BN from '@src/common/utils/BN';

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
  getAssetsStats: async (assetsId: string[]): Promise<IAssetResponse[]> => {
    const params = new URLSearchParams();
    for (let i = 0; i < assetsId.length - 1; i++) {
      params.append('assetIds[]=', assetsId[i]);
    }
    const url = `https://wavescap.com/api/assets-info.php?${params.toString()}`;

    const assetsData = await Promise.all(
      assetsId.map(async (itemId) => {
        // todo: pass pools
        const urlSupply = `https://nodes.wavesnodes.com/addresses/data/3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT?key=total_supplied_${itemId}&key=setup_roi`;
        const response = await axios.get(urlSupply);
        return response.data;
      })
    );

    const response = await axios.get(url);

    const fullAssetsData = response.data.assets.map((item: any) => {
      const itemData = {
        ...item,
        total_lend_supply: 0,
      };

      assetsData.forEach((assetPoolData) => {
        const poolValue = assetPoolData.find((pool: any) => `total_supplied_${item.id}` === pool.key);
        if (poolValue) itemData.total_lend_supply = poolValue.value;
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
