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
import { ReactComponent as SortDownIcon } from '@src/common/assets/icons/sortDown.svg';
import { ReactComponent as NotFoundIcon } from '@src/common/assets/icons/notFound.svg';
import DesktopTokenTableRow from '@src/pages/dashboard/DesktopTokenTableRow';
import { useDashboardVM } from '@src/pages/dashboard/DashboardVm';
import DashboardModal from '@src/pages/dashboard/modal';

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

const TableTitle: React.FC<{
  sort: boolean;
  mode: 'descending' | 'ascending';
  onClick: () => void;
}> = ({ sort, mode, onClick, children }) => (
  <Row
    alignItems="center"
    onClick={onClick}
    style={{
      userSelect: 'none',
      cursor: 'pointer',
      ...(sort ? { color: '#363870' } : {}),
    }}>
    <div>{children}</div>
    {sort && mode === 'descending' && <SortDownIcon style={{ marginLeft: 8 }} />}
    {sort && mode === 'ascending' && <SortDownIcon style={{ marginLeft: 8, transform: 'scale(1, -1)' }} />}
  </Row>
);

const DashboardTable: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const [filteredTokens, setFilteredTokens] = useState<IToken[]>([]);
  const vm = useDashboardVM();

  const [sort, setSort] = useState<'supplyapy' | 'supply' | 'borrow' | 'ltv' | 'borrowapr'>('supplyapy');
  const [sortMode, setSortMode] = useState<'descending' | 'ascending'>('descending');
  const { tokenStore, accountStore } = useStores();

  const selectSort = (v: 'supplyapy' | 'supply' | 'borrow' | 'ltv' | 'borrowapr') => {
    if (sort === v) {
      setSortMode(sortMode === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSort(v);
      setSortMode('descending');
    }
  };

  const handleSupplyAssetClick = (assetId: string, step: number) => {
    lendStore.setDashboardModalOpened(true, assetId, step);
  };

  useMemo(() => {
    const data = vm.assetsWithStats;
    setFilteredTokens(data);
  }, [
    accountStore.assetBalances,
    sort,
    sortMode,
    tokenStore.statisticsByAssetId,
    vm.assetsWithStats,
    vm.tokenCategoryFilter,
    vm.tokenNameFilter,
    vm.tokenUserFilter,
  ]);

  return (
    <Root>
      <Text margin="0 0 10px 0">All assets</Text>
      <Card style={{ padding: 0, overflow: 'auto' }} justifyContent="center">
        <GridTable
          style={{ width: 'fit-content', minWidth: '100%' }}
          desktopTemplate="2fr 0.5fr 1fr 1fr 1fr 1fr 1fr"
          mobileTemplate="2fr 1fr">
          <div className="gridTitle">
            <div>Asset</div>
            <TableTitle onClick={() => selectSort('ltv')} mode={sortMode} sort={sort === 'ltv'}>
              LTV
            </TableTitle>
            <TableTitle onClick={() => selectSort('supply')} mode={sortMode} sort={sort === 'supply'}>
              Total supply
            </TableTitle>
            <TableTitle onClick={() => selectSort('supplyapy')} mode={sortMode} sort={sort === 'supplyapy'}>
              Supply APY
            </TableTitle>
            <TableTitle onClick={() => selectSort('borrow')} mode={sortMode} sort={sort === 'borrow'}>
              Total borrow
            </TableTitle>
            <TableTitle onClick={() => selectSort('borrowapr')} mode={sortMode} sort={sort === 'borrowapr'}>
              Borrow APR
            </TableTitle>
          </div>
          {filteredTokens.length === 0 && (
            <Column justifyContent="center" alignItems="center" crossAxisSize="max">
              <SizedBox height={24} />
              <NotFoundIcon style={{ marginBottom: 24 }} />
              <Text className="text" textAlign="center">
                Unfortunately, there are no tokens that fit your filters.
              </Text>
              <SizedBox height={24} />
            </Column>
          )}
          {filteredTokens.map((t) => {
            const stats = tokenStore.statisticsByAssetId[t.assetId];
            console.log(stats, 'STATS');
            return (
              <DesktopTokenTableRow
                token={t}
                key={t.assetId}
                rate={stats.currentPrice}
                setupBorrowAPR={stats.setupBorrowAPR}
                setupSupplyAPY={stats.setupSupplyAPY}
                setupLtv={stats.setupLtv}
                totalSupply={stats.totalPoolSupply}
                totalBorrow={stats.totalPoolBorrow}
                handleSupplyAssetClick={handleSupplyAssetClick}
              />
            );
          })}
        </GridTable>
      </Card>
      <DashboardModal
        filteredTokens={filteredTokens}
        onClose={() => lendStore.setDashboardModalOpened(false, '', 0)}
        visible={lendStore.dashboardModalOpened}
      />
    </Root>
  );
};

export default observer(DashboardTable);
