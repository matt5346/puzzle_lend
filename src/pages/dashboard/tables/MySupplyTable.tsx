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
import { IToken, TTokenStatistics } from '@src/common/constants';
import BN from '@src/common/utils/BN';
import DesktopTokenTableRow from '@src/pages/dashboard/tables/DesktopTokenTableRow';

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

const MySupplyTable: React.FC<IProps> = ({ filteredTokens, handleSupplyAssetClick }) => {
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

  useMemo(() => {
    const data = filteredTokens.sort((a, b) => {
      const stats1: TTokenStatistics | undefined = tokenStore.poolDataTokensWithStats[a.assetId];
      const stats2: TTokenStatistics | undefined = tokenStore.poolDataTokensWithStats[b.assetId];
      let key: keyof TTokenStatistics | undefined;
      if (sort === 'totalAssetSupply') key = 'totalAssetSupply';
      if (sort === 'setupSupplyAPY') key = 'setupSupplyAPY';
      if (sort === 'selfDailyIncome') key = 'selfDailyIncome';
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
        desktopTemplate="5fr 2fr 2fr 2.5fr 4fr"
        mobileTemplate="2fr 1fr">
        <div className="gridTitle">
          <div>Asset</div>
          <TableTitle onClick={() => selectSort('totalAssetSupply')} mode={sortMode} sort={sort === 'totalAssetSupply'}>
            Supplied
          </TableTitle>
          <TableTitle onClick={() => selectSort('setupSupplyAPY')} mode={sortMode} sort={sort === 'setupSupplyAPY'}>
            Supply APY
          </TableTitle>
          <TableTitle onClick={() => selectSort('selfDailyIncome')} mode={sortMode} sort={sort === 'selfDailyIncome'}>
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
  );
};

export default observer(MySupplyTable);
