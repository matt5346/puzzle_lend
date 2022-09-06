/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import GridTable from '@src/common/styles/GridTable';
import Card from '@src/common/styles/Card';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import { IToken, TTokenStatistics } from '@src/common/constants';
import DesktopTokenTableRow from '@src/components/Dashboard/tables/DesktopTokenTableRow';
import BN from '@src/common/utils/BN';

import { ReactComponent as SortDownIcon } from '@src/common/assets/icons/sortDown.svg';
import { ReactComponent as NotFoundIcon } from '@src/common/assets/icons/notFound.svg';

interface IProps {
  filteredTokens: IToken[];
  handleSupplyAssetClick: (assetId: string, step: number) => void;
}

const TableTitle: React.FC<{
  sort: boolean;
  mode: 'descending' | 'ascending';
  onClick: () => void;
}> = ({ sort, mode, onClick, children }) => (
  <Row
    alignItems="center"
    justifyContent="flex-end"
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

const Root = styled.div`
  display: flex;
  align-items: center;
`;

const AllAssetsTable: React.FC<IProps> = ({ filteredTokens, handleSupplyAssetClick }) => {
  const [sort, setActiveSort] = useState<'totalAssetSupply' | 'setupSupplyAPY' | 'totalAssetBorrow' | 'setupBorrowAPR'>(
    'totalAssetSupply'
  );
  const [sortMode, setActiveSortMode] = useState<'descending' | 'ascending'>('descending');
  const { tokenStore } = useStores();
  const [sortedTokens, setSortedTokens] = useState<IToken[]>([]);

  const selectSort = (v: 'totalAssetSupply' | 'setupSupplyAPY' | 'totalAssetBorrow' | 'setupBorrowAPR') => {
    if (sort === v) {
      setActiveSortMode(sortMode === 'ascending' ? 'descending' : 'ascending');
    } else {
      setActiveSort(v);
      setActiveSortMode('descending');
    }
  };

  useEffect(() => {
    const data = filteredTokens.sort((a, b) => {
      const stats1: TTokenStatistics | undefined = tokenStore.poolDataTokensWithStats[a.assetId];
      const stats2: TTokenStatistics | undefined = tokenStore.poolDataTokensWithStats[b.assetId];
      let key: keyof TTokenStatistics | undefined;
      if (sort === 'totalAssetSupply') key = 'totalAssetSupply';
      if (sort === 'setupSupplyAPY') key = 'setupSupplyAPY';
      if (sort === 'totalAssetBorrow') key = 'totalAssetBorrow';
      if (sort === 'setupBorrowAPR') key = 'setupBorrowAPR';
      if (key == null) return 0;

      if (stats1 == null && stats2 == null) return 0;
      if (stats1[key] == null && stats2[key] != null) {
        return sortMode === 'descending' ? 1 : -1;
      }
      if (stats1[key] == null && stats2[key] == null) {
        return sortMode === 'descending' ? -1 : 1;
      }
      return sortMode === 'descending'
        ? BN.formatUnits(stats1[key], 0).lt(stats2[key])
          ? 1
          : -1
        : BN.formatUnits(stats1[key], 0).lt(stats2[key])
        ? -1
        : 1;
    });
    setSortedTokens(data);
  }, [filteredTokens, sort, sortMode, tokenStore.poolDataTokensWithStats]);

  return (
    <Card style={{ padding: 0, overflow: 'auto' }} justifyContent="center">
      <GridTable
        style={{ width: 'fit-content', minWidth: '100%' }}
        desktopTemplate="2fr 1fr 1fr 1fr 1fr 2fr"
        mobileTemplate="2fr 1fr">
        <div className="gridTitle">
          <div>Asset</div>
          <TableTitle onClick={() => selectSort('totalAssetSupply')} mode={sortMode} sort={sort === 'totalAssetSupply'}>
            Total supply
          </TableTitle>
          <TableTitle onClick={() => selectSort('setupSupplyAPY')} mode={sortMode} sort={sort === 'setupSupplyAPY'}>
            Supply APY
          </TableTitle>
          <TableTitle onClick={() => selectSort('totalAssetBorrow')} mode={sortMode} sort={sort === 'totalAssetBorrow'}>
            Total borrow
          </TableTitle>
          <TableTitle onClick={() => selectSort('setupBorrowAPR')} mode={sortMode} sort={sort === 'setupBorrowAPR'}>
            Borrow APR
          </TableTitle>
        </div>
        {sortedTokens.length === 0 && (
          <Column justifyContent="center" alignItems="center" crossAxisSize="max">
            <SizedBox height={24} />
            <NotFoundIcon style={{ marginBottom: 24 }} />
            <Text className="text" textAlign="center">
              Unfortunately, there are no tokens that fit your filters.
            </Text>
            <SizedBox height={24} />
          </Column>
        )}
        {sortedTokens.map((t) => {
          const stats = tokenStore.poolDataTokensWithStats[t.assetId];

          if (stats) {
            return (
              <DesktopTokenTableRow
                isUserStats={false}
                token={t}
                key={t.assetId}
                rate={stats.currentPrice}
                setupBorrowAPR={stats.setupBorrowAPR}
                setupSupplyAPY={stats.setupSupplyAPY}
                totalSupply={stats.totalAssetSupply}
                totalBorrow={stats.totalAssetBorrow}
                handleSupplyAssetClick={handleSupplyAssetClick}
              />
            );
          }

          return null;
        })}
      </GridTable>
    </Card>
  );
};

export default observer(AllAssetsTable);