/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@src/stores';
import GridTable from '@src/common/styles/GridTable';
import Card from '@src/common/styles/Card';
import MobileCardsWrap from '@src/common/styles/MobileCardsWrap';
import { TableTitle } from '@src/components/Dashboard/tables/AllAssetsTable';
import { Tooltip } from '@src/UIKit/Tooltip';
import { Text } from '@src/UIKit/Text';
import { IToken, TTokenStatistics } from '@src/common/constants';
import DesktopTokenTableRow from '@src/components/Dashboard/tables/DesktopTokenTableRow';
import MobileTokenTableRow from '@src/components/Dashboard/tables/MobileTokenTableRow';
import useWindowSize from '@src/hooks/useWindowSize';
import BN from '@src/common/utils/BN';

interface IProps {
  filteredTokens: IToken[];
  isUserStats: boolean;
  handleSupplyAssetClick: (assetId: string, step: number) => void;
}

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

      if (stats1 == null || stats2 == null) return 0;
      if (stats1[key] == null && stats2[key] != null) return sortMode === 'descending' ? 1 : -1;
      if (stats1[key] == null && stats2[key] == null) return sortMode === 'descending' ? -1 : 1;

      // filtering in $ equivalent
      if (sort === 'selfBorrow') {
        const val1 = (stats1[key] as BN).times(stats1.minPrice);
        const val2 = (stats2[key] as BN).times(stats2.minPrice);
        return sortMode === 'descending' ? (val1.lt(val2) ? 1 : -1) : val1.lt(val2) ? -1 : 1;
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
              <Tooltip
                width="100%"
                containerStyles={{ display: 'flex', alignItems: 'center', width: '100%' }}
                content={<Text>Annual interest paid by borrowers taking into account compounding.</Text>}>
                <TableTitle
                  isTooltip
                  onClick={() => selectSort('setupBorrowAPR')}
                  mode={sortMode}
                  sort={sort === 'setupBorrowAPR'}>
                  Borrow APY
                </TableTitle>
              </Tooltip>
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
                    setupSupplyAPY={stats.setupSupplyAPY}
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
