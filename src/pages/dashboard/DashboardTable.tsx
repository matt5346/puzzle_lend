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
import AllAssetsTable from '@src/components/Dashboard/tables/AllAssetsTable';
import MyBorrowTable from '@src/components/Dashboard/tables/MyBorrowTable';
import MySupplyTable from '@src/components/Dashboard/tables/MySupplyTable';

// for some time
export enum TokenCategoriesEnum {
  all = 0,
  global = 1,
  stable = 2,
  defi = 3,
  ducks = 4,
}
// isLoggedUser -- case for all users except user whos logged with wallet
interface IProps {
  filteredTokens: IToken[];
  showSupply: boolean;
  showBorrow: boolean;
  showAll: boolean;
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

const DashboardTable: React.FC<IProps> = ({ filteredTokens, showSupply, showBorrow, showAll }) => {
  const { lendStore, accountStore } = useStores();
  const { address } = accountStore;

  const handleSupplyAssetClick = (assetId: string, step: number) => {
    lendStore.setDashboardModalOpened(true, assetId, step);
  };

  return (
    <Root>
      {showSupply && address ? (
        <Wrap>
          <Text weight={500} type="secondary" margin="0 0 10px 0">
            My supply
          </Text>
          <MySupplyTable filteredTokens={filteredTokens} handleSupplyAssetClick={handleSupplyAssetClick} isUserStats />
          <SizedBox height={40} />
        </Wrap>
      ) : null}

      {showBorrow && address ? (
        <Wrap>
          <Text weight={500} type="secondary" margin="0 0 10px 0">
            My borrow
          </Text>
          <MyBorrowTable filteredTokens={filteredTokens} handleSupplyAssetClick={handleSupplyAssetClick} isUserStats />
          <SizedBox height={40} />
        </Wrap>
      ) : null}

      {showAll ? (
        <Wrap>
          <Text weight={500} type="secondary" margin="0 0 10px 0">
            All assets
          </Text>
          <AllAssetsTable filteredTokens={filteredTokens} handleSupplyAssetClick={handleSupplyAssetClick} />

          <DashboardModal
            filteredTokens={filteredTokens}
            onClose={() => lendStore.setDashboardModalOpened(false, '', lendStore.dashboardModalStep)}
            visible={lendStore.dashboardModalOpened}
          />
        </Wrap>
      ) : null}
    </Root>
  );
};

export default observer(DashboardTable);
