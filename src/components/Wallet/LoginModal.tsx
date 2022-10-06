import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Dialog from '@components/Dialog';
import { LOGIN_TYPE } from '@src/stores/AccountStore';
import seed from '@src/common/assets/icons/seed.svg';
import email from '@src/common/assets/icons/email.svg';
import keeper from '@src/common/assets/icons/keeper.svg';
import { observer } from 'mobx-react-lite';
import { useStores } from '@src/stores';
import { Row, Column } from '@src/common/styles/Flex';
import LinkItem from '@src/common/styles/LinkItem';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import { Anchor } from '@src/UIKit/Anchor';
import useWindowSize from '@src/hooks/useWindowSize';
import LoginType from './LoginType';

interface IProps {
  onClose: () => void;
  onLogin: (loginType: LOGIN_TYPE) => void;
  visible: boolean;
}

export interface LoginInterface {
  title: string;
  icon: string;
  type: LOGIN_TYPE;
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

export const LoginTypesRender: React.FC<{
  isKeeperDisabled: boolean;
  handleLogin: (type: LOGIN_TYPE) => void;
}> = ({ isKeeperDisabled, handleLogin }) => {
  const { windowWidth } = useWindowSize();
  const [getLoginTypes, setLoginTypes] = useState<LoginInterface[]>([]);

  useEffect(() => {
    if (windowWidth! < 1270) setLoginTypes(loginTypes.slice(0, 2));
    else setLoginTypes(loginTypes);
  }, [windowWidth]);

  return (
    <Column alignItems="unset" crossAxisSize="max">
      {getLoginTypes.map((t) =>
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
          style={{ display: 'inline-block' }}
          target="_blank"
          href="https://docs.waves.exchange/en/waves-exchange/waves-exchange-online-desktop/online-desktop-account/online-desktop-creation">
          Learn more about wallets
        </LinkItem>
      </Text>
      <SizedBox height={24} />
    </Column>
  );
};

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
