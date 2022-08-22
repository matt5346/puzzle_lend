import styled from '@emotion/styled';
import React from 'react';
import RcDialog from 'rc-dialog';
import { IDialogPropTypes } from 'rc-dialog/lib/IDialogPropTypes';
import { ReactComponent as CloseIcon } from '@src/common/assets/icons/close.svg';
import { Text } from '@src/UIKit/Text';
import { SizedBox } from '@src/UIKit/SizedBox';
import DashboardModalBody from '@src/pages/dashboard/modal/DashboardModalBody';
import { DashboardWalletVMProvider } from '@src/pages/dashboard/modal/DashboardWalletVM';
import { observer } from 'mobx-react-lite';
import './wallet.css';

type IProps = IDialogPropTypes;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const DashboardModal: React.FC<IProps> = ({ ...rest }) => (
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
        <DashboardModalBody />
      </Root>
    </DashboardWalletVMProvider>
  </RcDialog>
);

export default observer(DashboardModal);
