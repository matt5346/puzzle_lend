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
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { ROUTES } from '@src/common/constants';
import { ReactComponent as NotFoundIcon } from '@src/common/assets/icons/notFound.svg';
import SupplyTokensRow from './SupplyTokensRow';

const Root = styled.div`
  display: flex;
  justify-content: center;
  min-height: 400px;
`;

const Investments: React.FC = () => {
  const { tokenStore } = useStores();
  const vm = useWalletVM();
  return (
    <Root>
      <Column justifyContent="center" alignItems="center" crossAxisSize="max">
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
          console.log(stats, 'STATS');
          return (
            <SupplyTokensRow
              token={t}
              vol24={stats?.volume24}
              key={t.assetId}
              rate={stats.currentPrice}
              selfBorrow={stats.selfBorrow}
              selfSupply={stats.selfSupply}
              setupLtv={stats.setupLtv}
              supplyRate={stats.selfSupplyRate}
            />
          );
        })}
      </Column>
    </Root>
  );
};
export default observer(Investments);
