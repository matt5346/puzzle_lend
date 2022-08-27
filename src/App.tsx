import React from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { Route, Routes } from 'react-router-dom';
import { ROUTES } from '@src/common/constants';

import { useStores } from '@src/stores';

// components
import Header from '@components/Header';
import WalletModal from '@components/Wallet/WalletModal';

// pages
import Home from '@src/pages/home/Home';
import Dashboard from '@src/pages/dashboard';

// css
import { Column } from '@src/common/styles/Flex';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'rc-notification/assets/index.css';
import 'react-loading-skeleton/dist/skeleton.css';
import 'rc-dialog/assets/index.css';
import './App.css';

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: #f8f8ff;
  min-height: 100vh;
  color: #000;
`;

const App: React.FC = () => {
  const { accountStore } = useStores();
  return (
    <Root>
      <Header />
      <Routes>
        {/* Base */}
        <Route path={ROUTES.HOME} element={<Home />} />
        {/* Dashboard */}
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
      </Routes>
      <WalletModal onClose={() => accountStore.setWalletModalOpened(false)} visible={accountStore.walletModalOpened} />
    </Root>
  );
};

export default observer(App);
