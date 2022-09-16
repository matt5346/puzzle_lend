import React from 'react';
import styled from '@emotion/styled';
import Dialog from '@components/Dialog';
import { LOGIN_TYPE } from '@src/stores/AccountStore';
import seed from '@src/common/assets/icons/seed.svg';
import email from '@src/common/assets/icons/email.svg';
import keeper from '@src/common/assets/icons/keeper.svg';
import { observer } from 'mobx-react-lite';
import { useStores } from '@src/stores';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import { Anchor } from '@src/UIKit/Anchor';
import LoginType from './LoginType';

interface IProps {
  onClose: () => void;
  onLogin: (loginType: LOGIN_TYPE) => void;
  visible: boolean;
}

const loginTypes = [
  {
    title: 'Waves Exchange Email',
    icon: email,
    type: LOGIN_TYPE.SIGNER_EMAIL,
  },
  {
    title: 'Waves Exchange Seed',
    icon: seed,
    type: LOGIN_TYPE.SIGNER_SEED,
  },
  {
    title: 'Waves Keeper',
    icon: keeper,
    type: LOGIN_TYPE.KEEPER,
  },
];

const LinkItem = styled(Anchor)<{ selected?: boolean }>`
  display: inline-block;
  text-decoration: none;
  color: #7075e9;

  &:hover {
    text-decoration: underline;
    color: #8082c5;
  }
`;

const Desktop = styled.div`
  display: none;
  min-width: fit-content;
  @media (min-width: 880px) {
    height: 100%;
    display: flex;
  }
`;

export const LoginTypesRender: React.FC<{
  isKeeperDisabled: boolean;
  handleLogin: (type: LOGIN_TYPE) => void;
}> = ({ isKeeperDisabled, handleLogin }) => (
  <Column alignItems="unset" crossAxisSize="max">
    {loginTypes.map((t) =>
      t.type === LOGIN_TYPE.KEEPER && isKeeperDisabled ? (
        <LoginType {...t} key={t.type} />
      ) : (
        <LoginType {...t} key={t.type} onClick={() => handleLogin(t.type)} />
      )
    )}
    <SizedBox height={24} />
    <Text textAlign="center" size="medium">
      New to Waves blockchain?{' '}
      <LinkItem
        target="_blank"
        href="https://docs.waves.exchange/en/waves-exchange/waves-exchange-online-desktop/online-desktop-account/online-desktop-creation">
        Learn more about wallets
      </LinkItem>
    </Text>
    <SizedBox height={24} />
  </Column>
);

const LoginModal: React.FC<IProps> = ({ onLogin, ...rest }) => {
  const handleLogin = (loginType: LOGIN_TYPE) => {
    rest.onClose();
    onLogin(loginType);
  };
  const { accountStore } = useStores();
  const isKeeperDisabled = !accountStore.isWavesKeeperInstalled;
  return (
    <Dialog style={{ maxWidth: 360 }} title="Connect wallet" {...rest}>
      <LoginTypesRender isKeeperDisabled={isKeeperDisabled} handleLogin={handleLogin} />
    </Dialog>
  );
};

export default observer(LoginModal);
