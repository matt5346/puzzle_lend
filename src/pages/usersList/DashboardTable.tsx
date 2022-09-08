/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import { Text } from '@src/UIKit/Text';
import { TOKENS_BY_ASSET_ID } from '@src/common/constants';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Row, Column } from '@src/common/styles/Flex';
import tokenLogos from '@src/common/constants/tokenLogos';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import AssetsTable from '@src/pages/usersList/AssetsTable';

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
  filteredTokens: any;
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
`;

const DashboardTable: React.FC<IProps> = ({ filteredTokens, showSupply, showBorrow, showAll, isUserStats }) => {
  const { lendStore, accountStore } = useStores();
  const { address } = accountStore;

  const handleSupplyAssetClick = (assetId: string, step: number) => {
    lendStore.setDashboardModalOpened(true, assetId, step);
  };

  return (
    <Root>
      <Text weight={500} size="big" type="secondary">
        Supplied
      </Text>
      {filteredTokens &&
        filteredTokens.length &&
        filteredTokens.map((t: any) => {
          let suppliersData: any = Object.values(t)[0];
          console.log(suppliersData, '----t----1');
          // retrieving SYMBOl for Asset (Pluto, waves...)
          const tokenData = Object.entries(TOKENS_BY_ASSET_ID).find((item: any) => item[0] === Object.keys(t)[0]);
          let symbol = '';
          let decimals = 0;

          if (tokenData) symbol = tokenData[1].symbol;
          if (tokenData) decimals = tokenData[1].decimals;
          if (suppliersData) suppliersData = suppliersData.suppliedUsers;
          console.log(suppliersData, '----t----2');

          if (t && symbol) {
            return (
              <Wrap>
                <Row alignItems="center" style={{ margin: '20px 0' }}>
                  <SquareTokenIcon size="small" src={tokenLogos[symbol]} />
                  <SizedBox width={18} />
                  <Text weight={500} type="secondary">
                    {symbol}
                  </Text>
                </Row>
                {suppliersData && suppliersData.length ? (
                  <AssetsTable filteredTokens={suppliersData} decimals={decimals} symbol={symbol} />
                ) : (
                  <Text weight={500} type="secondary">
                    No suppliers
                  </Text>
                )}
              </Wrap>
            );
          }

          return null;
        })}
      <SizedBox height={40} />
      <Text weight={500} size="big" type="secondary">
        Borrowed
      </Text>
      {filteredTokens &&
        filteredTokens.length &&
        filteredTokens.map((t: any) => {
          let borrowedData: any = Object.values(t)[0];
          console.log(borrowedData, '----t----1');
          // retrieving SYMBOl for Asset (Pluto, waves...)
          const tokenData = Object.entries(TOKENS_BY_ASSET_ID).find((item: any) => item[0] === Object.keys(t)[0]);
          let symbol = '';
          let decimals = 0;

          console.log(borrowedData, '----t----2');
          if (tokenData) symbol = tokenData[1].symbol;
          if (tokenData) decimals = tokenData[1].decimals;
          if (borrowedData) borrowedData = borrowedData.borrowedUsers;

          if (t && symbol) {
            return (
              <Wrap>
                <Row alignItems="center" style={{ margin: '20px 0' }}>
                  <SquareTokenIcon size="small" src={tokenLogos[symbol]} />
                  <SizedBox width={18} />
                  <Text weight={500} type="secondary">
                    {symbol}
                  </Text>
                </Row>
                {borrowedData && borrowedData.length ? (
                  <AssetsTable filteredTokens={borrowedData} decimals={decimals} symbol={symbol} />
                ) : (
                  <Text weight={500} type="secondary">
                    No borrowers
                  </Text>
                )}
              </Wrap>
            );
          }

          return null;
        })}
    </Root>
  );
};

export default observer(DashboardTable);
