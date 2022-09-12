import React from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ROUTES } from '@src/common/constants';

import { useStores } from '@src/stores';
import useWindowSize from '@src/hooks/useWindowSize';

// components
import Header from '@components/Header';
import MobileFooterMenu from '@components/MobileFooter';
import WalletModal from '@components/Wallet/WalletModal';

// pages
import Dashboard from '@src/pages/dashboard';
import DashboardToken from '@src/pages/dashboardToken';
import UserStats from '@src/pages/userStats';
import UsersList from '@src/pages/usersList';
import NotFoundPage from '@src/pages/notFound';

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
  const { accountStore, tokenStore, usersStore } = useStores();
  const { windowWidth } = useWindowSize();

  return (
    <Root>
      <Header />

      <Routes>
        {/* Base */}
        <Route path={ROUTES.HOME} element={<Navigate to="/dashboard" />} />
        {/* for main pool with default route */}
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        {/* for pools on MOBILE */}
        <Route path={ROUTES.HOME} element={<Navigate to="/dashboard" />} />
        {windowWidth! < 560 ? <Route path={ROUTES.DASHBOARD_MOBILE} element={<Dashboard />} /> : null}
        {/* for other pools with ids routes */}
        <Route path={ROUTES.DASHBOARD_POOl} element={<Dashboard />} />
        {/* specific USER STATS */}
        <Route path={ROUTES.USER_STATS} element={<UserStats />} />
        <Route path={ROUTES.USERS_LIST} element={<UsersList />} />
        {tokenStore.poolDataTokensWithStats && <Route path={ROUTES.DASHBOARD_TOKEN} element={<DashboardToken />} />}
        {/* 404 */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <WalletModal onClose={() => accountStore.setWalletModalOpened(false)} visible={accountStore.walletModalOpened} />
      {windowWidth! < 560 ? <MobileFooterMenu /> : null}
    </Root>
  );
};

export default observer(App);
