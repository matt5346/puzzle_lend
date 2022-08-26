import styled from '@emotion/styled';
import React, { useState } from 'react';
import { Column, Row } from '@src/common/styles/Flex';
import { observer } from 'mobx-react-lite';
import { Scrollbar } from '@src/UIKit/Scrollbar';
import { SizedBox } from '@src/UIKit/SizedBox';
import { useWalletVM } from '@components/Wallet/WalletModal/WalletVM';
import { Tabs } from '@src/UIKit/Tabs';
import AssetsBalances from '@components/Wallet/WalletModal/AssetsBalances';
import Borrow from '@src/components/Wallet/WalletModal/Borrow';
import Supply from '@src/components/Wallet/WalletModal/Supply';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const Root = styled(Column)`
  width: 100%;
  box-sizing: border-box;
  background: #fff;

  & > * {
    width: 100%;
  }
`;

const TabsWrapper = styled(Row)`
  border-radius: 16px 16px 0px 0px;
  background: #fff;
  height: 56px;
  margin-top: -56px;
`;

const ListWrapper = styled.div<{ headerExpanded: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  transition: 0.4s;
  height: ${({ headerExpanded }) => (headerExpanded ? 'calc(100vh - 212px)' : 'calc(100vh - 96px)')};

  @media (min-width: 560px) {
    height: ${({ headerExpanded }) => (headerExpanded ? 'calc(560px - 212px)' : 'calc(560px - 96px)')};
  }
`;

const WalletModalBody: React.FC<IProps> = () => {
  const vm = useWalletVM();
  const handleScroll = (container: HTMLElement) => {
    vm.setHeaderExpanded(container.scrollTop === 0);
  };
  const [activeTab, setActiveTab] = useState<number>(0);
  return (
    <Root>
      <TabsWrapper>
        <Tabs
          tabs={[{ name: 'Assets' }, { name: 'Supply' }, { name: 'Borrow' }]}
          activeTab={activeTab}
          setActive={(v) => setActiveTab(v)}
          style={{ justifyContent: 'space-evenly', paddingTop: 16 }}
          tabStyle={{ flex: 1, marginRight: 0 }}
        />
      </TabsWrapper>
      <Scrollbar onScrollY={handleScroll}>
        <ListWrapper headerExpanded={vm.headerExpanded}>
          <SizedBox height={8} />
          {activeTab === 0 && <AssetsBalances />}
          {activeTab === 1 && <Supply />}
          {activeTab === 2 && <Borrow />}
          <SizedBox height={64} width={1} />
        </ListWrapper>
      </Scrollbar>
    </Root>
  );
};
export default observer(WalletModalBody);
