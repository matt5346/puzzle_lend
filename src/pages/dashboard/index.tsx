import React from 'react';
import { ExploreVMProvider } from '@src/pages/dashboard/DashboardVm';
import DashboardTable from '@src/pages/dashboard/DashboardTable';
import Container from '@src/common/styles/Container';

const Dashboard: React.FC = () => {
  return (
    <ExploreVMProvider>
      <Container>
        <DashboardTable />
      </Container>
    </ExploreVMProvider>
  );
};

export default Dashboard;
