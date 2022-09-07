/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import { LENDS_CONTRACTS, IToken } from '@src/common/constants';
import { Text } from '@src/UIKit/Text';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import styled from '@emotion/styled';
import DashboardTable from '@src/pages/dashboard/DashboardTable';

const Root = styled.div`
  display: flex;
  width: 1010px;
`;

const UserStats: React.FC = () => {
  const { accountStore, tokenStore, lendStore } = useStores();
  const { userId } = useParams<{ userId: string }>();

  const [filteredTokens, setFilteredTokens] = useState<IToken[]>([]);
  const [showBorrow, showBorrowTable] = useState<boolean>(false);
  const [showSupply, showSupplyTable] = useState<boolean>(false);

  useEffect(() => {
    console.log(userId, 'userId---');
    Promise.all([Object.values(LENDS_CONTRACTS).map((item) => tokenStore.syncTokenStatistics(item, userId!))]).then(
      () => {
        console.log(lendStore.activePoolContract, 'lendStore.activePoolContract');
        const poolsData = tokenStore.filterPoolDataTokens(lendStore.activePoolContract);
        console.log(poolsData, 'poolsData.poolDataTokens');

        if (poolsData.every((item) => +tokenStore.poolDataTokensWithStats[item.assetId].selfBorrow === 0))
          showBorrowTable(false);

        if (poolsData.every((item) => +tokenStore.poolDataTokensWithStats[item.assetId].selfSupply === 0))
          showSupplyTable(false);

        // filtering USER supply/borrow values
        // for showing or hiding supply/borrow TABLES
        poolsData.forEach((t) => {
          const stats = tokenStore.poolDataTokensWithStats[t.assetId];

          if (showBorrow === false && Number(stats.selfBorrow) > 0) {
            showBorrowTable(true);
          }

          if (showBorrow === false && Number(stats.selfSupply) > 0) {
            showSupplyTable(true);
          }
        });
        console.log(poolsData, '---FILTERED');
        setFilteredTokens(poolsData);
      }
    );
  }, [lendStore.activePoolContract, showBorrow, userId, tokenStore]);

  return (
    <Root>
      <Column crossAxisSize="max">
        <SizedBox height={54} />
        <Text size="big" weight={500}>
          User: {userId || ''}
        </Text>
        <SizedBox height={54} />
        {filteredTokens && filteredTokens.length ? (
          <DashboardTable
            filteredTokens={filteredTokens}
            showBorrow={showSupply}
            showSupply={showSupply}
            showAll={false}
            isUserStats
          />
        ) : null}
      </Column>
    </Root>
  );
};

export default observer(UserStats);
