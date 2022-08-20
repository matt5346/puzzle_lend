import React from 'react';
import styled from "@emotion/styled";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "@src/common/constants";
import { Column } from "@src/common/styles/Flex";
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
      <Routes>
        {/* Base */}
        <Route path={ROUTES.ROOT} element={<Home />} />
        {/* Dashboard */}
        <Route path={ROUTES.DASH} element={<Dashboard />} />
      </Routes>
    </Root>
  );
}

export default App;
