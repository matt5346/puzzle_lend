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
import DesktopTokenTableRow from '@src/pages/dashboard/tables/DesktopTokenTableRow';

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
  const [sort, setSort] = useState<'income' | 'supplyapy' | 'supply'>('income');
  const [sortMode, setSortMode] = useState<'descending' | 'ascending'>('descending');
  const { tokenStore } = useStores();

  const selectSort = (v: 'income' | 'supplyapy' | 'supply') => {
    if (sort === v) {
      setSortMode(sortMode === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSort(v);
      setSortMode('descending');
    }
  };

  return (
    <Card style={{ padding: 0, overflow: 'auto' }} justifyContent="center">
      <GridTable
        style={{ width: 'fit-content', minWidth: '100%' }}
        desktopTemplate="6fr 2fr 2fr 2fr 4fr"
        mobileTemplate="2fr 1fr">
        <div className="gridTitle">
          <div>Asset</div>
          <TableTitle onClick={() => selectSort('supply')} mode={sortMode} sort={sort === 'supply'}>
            Supplied
          </TableTitle>
          <TableTitle onClick={() => selectSort('supplyapy')} mode={sortMode} sort={sort === 'supplyapy'}>
            Supply APY
          </TableTitle>
          <TableTitle onClick={() => selectSort('income')} mode={sortMode} sort={sort === 'income'}>
            Daily Income
          </TableTitle>
        </div>
        {filteredTokens.map((t) => {
          const stats = tokenStore.statisticsByAssetId[t.assetId];
          if (Number(stats.selfSupply) > 0) {
            console.log(stats, 'STATS');
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

export default observer(AllAssetsTable);
