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
import { IToken, TTokenStatistics } from '@src/common/constants';
import DesktopTokenTableRow from '@src/pages/usersList/DesktopTokenTableRow';
import BN from '@src/common/utils/BN';

import { ReactComponent as SortDownIcon } from '@src/common/assets/icons/sortDown.svg';
import { ReactComponent as NotFoundIcon } from '@src/common/assets/icons/notFound.svg';

interface IProps {
  filteredTokens: any;
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

const AssetsTable: React.FC<IProps> = ({ filteredTokens }) => {
  const [sort, setActiveSort] = useState<'borrowed' | 'supplied'>('borrowed');
  const [sortMode, setActiveSortMode] = useState<'descending' | 'ascending'>('descending');
  const { tokenStore } = useStores();
  const [sortedTokens, setSortedTokens] = useState<IToken[]>([]);

  const selectSort = (v: 'borrowed' | 'supplied') => {
    if (sort === v) {
      setActiveSortMode(sortMode === 'ascending' ? 'descending' : 'ascending');
    } else {
      setActiveSort(v);
      setActiveSortMode('descending');
    }
  };

  useEffect(() => {
    const data = filteredTokens.sort((a: any, b: any) => {
      const stats1: any | undefined = a;
      const stats2: any | undefined = b;
      let key: keyof any | undefined;
      if (sort === 'borrowed') key = 'borrowed';
      if (sort === 'supplied') key = 'supplied';
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
    <Column>
      <Card style={{ padding: 0, overflow: 'auto', width: '100%' }} justifyContent="center">
        <GridTable
          style={{ width: '100%', minWidth: '100%' }}
          desktopTemplate="4fr 3fr 2fr 3fr"
          mobileTemplate="2fr 1fr 2fr 2fr">
          <div className="gridTitle">
            <div style={{ minWidth: '350px' }}>User</div>
            <TableTitle onClick={() => selectSort('borrowed')} mode={sortMode} sort={sort === 'borrowed'}>
              Borrowed
            </TableTitle>
            <TableTitle onClick={() => selectSort('supplied')} mode={sortMode} sort={sort === 'supplied'}>
              Supplied
            </TableTitle>
          </div>
          {sortedTokens &&
            sortedTokens.length &&
            sortedTokens.map((t: any) => {
              return (
                <DesktopTokenTableRow
                  key={t.owner + t.supplied}
                  owner={t.owner}
                  totalBorrow={t.borrowed}
                  totalSupply={t.supplied}
                />
              );
            })}
        </GridTable>
      </Card>
    </Column>
  );
};

export default observer(AssetsTable);
