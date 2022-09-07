import React from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ROUTES } from '@src/common/constants';

import { useStores } from '@src/stores';

// components
import Header from '@components/Header';
import WalletModal from '@components/Wallet/WalletModal';

// pages
import Dashboard from '@src/pages/dashboard';
import DashboardToken from '@src/pages/dashboardToken';
import UserStats from '@src/pages/userStats';
import UsersList from '@src/pages/usersList';

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
  const { accountStore, tokenStore } = useStores();

  return (
    <Root>
      <Header />
      <Routes>
        {/* Base */}
        <Route path={ROUTES.HOME} element={<Navigate to="/dashboard" />} />
        {/* for main pool with default route */}
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        {/* for other pools with ids routes */}
        <Route path={ROUTES.DASHBOARD_POOl} element={<Dashboard />} />
        {/* specific USER STATS */}
        {tokenStore.poolDataTokensWithStats && <Route path={ROUTES.USER_STATS} element={<UserStats />} />}
        {tokenStore.poolDataTokensWithStats && <Route path={ROUTES.BORROW_SUPPLY_USERS} element={<UsersList />} />}
        {tokenStore.poolDataTokensWithStats && <Route path={ROUTES.DASHBOARD_TOKEN} element={<DashboardToken />} />}
      </Routes>
      <WalletModal onClose={() => accountStore.setWalletModalOpened(false)} visible={accountStore.walletModalOpened} />
    </Root>
  );
};

export default observer(App);
