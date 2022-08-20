import React from 'react';
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "@src/common/constants";
import { Column } from "@src/common/styles/Flex";
import Header from "@components/Header";
import './App.css';

// pages
import Home from "@src/pages/home/Home";
import Dashboard from "@src/pages/dashboard/Dashboard";

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: #f8f8ff;
  min-height: 100vh;
`;

const App: React.FC = () => {
  return (
    <Root>
      <Header />
      <Routes>
        {/* Base */}
        <Route path={ROUTES.HOME} element={<Home />} />
        {/* Dashboard */}
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
      </Routes>
    </Root>
  );
}

export default observer(App);

