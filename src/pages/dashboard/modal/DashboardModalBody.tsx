/* eslint-disable no-bitwise */
import styled from '@emotion/styled';
import React, { useState, useMemo } from 'react';
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
  const [tokenFilteredData, setFilteredToken] = useState<IToken>();
  const [isAgree, setAgree] = useState<boolean>(false);
  const [isBorrowAgree, setBorrowAgree] = useState<boolean>(false);
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

  const borrowMaxClickFunc = (amount: BN) => {
    console.log(amount.toString(), 'MAX');
    vm.setBorrowAmount(amount);
  };

  const repayMaxClickFunc = (amount?: BN) => {
    const getAssetData = vm.balances.find((tokenData) => tokenData.assetId === lendStore.choosenToken?.assetId);

    if (getAssetData) vm.setRepayAmount(amount || getAssetData.balance!);
  };

  // main reason of this useMemo is SYMBOl
  // token flow of filtered tokens and lendstore.choosenToken different
  // todo: figure out, why symbol is different
  useMemo(() => {
    const token = filteredTokens.find((item) => item.assetId === lendStore.choosenToken?.assetId);

    setFilteredToken(token);
  }, [lendStore.choosenToken, filteredTokens]);

  console.log(vm, 'ASSETS vm');

  return (
    <Root>
      <ListWrapper headerExpanded={vm.headerExpanded}>
        {lendStore.dashboardModalStep === 0 && (
          <SupplyAssets
            setupSupplyAPY={lendStore.choosenToken?.setupSupplyAPY}
            assetName={tokenFilteredData?.name}
            assetSymbol={tokenFilteredData?.symbol}
            rate={lendStore.choosenToken?.currentPrice}
            selfBorrow={lendStore.choosenToken?.selfBorrow}
            supplyInterest={lendStore.choosenToken?.supplyInterest}
            userBalance={getTokenBalance()}
            decimals={lendStore.choosenToken?.decimals}
            amount={vm.supplyAmount}
            setAmount={vm.setSupplyAmount}
            assetId={lendStore.choosenToken?.assetId}
            onMaxClick={supplyMaxClickFunc}
            onSubmit={vm.submitSupply}
            onClose={vm.onCloseModal}
            isAgree={isAgree}
            onChange={setAgree}
          />
        )}
        {lendStore.dashboardModalStep === 1 && (
          <WithdrawAssets
            setupSupplyAPY={lendStore.choosenToken?.setupSupplyAPY}
            assetName={tokenFilteredData?.name}
            assetSymbol={tokenFilteredData?.symbol}
            rate={lendStore.choosenToken?.currentPrice}
            selfSupply={lendStore.choosenToken?.selfSupply}
            totalSupply={lendStore.choosenToken?.totalAssetSupply}
            totalBorrow={lendStore.choosenToken?.totalAssetBorrow}
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
            assetName={tokenFilteredData?.name}
            assetSymbol={tokenFilteredData?.symbol}
            rate={lendStore.choosenToken?.currentPrice}
            userColatteral={tokenStore?.userCollateral}
            selfBorrow={lendStore.choosenToken?.selfBorrow}
            totalBorrow={lendStore.choosenToken?.totalAssetBorrow}
            totalSupply={lendStore.choosenToken?.totalAssetSupply}
            setupLtv={lendStore.choosenToken?.setupLtv}
            userBalance={getTokenBalance()}
            decimals={lendStore.choosenToken?.decimals}
            amount={vm.borrowAmount}
            setAmount={vm.setBorrowAmount}
            assetId={lendStore.choosenToken?.assetId}
            onMaxClick={(arg) => borrowMaxClickFunc(arg!)}
            onSubmit={vm.submitBorrow}
            onClose={vm.onCloseModal}
            isAgree={isBorrowAgree}
            onChange={setBorrowAgree}
          />
        )}
        {lendStore.dashboardModalStep === 3 && (
          <RepayAssets
            setupBorrowAPR={lendStore.choosenToken?.setupBorrowAPR}
            assetName={tokenFilteredData?.name}
            assetSymbol={tokenFilteredData?.symbol}
            rate={lendStore.choosenToken?.currentPrice}
            selfBorrow={lendStore.choosenToken?.selfBorrow}
            totalSupply={lendStore.choosenToken?.totalAssetSupply}
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
      </ListWrapper>
    </Root>
  );
};
export default observer(WalletModalBody);
