import styled from '@emotion/styled';
import React from 'react';
import RcDialog from 'rc-dialog';
import { IDialogPropTypes } from 'rc-dialog/lib/IDialogPropTypes';
import { ReactComponent as CloseIcon } from '@src/common/assets/icons/close.svg';
import { Column, Row } from '@src/common/styles/Flex';
import { ModalTabs } from '@src/UIKit/ModalTabs';
import { SizedBox } from '@src/UIKit/SizedBox';
import DashboardModalBody from '@src/pages/dashboard/modal/DashboardModalBody';
import { DashboardWalletVMProvider, DashboardWalletUseVM } from '@src/pages/dashboard/modal/DashboardWalletVM';
import { observer } from 'mobx-react-lite';
import { useStores } from '@src/stores';
import './wallet.css';

type IProps = {
  filteredTokens: any;
  onClose: () => void;
  visible: boolean;
};

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const TabsWrapper = styled(Row)`
  border-radius: 16px 16px 0px 0px;
  background: #fff;
  height: 56px;
  margin-top: -56px;
`;

const DashboardModal: React.FC<IProps> = ({ filteredTokens, ...rest }) => {
  const { lendStore } = useStores();

  return (
    <RcDialog
      wrapClassName="dashboard-dialog"
      closeIcon={<CloseIcon style={{ marginTop: 8 }} />}
      animation="zoom"
      maskAnimation="fade"
      destroyOnClose
      {...rest}>
      <DashboardWalletVMProvider>
        <Root>
          <SizedBox height={48} />
          <SizedBox height={56} />
          <TabsWrapper>
            {lendStore.dashboardModalStep < 2 && (
              <ModalTabs
                tabs={[{ name: 'Supply' }, { name: 'Withdraw' }]}
                activeTab={lendStore.dashboardModalStep}
                setActive={(v) => lendStore.setModalStep(v)}
                style={{ padding: 8 }}
                tabStyle={{ flex: 1 }}
                indexIncrement={0}
              />
            )}
            {lendStore.dashboardModalStep > 1 && (
              <ModalTabs
                tabs={[{ name: 'Borrow' }, { name: 'Repay' }]}
                activeTab={lendStore.dashboardModalStep}
                setActive={(v) => lendStore.setModalStep(v)}
                style={{ padding: 8 }}
                tabStyle={{ flex: 1 }}
                indexIncrement={2}
              />
            )}
          </TabsWrapper>
          <DashboardModalBody filteredTokens={filteredTokens} />
        </Root>
      </DashboardWalletVMProvider>
    </RcDialog>
  );
};

export default observer(DashboardModal);
