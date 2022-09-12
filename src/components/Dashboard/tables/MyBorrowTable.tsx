/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@src/stores';
import GridTable from '@src/common/styles/GridTable';
import Card from '@src/common/styles/Card';
import MobileCardsWrap from '@src/common/styles/MobileCardsWrap';
import { Row, Column } from '@src/common/styles/Flex';
import { IToken, TTokenStatistics } from '@src/common/constants';
import { ReactComponent as SortDownIcon } from '@src/common/assets/icons/sortDown.svg';
import DesktopTokenTableRow from '@src/components/Dashboard/tables/DesktopTokenTableRow';
import MobileTokenTableRow from '@src/components/Dashboard/tables/MobileTokenTableRow';
import useWindowSize from '@src/hooks/useWindowSize';
import BN from '@src/common/utils/BN';

interface IProps {
  filteredTokens: IToken[];
  isUserStats: boolean;
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

const MyBorrowTable: React.FC<IProps> = ({ filteredTokens, handleSupplyAssetClick, isUserStats }) => {
  const { windowWidth } = useWindowSize();
  const [sort, setSort] = useState<'selfBorrow' | 'setupBorrowAPR' | 'selfDailyBorrowInterest'>('selfBorrow');
  const [sortMode, setSortMode] = useState<'descending' | 'ascending'>('descending');
  const { tokenStore } = useStores();
  const [sortedTokens, setSortedTokens] = useState<IToken[]>([]);

  const selectSort = (v: 'selfBorrow' | 'setupBorrowAPR' | 'selfDailyBorrowInterest') => {
    if (sort === v) {
      setSortMode(sortMode === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSort(v);
      setSortMode('descending');
    }
  };

  useEffect(() => {
    const data = filteredTokens.sort((a, b) => {
      const stats1: TTokenStatistics | undefined = tokenStore.poolDataTokensWithStats[a.assetId];
      const stats2: TTokenStatistics | undefined = tokenStore.poolDataTokensWithStats[b.assetId];
      let key: keyof TTokenStatistics | undefined;
      if (sort === 'selfBorrow') key = 'selfBorrow';
      if (sort === 'setupBorrowAPR') key = 'setupBorrowAPR';
      if (sort === 'selfDailyBorrowInterest') key = 'selfDailyBorrowInterest';
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
    <>
      {windowWidth! > 880 ? (
        <Card style={{ padding: 0, overflow: 'auto' }} justifyContent="center">
          <GridTable
            style={{ width: 'fit-content', minWidth: '100%' }}
            desktopTemplate={isUserStats ? '5fr 2fr 2fr 2.5fr' : '5fr 2fr 2fr 2.5fr 4fr'}
            mobileTemplate="2fr 1fr">
            <div className="gridTitle">
              <div>Asset</div>
              <TableTitle onClick={() => selectSort('selfBorrow')} mode={sortMode} sort={sort === 'selfBorrow'}>
                To be repaid
              </TableTitle>
              <TableTitle onClick={() => selectSort('setupBorrowAPR')} mode={sortMode} sort={sort === 'setupBorrowAPR'}>
                Borrow APY
              </TableTitle>
              <TableTitle
                onClick={() => selectSort('selfDailyBorrowInterest')}
                mode={sortMode}
                sort={sort === 'selfDailyBorrowInterest'}>
                Daily loan interest
              </TableTitle>
            </div>
            {sortedTokens &&
              sortedTokens.length &&
              sortedTokens.map((t) => {
                const stats = tokenStore.poolDataTokensWithStats[t.assetId];

                if (stats && Number(stats.selfBorrow) > 0) {
                  return (
                    <DesktopTokenTableRow
                      isUserStats={isUserStats}
                      token={t}
                      key={t.assetId}
                      rate={stats.currentPrice}
                      selfBorrow={stats.selfBorrow}
                      setupBorrowAPR={stats.setupBorrowAPR}
                      selfDailyBorrowInterest={stats.selfDailyBorrowInterest}
                      handleSupplyAssetClick={handleSupplyAssetClick}
                    />
                  );
                }

                return null;
              })}
          </GridTable>
        </Card>
      ) : (
        <MobileCardsWrap>
          {sortedTokens &&
            sortedTokens.length &&
            sortedTokens.map((t) => {
              const stats = tokenStore.poolDataTokensWithStats[t.assetId];

              if (stats && Number(stats.selfBorrow) > 0) {
                return (
                  <MobileTokenTableRow
                    isUserStats={isUserStats}
                    token={t}
                    key={t.assetId}
                    rate={stats.currentPrice}
                    selfBorrow={stats.selfBorrow}
                    setupBorrowAPR={stats.setupBorrowAPR}
                    selfDailyBorrowInterest={stats.selfDailyBorrowInterest}
                    handleSupplyAssetClick={handleSupplyAssetClick}
                  />
                );
              }

              return null;
            })}
        </MobileCardsWrap>
      )}
    </>
  );
};

export default observer(MyBorrowTable);
