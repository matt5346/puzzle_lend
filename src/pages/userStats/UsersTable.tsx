/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useMemo, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import { Text } from '@src/UIKit/Text';
import { IToken } from '@src/common/constants';
import { SizedBox } from '@src/UIKit/SizedBox';
import DashboardTable from '@src/pages/userStats/tables/DashboardTable';

// for some time
export enum TokenCategoriesEnum {
  all = 0,
  global = 1,
  stable = 2,
  defi = 3,
  ducks = 4,
}
// isUserStats -- case for all users except user whos logged with wallet
interface IProps {
  poolId: string;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserTable: React.FC<IProps> = ({ poolId }) => {
  const { lendStore, usersStore } = useStores();

  const [filteredTokens, setFilteredTokens] = useState<IToken[]>([]);
  const [showBorrow, showBorrowTable] = useState<boolean>(false);
  const [showSupply, showSupplyTable] = useState<boolean>(false);

  useEffect(() => {
    const poolsData = usersStore.filterPoolDataTokens(poolId);

    if (poolsData.every((item) => +usersStore.poolDataTokensWithStats[item.assetId]?.selfBorrow === 0) || false)
      showBorrowTable(false);

    if (poolsData.every((item) => +usersStore.poolDataTokensWithStats[item.assetId]?.selfSupply === 0) || false)
      showSupplyTable(false);

    // filtering USER supply/borrow values
    // for showing or hiding supply/borrow TABLES
    poolsData.forEach((t) => {
      const stats = usersStore.poolDataTokensWithStats[t.assetId];
      console.log(stats, '---stats');

      if (showBorrow === false && +stats?.selfBorrow > 0) {
        showBorrowTable(true);
      }

      if (showBorrow === false && +stats?.selfSupply > 0) {
        showSupplyTable(true);
      }
    });
    console.log(poolsData, '---poldata');
    setFilteredTokens(poolsData);
  }, [lendStore.activePoolContract, showBorrow, poolId, usersStore]);

  return (
    <Root>
      <Wrap>
        <Text size="large" weight={500} margin="0 0 10px 0">
          {lendStore.poolNameById(poolId)}
        </Text>
        <SizedBox height={12} />
        {filteredTokens && filteredTokens.length ? (
          <DashboardTable filteredTokens={filteredTokens} showBorrow={showBorrow} showSupply={showSupply} isUserStats />
        ) : (
          <Text>No borrowed/supplied Tokens in pool</Text>
        )}
      </Wrap>
    </Root>
  );
};

export default observer(UserTable);
