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
import DesktopTokenTableRow from '@src/pages/usersList/DesktopTokenTableRow';
import BN from '@src/common/utils/BN';

import { ReactComponent as SortDownIcon } from '@src/common/assets/icons/sortDown.svg';
import { ReactComponent as NotFoundIcon } from '@src/common/assets/icons/notFound.svg';

interface IProps {
  filteredTokens: any;
  decimals: number;
  symbol: string;
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

const AssetsTable: React.FC<IProps> = ({ filteredTokens, decimals, symbol }) => {
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
    const data = filteredTokens;
    setSortedTokens(data);
  }, [filteredTokens, sort, sortMode, tokenStore.poolDataTokensWithStats]);

  return (
    <Card style={{ padding: 0, overflow: 'auto', width: '100%' }} justifyContent="center">
      <GridTable
        style={{ width: '100%', minWidth: '100%' }}
        desktopTemplate="4fr 2fr 2fr 3fr"
        mobileTemplate="2fr 1fr 2fr 2fr">
        <div className="gridTitle">
          <div>User</div>
          <TableTitle onClick={() => selectSort('totalAssetSupply')} mode={sortMode} sort={sort === 'totalAssetSupply'}>
            Borrowed
          </TableTitle>
          <TableTitle onClick={() => selectSort('totalAssetSupply')} mode={sortMode} sort={sort === 'totalAssetSupply'}>
            Supplied
          </TableTitle>
          <TableTitle onClick={() => selectSort('setupSupplyAPY')} mode={sortMode} sort={sort === 'setupSupplyAPY'}>
            User Full stats
          </TableTitle>
        </div>
        {sortedTokens.map((t: any) => {
          if (t) {
            return (
              <Column crossAxisSize="max">
                <DesktopTokenTableRow
                  key={t.assetId}
                  owner={t.owner}
                  decimals={decimals}
                  symbol={symbol}
                  totalBorrow={t.borrowed}
                  totalSupply={t.supplied}
                />
              </Column>
            );
          }

          return null;
        })}
      </GridTable>
    </Card>
  );
};

export default observer(AssetsTable);
