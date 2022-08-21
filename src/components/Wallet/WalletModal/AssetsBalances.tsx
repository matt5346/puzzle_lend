import React, { HTMLAttributes } from 'react';
import { observer } from 'mobx-react-lite';
import { useWalletVM } from '@components/Wallet/WalletModal/WalletVM';
import styled from '@emotion/styled';
import InvestRow from '@src/components/Wallet/WalletModal/InvestRow';
import { Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Button } from '@src/UIKit/Button';
import { Text } from '@src/UIKit/Text';
import { ReactComponent as NotFoundIcon } from '@src/common/assets/icons/notFound.svg';
import { useStores } from '@src/stores';
import Skeleton from 'react-loading-skeleton';

type IProps = HTMLAttributes<HTMLDivElement>;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const AssetsBalances: React.FC<IProps> = () => {
  const vm = useWalletVM();
  const { accountStore, poolsStore } = useStores();
  if (accountStore.assetBalances === null)
    return (
      <Root style={{ padding: '0 24px' }}>
        <Skeleton height={56} style={{ marginBottom: 8 }} count={3} />
      </Root>
    );
  return (
    <Root>
      {vm.balances.length !== 0 ? (
        vm.balances.map((b) => {
          const rate = poolsStore.usdnRate(b.assetId)?.toFormat(2);
          const rateChange = vm.assetsStats && vm.assetsStats[b.assetId];
          return (
            <InvestRow
              rateChange={rateChange}
              key={b.assetId}
              logo={b.logo}
              topLeftInfo={b.name}
              topRightInfo={b.formatBalance}
              bottomLeftInfo={rate && `$ ${rate}`}
              bottomRightInfo={b.formatUsdnEquivalent}
              withClickLogic
              onClick={() => {
                accountStore.setAssetToSend(b);
                accountStore.setSendAssetModalOpened(true);
              }}
            />
          );
        })
      ) : (
        <Column justifyContent="center" alignItems="center" crossAxisSize="max">
          <SizedBox height={16} />
          <NotFoundIcon />
          <Text type="secondary" size="medium" textAlign="center">
            You don’t have any assets on your wallet.
            <br />
            Buy WAVES on Waves Exchange to start trading.
          </Text>
          <SizedBox height={16} />
          <Button size="medium">Buy WAVES</Button>
          <SizedBox height={100} />
        </Column>
      )}
    </Root>
  );
};
export default observer(AssetsBalances);
