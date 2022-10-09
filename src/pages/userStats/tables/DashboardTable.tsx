/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import { Text } from '@src/UIKit/Text';
import { IToken } from '@src/common/constants';
import { SizedBox } from '@src/UIKit/SizedBox';
import DashboardModal from '@src/components/Dashboard/modal';
import MyBorrowTable from '@src/pages/userStats/tables/MyBorrowTable';
import MySupplyTable from '@src/pages/userStats/tables/MySupplyTable';

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
  filteredTokens: IToken[];
  showSupply: boolean;
  showBorrow: boolean;
  isUserStats: boolean;
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

const DashboardTable: React.FC<IProps> = ({ filteredTokens, showSupply, showBorrow, isUserStats }) => {
  const { lendStore } = useStores();

  const handleSupplyAssetClick = (assetId: string, step: number) => {
    lendStore.setDashboardModalOpened(true, assetId, step);
  };

  return (
    <Root>
      {showSupply ? (
        <Wrap>
          <Text weight={500} type="secondary" margin="0 0 10px 0">
            User supply
          </Text>
          <MySupplyTable
            filteredTokens={filteredTokens}
            handleSupplyAssetClick={handleSupplyAssetClick}
            isUserStats={isUserStats}
          />
          <SizedBox height={40} />
        </Wrap>
      ) : null}

      {showBorrow ? (
        <Wrap>
          <Text weight={500} type="secondary" margin="0 0 10px 0">
            User borrow
          </Text>
          <MyBorrowTable
            filteredTokens={filteredTokens}
            handleSupplyAssetClick={handleSupplyAssetClick}
            isUserStats={isUserStats}
          />
          <SizedBox height={40} />
        </Wrap>
      ) : null}
      {!showBorrow && !showSupply && <Text>No borrowed/supplied assets</Text>}
    </Root>
  );
};

export default observer(DashboardTable);
