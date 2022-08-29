/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import GridTable from '@src/common/styles/GridTable';
import Card from '@src/common/styles/Card';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import { IToken } from '@src/common/constants';
import { useDashboardVM } from '@src/pages/dashboard/DashboardVm';
import DashboardModal from '@src/pages/dashboard/modal';
import AllAssetsTable from '@src/pages/dashboard/tables/AllAssetsTable';
import MyBorrowTable from '@src/pages/dashboard/tables/MyBorrowTable';
import MySupplyTable from '@src/pages/dashboard/tables/MySupplyTable';

// for some time
export enum TokenCategoriesEnum {
  all = 0,
  global = 1,
  stable = 2,
  defi = 3,
  ducks = 4,
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const DashboardTable: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const [filteredTokens, setFilteredTokens] = useState<IToken[]>([]);
  const [showBorrow, showBorrowTable] = useState<boolean>(false);
  const [showSupply, showSupplyTable] = useState<boolean>(false);
  const vm = useDashboardVM();

  const { tokenStore, accountStore } = useStores();

  const handleSupplyAssetClick = (assetId: string, step: number) => {
    lendStore.setDashboardModalOpened(true, assetId, step);
  };

  useMemo(() => {
    const data = vm.assetsWithStats;

    data.forEach((t) => {
      const stats = tokenStore.statisticsByAssetId[t.assetId];
      console.log(stats, '====STATS-');

      if (showBorrow === false && Number(stats.selfBorrow) > 0) {
        showBorrowTable(true);
      }

      if (showBorrow === false && Number(stats.selfSupply) > 0) {
        showSupplyTable(true);
      }
    });

    setFilteredTokens(data);
  }, [
    accountStore.assetBalances,
    tokenStore.statisticsByAssetId,
    vm.assetsWithStats,
    vm.tokenCategoryFilter,
    vm.tokenNameFilter,
    vm.tokenUserFilter,
  ]);

  return (
    <Root>
      {showSupply ? (
        <Wrap>
          <Text margin="0 0 10px 0">My supply</Text>
          <MySupplyTable filteredTokens={filteredTokens} handleSupplyAssetClick={handleSupplyAssetClick} />
        </Wrap>
      ) : null}
      {showBorrow ? (
        <Wrap>
          <Text margin="10px 0">My borrow</Text>
          <MyBorrowTable filteredTokens={filteredTokens} handleSupplyAssetClick={handleSupplyAssetClick} />
        </Wrap>
      ) : null}
      <Text margin="10px 0">All assets</Text>
      <AllAssetsTable filteredTokens={filteredTokens} handleSupplyAssetClick={handleSupplyAssetClick} />
      <DashboardModal
        filteredTokens={filteredTokens}
        onClose={() => lendStore.setDashboardModalOpened(false, '', lendStore.dashboardModalStep)}
        visible={lendStore.dashboardModalOpened}
      />
    </Root>
  );
};

export default observer(DashboardTable);
