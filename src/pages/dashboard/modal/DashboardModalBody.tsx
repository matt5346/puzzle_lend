/* eslint-disable no-bitwise */
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { Column, Row } from '@src/common/styles/Flex';
import { observer } from 'mobx-react-lite';
import { Scrollbar } from '@src/UIKit/Scrollbar';
import { SizedBox } from '@src/UIKit/SizedBox';
import { DashboardWalletUseVM } from '@src/pages/dashboard/modal/DashboardWalletVM';
import { Tabs } from '@src/UIKit/Tabs';
import SupplyAssets from '@src/pages/dashboard/modal/SupplyAssets';
import WithdrawAssets from '@src/pages/dashboard/modal/WithdrawAssets';
import BN from '@src/common/utils/BN';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const Root = styled(Column)`
  width: 100%;
  box-sizing: border-box;
  background: #1d2431;

  & > * {
    width: 100%;
  }
`;

const TabsWrapper = styled(Row)`
  border-radius: 16px 16px 0px 0px;
  background: #1d2431;
  height: 56px;
  margin-top: -56px;
`;

const ListWrapper = styled.div<{ headerExpanded: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  transition: 0.4s;
  overflow: hidden;
`;

const WalletModalBody: React.FC<IProps> = () => {
  const vm = DashboardWalletUseVM();
  const { lendStore } = vm.rootStore;
  const [activeTab, setActiveTab] = useState<number>(0);

  const amountMaxClickFunc = () => {
    const getAssetData = vm.balances.find((tokenData) => tokenData.assetId === lendStore.choosenToken.assetId);

    if (getAssetData) vm.setSupplyAmount(getAssetData.balance!);
  };

  console.log(vm, 'ASSETS vm');
  console.log(lendStore, 'ASSETS lendStore');

  return (
    <Root>
      <TabsWrapper>
        <Tabs
          tabs={[{ name: 'Supply assets' }, { name: 'Withdraw assets' }]}
          activeTab={activeTab}
          setActive={(v) => setActiveTab(v)}
          style={{ justifyContent: 'space-evenly', paddingTop: 16 }}
          tabStyle={{ flex: 1, marginRight: 0 }}
        />
      </TabsWrapper>
      <ListWrapper headerExpanded={vm.headerExpanded}>
        <SizedBox height={8} />
        {activeTab === 0 && (
          <SupplyAssets
            decimals={lendStore.choosenToken?.decimals}
            amount={vm.supplyAmount}
            setAmount={vm.setSupplyAmount}
            assetId={lendStore.choosenToken?.assetId}
            onMaxClick={amountMaxClickFunc}
            onSubmit={vm.submitSupply}
          />
        )}
        {activeTab === 1 && <WithdrawAssets />}
        <SizedBox height={64} width={1} />
      </ListWrapper>
    </Root>
  );
};
export default observer(WalletModalBody);
