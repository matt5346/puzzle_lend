import React from 'react';
import { observer } from 'mobx-react-lite';
// import InvestRow, { InvestRowSkeleton } from "@src/components/InvestRow";
import { useWalletVM } from '@components/Wallet/WalletModal/WalletVM';
import styled from '@emotion/styled';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Button } from '@src/UIKit/Button';
import { Text } from '@src/UIKit/Text';
import { Column, Row } from '@src/common/styles/Flex';
import { useStores } from '@src/stores';
import { ReactComponent as NotFoundIcon } from '@src/common/assets/icons/notFound.svg';
import BorrowTokensRow from '@src/components/Wallet/WalletModal/BorrowTokensRow';

const Root = styled.div`
  display: flex;
  justify-content: center;
  min-height: 400px;
`;

const Supply: React.FC = () => {
  const { tokenStore } = useStores();
  const vm = useWalletVM();
  return (
    <Root>
      <Column justifyContent="center" alignItems="center" crossAxisSize="max">
        <SizedBox height={12} />
        <Row justifyContent="space-around">
          <Text fitContent size="big" type="primary" className="text" textAlign="center">
            Net APY
          </Text>
          <Text fitContent size="big" type="primary" className="text" textAlign="center">
            {tokenStore.netAPY ? tokenStore.netAPY.toFixed(2) : 0}%
          </Text>
        </Row>
        <SizedBox height={12} />
        {vm.assetsStats.length === 0 && (
          <Row>
            <SizedBox height={24} />
            <NotFoundIcon style={{ marginBottom: 24 }} />
            <Text type="primary" className="text" textAlign="center">
              Unfortunately, there are no tokens that fit your filters.
            </Text>
            <SizedBox height={24} />
          </Row>
        )}
        {vm.assetsStats.map((t) => {
          const stats = tokenStore.statisticsByAssetId[t.assetId];
          return (
            <BorrowTokensRow
              token={t}
              vol24={stats?.volume24}
              key={t.assetId}
              rate={stats.currentPrice}
              selfBorrow={stats.selfBorrow}
              setupBorrowAPR={stats.setupBorrowAPR}
              setupLtv={stats.setupLtv}
            />
          );
        })}
      </Column>
    </Root>
  );
};
export default observer(Supply);
