/* eslint-disable no-bitwise */
import styled from '@emotion/styled';
import React, { useState } from 'react';
import BN from '@src/common/utils/BN';
import { Column, Row } from '@src/common/styles/Flex';
import { observer } from 'mobx-react-lite';
import { SizedBox } from '@src/UIKit/SizedBox';
import { DashboardWalletUseVM } from '@src/pages/dashboard/modal/DashboardWalletVM';
import { IToken } from '@src/common/constants';
import SupplyAssets from '@src/pages/dashboard/modal/SupplyAssets';
import WithdrawAssets from '@src/pages/dashboard/modal/WithdrawAssets';
import BorrowAssets from '@src/pages/dashboard/modal/BorrowAssets';
import RepayAssets from '@src/pages/dashboard/modal/RepayAssets';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {
  filteredTokens: IToken[];
}

const Root = styled(Column)`
  width: 100%;
  box-sizing: border-box;
  background: #fff;

  & > * {
    width: 100%;
  }
`;

const ListWrapper = styled.div<{ headerExpanded: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  transition: 0.4s;
  overflow: hidden;
`;

const WalletModalBody: React.FC<IProps> = ({ filteredTokens }) => {
  const vm = DashboardWalletUseVM();
  const { lendStore, tokenStore } = vm.rootStore;

  const getTokenBalance: any = () => {
    const getAssetData = vm.balances.find((tokenData) => tokenData.assetId === lendStore.choosenToken?.assetId);

    return getAssetData?.balance;
  };

  const supplyMaxClickFunc = (amount?: BN) => {
    const getAssetData = vm.balances.find((tokenData) => tokenData.assetId === lendStore.choosenToken?.assetId);
    console.log(getAssetData?.balance?.toString(), 'getAssetData lendStore');
    console.log(amount?.toString(), 'amount lendStore');

    if (getAssetData) vm.setSupplyAmount(amount || getAssetData.balance!);
  };

  const withdrawMaxClickFunc = (amount?: BN) => {
    const getAssetData = vm.balances.find((tokenData) => tokenData.assetId === lendStore.choosenToken?.assetId);
    console.log(getAssetData?.balance?.toString(), 'getAssetData lendStore');
    console.log(amount?.toString(), 'amount lendStore');

    if (getAssetData) vm.setWithdrawAmount(amount || getAssetData.balance!);
  };

  const borrowMaxClickFunc = (amount?: BN) => {
    // todo: CHECK LOGIN OF LTV counting
    const borrowedAmount = BN.formatUnits(amount || BN.ZERO).toSignificant(6);
    const maxBorrowAmount =
      +lendStore.choosenToken?.selfSupply * (+lendStore.choosenToken?.setupLtv / 100) - +borrowedAmount;
    console.log(maxBorrowAmount, 'maxBorrowAmount');

    vm.setBorrowAmount(BN.formatUnits(maxBorrowAmount, 0));
  };

  const repayMaxClickFunc = (amount?: BN) => {
    const getAssetData = vm.balances.find((tokenData) => tokenData.assetId === lendStore.choosenToken?.assetId);

    if (getAssetData) vm.setRepayAmount(amount || getAssetData.balance!);
  };

  console.log(vm, 'ASSETS vm');

  return (
    <Root>
      <ListWrapper headerExpanded={vm.headerExpanded}>
        <SizedBox height={8} />
        {lendStore.dashboardModalStep === 0 && (
          <SupplyAssets
            setupSupplyAPY={lendStore.choosenToken?.setupSupplyAPY}
            assetName={lendStore.choosenToken?.symbol}
            userBalance={getTokenBalance()}
            decimals={lendStore.choosenToken?.decimals}
            amount={vm.supplyAmount}
            setAmount={vm.setSupplyAmount}
            assetId={lendStore.choosenToken?.assetId}
            onMaxClick={supplyMaxClickFunc}
            onSubmit={vm.submitSupply}
            onClose={vm.onCloseModal}
          />
        )}
        {lendStore.dashboardModalStep === 1 && (
          <WithdrawAssets
            setupSupplyAPY={lendStore.choosenToken?.setupSupplyAPY}
            assetName={lendStore.choosenToken?.symbol}
            selfSupply={lendStore.choosenToken?.selfSupply}
            totalSupply={lendStore.choosenToken?.totalPoolSupply}
            totalBorrow={lendStore.choosenToken?.totalPoolBorrow}
            userBalance={getTokenBalance()}
            decimals={lendStore.choosenToken?.decimals}
            amount={vm.withdrawAmount}
            setAmount={vm.setWithdrawAmount}
            assetId={lendStore.choosenToken?.assetId}
            onMaxClick={withdrawMaxClickFunc}
            onSubmit={vm.submitWithdraw}
            onClose={vm.onCloseModal}
          />
        )}
        {lendStore.dashboardModalStep === 2 && (
          <BorrowAssets
            setupBorrowAPR={lendStore.choosenToken?.setupBorrowAPR}
            assetName={lendStore.choosenToken?.symbol}
            selfBorrow={lendStore.choosenToken?.selfBorrow}
            totalSupply={lendStore.choosenToken?.totalPoolSupply}
            setupLtv={lendStore.choosenToken?.setupLtv}
            userBalance={getTokenBalance()}
            decimals={lendStore.choosenToken?.decimals}
            amount={vm.borrowAmount}
            setAmount={vm.setBorrowAmount}
            assetId={lendStore.choosenToken?.assetId}
            onMaxClick={borrowMaxClickFunc}
            onSubmit={vm.submitBorrow}
            onClose={vm.onCloseModal}
          />
        )}
        {lendStore.dashboardModalStep === 3 && (
          <RepayAssets
            setupBorrowAPR={lendStore.choosenToken?.setupBorrowAPR}
            assetName={lendStore.choosenToken?.symbol}
            selfBorrow={lendStore.choosenToken?.selfBorrow}
            totalSupply={lendStore.choosenToken?.totalPoolSupply}
            userBalance={getTokenBalance()}
            decimals={lendStore.choosenToken?.decimals}
            amount={vm.repayAmount}
            setAmount={vm.setRepayAmount}
            assetId={lendStore.choosenToken?.assetId}
            onMaxClick={repayMaxClickFunc}
            onSubmit={vm.submitRepay}
            onClose={vm.onCloseModal}
          />
        )}
        <SizedBox height={64} width={1} />
      </ListWrapper>
    </Root>
  );
};
export default observer(WalletModalBody);
