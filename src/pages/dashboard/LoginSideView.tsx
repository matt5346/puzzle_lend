/* eslint-disable react/require-default-props */
import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import Card from '@src/common/styles/Card';
import { Text } from '@src/UIKit/Text';
import { useDashboardVM } from '@src/pages/dashboard/DashboardVm';
import { LOGIN_TYPE } from '@src/stores/AccountStore';
import { LoginTypesRender } from '@src/components/Wallet/LoginModal';
import { SizedBox } from '@src/UIKit/SizedBox';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {
  isKeeperDisabled: boolean;
  handleLogin: (type: LOGIN_TYPE) => void;
}

const LoginHeader = styled.div`
  display: block;
  position: relative;

  &:after {
    position: absolute;
    content: '';
    bottom: -16px;
    transform: translateX(-50%);
    left: 50%;
    background-color: #f1f2fe;
    width: 110%;
    height: 1px;
  }
`;

const UserInfo: React.FC<IProps> = ({ handleLogin, isKeeperDisabled }) => {
  const vm = useDashboardVM();
  console.log(vm, 'VM-----');
  const { tokenStore } = vm.rootStore;
  console.log(tokenStore, 'tokenStore-----');

  return (
    <Card
      style={{
        padding: '24px 24px 0 24px',
        overflow: 'visible',
        maxWidth: '315px',
        position: 'relative',
      }}
      minWidth={310}
      justifyContent="center">
      <SizedBox height={8} />
      <LoginHeader>
        <Text weight={500}>Connect wallet</Text>
      </LoginHeader>
      <SizedBox height={32} />
      <LoginTypesRender isKeeperDisabled={isKeeperDisabled} handleLogin={handleLogin} />
    </Card>
  );
};

export default observer(UserInfo);
