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
import { useExploreVM } from '@src/pages/dashboard/DashboardVm';

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
      ...(sort ? { color: '#fff' } : {}),
    }}>
    <div>{children}</div>
    {sort && mode === 'descending' && <SortDownIcon style={{ marginLeft: 8 }} />}
    {sort && mode === 'ascending' && <SortDownIcon style={{ marginLeft: 8, transform: 'scale(1, -1)' }} />}
  </Row>
);

const DashboardTable: React.FC<IProps> = () => {
  const [filteredTokens, setFilteredTokens] = useState<IToken[]>([]);
  const vm = useExploreVM();

  const [sort, setSort] = useState<'price' | 'change' | 'volume'>('change');
  const [sortMode, setSortMode] = useState<'descending' | 'ascending'>('descending');
  const { tokenStore, accountStore } = useStores();

  const selectSort = (v: 'price' | 'change' | 'volume') => {
    if (sort === v) {
      setSortMode(sortMode === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSort(v);
      setSortMode('descending');
    }
  };

  const handleWatchListChange = (assetId: string) => {
    const tokenStatus = tokenStore.watchList.includes(assetId);
    if (tokenStatus) {
      tokenStore.removeFromWatchList(assetId);
      // notificationStore.notify(watchListText, {
      //   type: 'info',
      //   title: `${TOKENS_BY_ASSET_ID[assetId].symbol} has been removed to the watchlist`,
      // });
    } else {
      tokenStore.addToWatchList(assetId);
      // notificationStore.notify(watchListText, {
      //   type: 'success',
      //   title: `${TOKENS_BY_ASSET_ID[assetId].symbol} has been added to the watchlist`,
      // });
    }
  };
  console.log(vm, 'VMMMM');

  useMemo(() => {
    console.log(vm.assetsWithStats, 'VMMMM');
    const data = vm.assetsWithStats;
    console.log(data, 'data');
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
      <Card style={{ padding: 0, overflow: 'auto', maxWidth: 'calc(100vw - 32px)' }} justifyContent="center">
        <GridTable
          style={{ width: 'fit-content', minWidth: '100%' }}
          desktopTemplate="3fr 1fr 1fr 1fr"
          mobileTemplate="2fr 1fr">
          <div className="gridTitle">
            <div>Token name</div>
            <TableTitle onClick={() => selectSort('price')} mode={sortMode} sort={sort === 'price'}>
              Price
            </TableTitle>
            <TableTitle onClick={() => selectSort('volume')} mode={sortMode} sort={sort === 'volume'}>
              Volume (24h)
            </TableTitle>
          </div>
          {filteredTokens.length === 0 && (
            <Column justifyContent="center" alignItems="center" crossAxisSize="max">
              <SizedBox height={24} />
              <NotFoundIcon style={{ marginBottom: 24 }} />
              <Text type="secondary" className="text" textAlign="center">
                Unfortunately, there are no tokens that fit your filters.
              </Text>
              <SizedBox height={24} />
            </Column>
          )}
          {filteredTokens.map((t) => {
            const stats = tokenStore.statisticsByAssetId[t.assetId];
            return (
              <DesktopTokenTableRow
                token={t}
                vol24={stats?.volume24}
                key={t.assetId}
                rate={stats.currentPrice}
                handleWatchListChange={handleWatchListChange}
              />
            );
          })}
        </GridTable>
      </Card>
    </Root>
  );
};

export default observer(DashboardTable);
