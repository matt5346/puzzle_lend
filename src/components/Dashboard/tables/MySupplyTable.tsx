/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import useWindowSize from '@src/hooks/useWindowSize';
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
import BN from '@src/common/utils/BN';

import { ReactComponent as SortDownIcon } from '@src/common/assets/icons/sortDown.svg';

interface IProps {
  filteredTokens: IToken[];
  isUserStats: boolean;
  handleSupplyAssetClick: (assetId: string, step: number) => void;
}

const MySupplyTable: React.FC<IProps> = ({ filteredTokens, handleSupplyAssetClick, isUserStats }) => {
  const { windowWidth } = useWindowSize();
  const [sort, setSort] = useState<'totalAssetSupply' | 'setupSupplyAPY' | 'selfDailyIncome'>('selfDailyIncome');
  const [sortMode, setSortMode] = useState<'descending' | 'ascending'>('descending');
  const { tokenStore } = useStores();
  const [sortedTokens, setSortedTokens] = useState<IToken[]>([]);

  const selectSort = (v: 'totalAssetSupply' | 'setupSupplyAPY' | 'selfDailyIncome') => {
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
      if (sort === 'totalAssetSupply') key = 'totalAssetSupply';
      if (sort === 'setupSupplyAPY') key = 'setupSupplyAPY';
      if (sort === 'selfDailyIncome') key = 'selfDailyIncome';
      if (key == null) return 0;

      if (stats1 == null || stats2 == null) return 0;
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
              <Tooltip
                width="100%"
                containerStyles={{ display: 'flex', alignItems: 'center', width: '100%' }}
                content={<Text>Annual interest paid by borrowers taking into account compounding.</Text>}>
                <TableTitle
                  isTooltip
                  onClick={() => selectSort('totalAssetSupply')}
                  mode={sortMode}
                  sort={sort === 'totalAssetSupply'}>
                  Supplied
                </TableTitle>
              </Tooltip>
              <Tooltip
                width="100%"
                containerStyles={{ display: 'flex', alignItems: 'center', width: '100%' }}
                content={<Text>Annual interest paid to investors taking into account compounding.</Text>}>
                <TableTitle
                  isTooltip
                  onClick={() => selectSort('setupSupplyAPY')}
                  mode={sortMode}
                  sort={sort === 'setupSupplyAPY'}>
                  Supply APY
                </TableTitle>
              </Tooltip>
              <TableTitle
                onClick={() => selectSort('selfDailyIncome')}
                mode={sortMode}
                sort={sort === 'selfDailyIncome'}>
                Daily Income
              </TableTitle>
            </div>
            {sortedTokens &&
              sortedTokens.length &&
              sortedTokens.map((t) => {
                const stats = tokenStore.poolDataTokensWithStats[t.assetId];

                if (stats && Number(stats.selfSupply) > 0) {
                  return (
                    <DesktopTokenTableRow
                      isUserStats={isUserStats}
                      token={t}
                      key={t.assetId}
                      rate={stats.currentPrice}
                      selfSupply={stats.selfSupply}
                      setupSupplyAPY={stats.setupSupplyAPY}
                      dailyIncome={stats.selfDailyIncome}
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

              if (stats && Number(stats.selfSupply) > 0) {
                return (
                  <MobileTokenTableRow
                    isUserStats={isUserStats}
                    token={t}
                    key={t.assetId}
                    rate={stats.currentPrice}
                    selfSupply={stats.selfSupply || '0'}
                    setupSupplyAPY={stats.setupSupplyAPY || '0'}
                    dailyIncome={stats.selfDailyIncome || '0'}
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

export default observer(MySupplyTable);
