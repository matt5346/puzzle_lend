import React from 'react';
import { ExploreVMProvider } from '@src/pages/dashboard/DashboardVm';
import DashboardTable from '@src/pages/dashboard/DashboardTable';
import DashboardModal from '@src/pages/dashboard/modal';
import Container from '@src/common/styles/Container';
import { observer } from 'mobx-react-lite';
import { useStores } from '@src/stores';

const Dashboard: React.FC = () => {
  const { lendStore } = useStores();

  return (
    <ExploreVMProvider>
      <Container>
        <DashboardModal
          onClose={() => lendStore.setDashboardModalOpened(false, '')}
          visible={lendStore.dashboardModalOpened}
        />
        <DashboardTable />
      </Container>
    </ExploreVMProvider>
  );
};

export default observer(Dashboard);
