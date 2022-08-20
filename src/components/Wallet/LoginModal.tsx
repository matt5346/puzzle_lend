import React from 'react';
import Dialog from '@components/Dialog';
import { LOGIN_TYPE } from '@src/stores/AccountStore';
import seed from '@src/common/assets/icons/seed.svg';
import email from '@src/common/assets/icons/email.svg';
import keeper from '@src/common/assets/icons/keeper.svg';
import { observer } from 'mobx-react-lite';
import { useStores } from '@src/stores';
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
const LoginModal: React.FC<IProps> = ({ onLogin, ...rest }) => {
  const handleLogin = (loginType: LOGIN_TYPE) => () => {
    rest.onClose();
    onLogin(loginType);
  };
  const { accountStore } = useStores();
  const isKeeperDisabled = !accountStore.isWavesKeeperInstalled;
  return (
    <Dialog style={{ maxWidth: 360 }} title="Connect wallet" {...rest}>
      {loginTypes.map((t) =>
        t.type === LOGIN_TYPE.KEEPER && isKeeperDisabled ? (
          <LoginType {...t} key={t.type} />
        ) : (
          <LoginType {...t} key={t.type} onClick={handleLogin(t.type)} />
        )
      )}
    </Dialog>
  );
};
export default observer(LoginModal);
