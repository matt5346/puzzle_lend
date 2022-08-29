/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@src/stores';
import GridTable from '@src/common/styles/GridTable';
import Card from '@src/common/styles/Card';
import { Row, Column } from '@src/common/styles/Flex';
import { IToken } from '@src/common/constants';
import { ReactComponent as SortDownIcon } from '@src/common/assets/icons/sortDown.svg';
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

const AllAssetsTable: React.FC<IProps> = ({ filteredTokens, handleSupplyAssetClick }) => {
  const [sort, setSort] = useState<'borrowapr' | 'repay'>('repay');
  const [sortMode, setSortMode] = useState<'descending' | 'ascending'>('descending');
  const { tokenStore, accountStore } = useStores();

  const selectSort = (v: 'repay' | 'borrowapr') => {
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
        desktopTemplate="5fr 2fr 2fr 3fr"
        mobileTemplate="2fr 1fr">
        <div className="gridTitle">
          <div>Asset</div>
          <TableTitle onClick={() => selectSort('borrowapr')} mode={sortMode} sort={sort === 'borrowapr'}>
            Borrow APR
          </TableTitle>
          <TableTitle onClick={() => selectSort('repay')} mode={sortMode} sort={sort === 'repay'}>
            To be repaid
          </TableTitle>
        </div>
        {filteredTokens.map((t) => {
          const stats = tokenStore.statisticsByAssetId[t.assetId];

          if (Number(stats.selfBorrow) > 0) {
            console.log(stats, 'STATS');
            return (
              <DesktopTokenTableRow
                token={t}
                key={t.assetId}
                rate={stats.currentPrice}
                selfBorrow={stats.selfBorrow}
                setupBorrowAPR={stats.setupBorrowAPR}
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
