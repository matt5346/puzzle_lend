/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useWindowSize from '@src/hooks/useWindowSize';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import { Text } from '@src/UIKit/Text';
import { IToken } from '@src/common/constants';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Column } from '@src/common/styles/Flex';
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
// isUserStats -- case for all users except user whos logged with wallet
interface IProps {
  filteredTokens: IToken[];
  showSupply: boolean;
  showBorrow: boolean;
  showAll: boolean;
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
  width: 100%;
`;

const SupplyBorrowWrap = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  margin-top: 40px;

  @media (min-width: 880px) {
    margin-top: 0;
  }
`;

const DashboardTable: React.FC<IProps> = ({ filteredTokens, showSupply, showBorrow, showAll, isUserStats }) => {
  const { lendStore, accountStore } = useStores();
  const { address } = accountStore;
  const { windowWidth } = useWindowSize();
  const [getMobileAssetType, setMobileAssetType] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { assetType } = useParams<{ assetType: string }>();

  const handleSupplyAssetClick = (assetId: string, step: number) => {
    lendStore.setDashboardModalOpened(true, assetId, step);
  };

  useEffect(() => {
    if (windowWidth! < 560) setIsMobile(true);

    if (assetType === 'supply') setMobileAssetType(0);
    if (assetType === '') setMobileAssetType(1);
    if (assetType === 'borrow') setMobileAssetType(2);
  }, [assetType, isMobile, windowWidth]);
  return (
    <Root>
      {/*
          checking for user supply/borrow/address
          isUserStats for specific USERS page
          isMobile and getAsset for different pages on mobile
      */}
      {!isMobile ? (
        <>
          <SupplyBorrowWrap>
            {showSupply && (address || isUserStats) ? (
              <Wrap>
                <Text weight={500} type="secondary" margin="0 0 10px 0">
                  My supply
                </Text>
                <MySupplyTable
                  filteredTokens={filteredTokens}
                  handleSupplyAssetClick={handleSupplyAssetClick}
                  isUserStats={isUserStats}
                />
                <SizedBox height={40} />
              </Wrap>
            ) : null}

            {showBorrow && (address || isUserStats) ? (
              <Wrap>
                <Text weight={500} type="secondary" margin="0 0 10px 0">
                  My borrow
                </Text>
                <MyBorrowTable
                  filteredTokens={filteredTokens}
                  handleSupplyAssetClick={handleSupplyAssetClick}
                  isUserStats={isUserStats}
                />
                <SizedBox height={40} />
              </Wrap>
            ) : null}
          </SupplyBorrowWrap>

          {showAll ? (
            <Column crossAxisSize="max">
              <Text weight={500} type="secondary" margin="0 0 10px 0">
                All assets
              </Text>
              <AllAssetsTable filteredTokens={filteredTokens} handleSupplyAssetClick={handleSupplyAssetClick} />

              {filteredTokens && filteredTokens.length ? (
                <DashboardModal
                  filteredTokens={filteredTokens}
                  onClose={() => lendStore.setDashboardModalOpened(false, '', lendStore.dashboardModalStep)}
                  visible={lendStore.dashboardModalOpened}
                />
              ) : (
                <Text weight={500} size="big" margin="10px auto">
                  Assets Loading...
                </Text>
              )}
            </Column>
          ) : null}
        </>
      ) : (
        <>
          <SupplyBorrowWrap>
            {showSupply && (address || isUserStats) && getMobileAssetType === 0 ? (
              <Wrap>
                <Text weight={500} type="secondary" margin="0 0 10px 0">
                  My supply
                </Text>
                <MySupplyTable
                  filteredTokens={filteredTokens}
                  handleSupplyAssetClick={handleSupplyAssetClick}
                  isUserStats={isUserStats}
                />
                <SizedBox height={40} />
              </Wrap>
            ) : null}

            {showBorrow && (address || isUserStats) && getMobileAssetType === 2 ? (
              <Wrap>
                <Text weight={500} type="secondary" margin="0 0 10px 0">
                  My borrow
                </Text>
                <MyBorrowTable
                  filteredTokens={filteredTokens}
                  handleSupplyAssetClick={handleSupplyAssetClick}
                  isUserStats={isUserStats}
                />
                <SizedBox height={40} />
              </Wrap>
            ) : null}
          </SupplyBorrowWrap>

          {showAll && getMobileAssetType === 1 ? (
            <Column crossAxisSize="max">
              <Text weight={500} type="secondary" margin="0 0 10px 0">
                All assets
              </Text>
              <AllAssetsTable filteredTokens={filteredTokens} handleSupplyAssetClick={handleSupplyAssetClick} />

              <DashboardModal
                filteredTokens={filteredTokens}
                onClose={() => lendStore.setDashboardModalOpened(false, '', lendStore.dashboardModalStep)}
                visible={lendStore.dashboardModalOpened}
              />
            </Column>
          ) : null}
        </>
      )}
    </Root>
  );
};

export default observer(DashboardTable);
