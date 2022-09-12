import styled from '@emotion/styled';
import React from 'react';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import { Button } from '@src/UIKit/Button';
import LoggedInAccountInfo from '@components/Wallet/LoggedInAccountInfo';
import LoginModal from './LoginModal';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40%;

  @media (min-width: 880px) {
    width: 100%;
  }
`;

const Wallet: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const { address } = accountStore;

  return (
    <Root>
      {address == null ? (
        <Button
          style={{ marginLeft: 'auto' }}
          size="medium"
          maxWidth="156px"
          onClick={() => accountStore.setLoginModalOpened(true)}
          fixed>
          Connect wallet
        </Button>
      ) : (
        <LoggedInAccountInfo />
      )}
      <LoginModal
        visible={accountStore.loginModalOpened}
        onLogin={(loginType) => accountStore.login(loginType)}
        onClose={() => accountStore.setLoginModalOpened(false)}
      />
    </Root>
  );
};
export default observer(Wallet);
