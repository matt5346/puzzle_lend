import React from 'react';
import styled from '@emotion/styled';
import { Row, Column } from '@src/common/styles/Flex';
import { DashboardVMProvider } from '@src/pages/dashboard/DashboardVm';
import DashboardTable from '@src/pages/dashboard/DashboardTable';
import UserInfo from '@src/pages/dashboard/UserInfo';
import Container from '@src/common/styles/Container';
import { Text } from '@src/UIKit/Text';
import { observer } from 'mobx-react-lite';
import { SizedBox } from '@src/UIKit/SizedBox';

const SubTitleWrap = styled.div`
  width: 50%;
  margin-bottom: 40px;
`;

const TitleH = styled.h1`
  display: flex;
  color: #363870;
  font-weight: 500;
  margin: 0;

  &:first-of-type {
    margin-bottom: 10px;
  }

  &:last-of-type {
    margin-bottom: 20px;
  }
`;

const Dashboard: React.FC = () => {
  return (
    <DashboardVMProvider>
      <Container>
        <TitleH>Earn interest, borrow assets.</TitleH>
        <TitleH>Total liquidity: $281,605,117</TitleH>
        <SubTitleWrap>
          <Text>
            Get interest and borrow more than 6 assets at low rate on Puzzle Lend DeFi lending protocol, which are the
            fastecst growing platform on Waves
          </Text>
        </SubTitleWrap>
        <Row justifyContent="space-between">
          <Column crossAxisSize="max">
            <DashboardTable />
          </Column>
          <SizedBox width={40} />
          <Column>
            <SizedBox height={34} />
            <UserInfo />
          </Column>
        </Row>
      </Container>
    </DashboardVMProvider>
  );
};

export default observer(Dashboard);
