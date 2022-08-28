import React from 'react';
import styled from '@emotion/styled';
import { Row, Column } from '@src/common/styles/Flex';
import { DashboardVMProvider } from '@src/pages/dashboard/DashboardVm';
import DashboardTable from '@src/pages/dashboard/DashboardTable';
import UserInfo from '@src/pages/dashboard/UserInfo';
import Container from '@src/common/styles/Container';
import { Text } from '@src/UIKit/Text';
import { Dropdown } from '@src/UIKit/Dropdown';
import { observer } from 'mobx-react-lite';
import { SizedBox } from '@src/UIKit/SizedBox';

// images
import DashOne from '@src/common/assets/dashboard/dash1.png';
import DashTwo from '@src/common/assets/dashboard/dash2.png';
import DashThree from '@src/common/assets/dashboard/dash3.png';
import DashFour from '@src/common/assets/dashboard/dash4.png';

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

const Card = styled.div`
  position: relative;
  min-height: 250px;
  display: flex;
  width: 22%;
  border: 1px solid #f1f2fe;
  border-radius: 16px;
  box-sizing: border-box;
  padding: 16px;
  background: #ffffff;

  &:last-of-type {
    margin-bottom: 20px;
  }

  @media (min-width: 560px) {
    padding: 24px;
  }
`;

const CardText = styled.div`
  position: absolute;
  width: 60%;
  bottom: 16px;
  left: 16px;
`;

const CardImg = styled.img`
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 0 16px 16px 0;
`;

const UserInfoAside = styled.div`
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  align-self: flex-start;
`;

const FAQ = styled.div`
  width: 20%;
  margin-right: 100px;
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
          <UserInfoAside>
            <SizedBox height={34} />
            <UserInfo />
          </UserInfoAside>
        </Row>

        <SizedBox height={96} />
        <TitleH>What is Puzzle Lend?</TitleH>
        <Row justifyContent="space-between">
          <Card>
            <CardImg src={DashOne} />
            <CardText>
              <Text type="primary" weight={500}>
                Supply
              </Text>
              <SizedBox height={14} />
              <Text size="medium">Supply into the protocol and watch your assets grow as a liquidity provider</Text>
            </CardText>
          </Card>
          <Card>
            <CardImg src={DashTwo} />
            <CardText>
              <Text type="primary" weight={500}>
                Stake
              </Text>
              <SizedBox height={14} />
              <Text size="medium">
                Deposit your Puzzle into the protocol and earn rewards for securing the protocol
              </Text>
            </CardText>
          </Card>
          <Card>
            <CardImg src={DashThree} />
            <CardText>
              <Text type="primary" weight={500}>
                Supply
              </Text>
              <SizedBox height={14} />
              <Text size="medium">Borrow against your collateral from across multiple networks and assets</Text>
            </CardText>
          </Card>
          <Card>
            <CardImg src={DashFour} />
            <CardText>
              <Text type="primary" weight={500}>
                Supply
              </Text>
              <SizedBox height={14} />
              <Text size="medium">
                Participate in Puzzle governance and vote on new proposals, new assets, and protocol upgrades
              </Text>
            </CardText>
          </Card>
        </Row>

        <SizedBox height={106} />

        <Row>
          <FAQ>
            <TitleH>FAQ</TitleH>
            <Text>Get answers on the most</Text>
            <Text>asked questions</Text>
          </FAQ>
          <Column>
            <Dropdown title="What is a borrow APY">
              When you are borrowing, you are paying a Borrow APY to the pool (for the users who supplied). This borrow
              APY is calculated based on the Parameters & The Math, and are displayed on our UI when you borrow. Borrow
              APY is added to your loan on a per-slot basis, so the amount of money you have to repay goes up over time.
            </Dropdown>
            <SizedBox height={10} />
            <Dropdown title="What is a borrow APY">
              When you are borrowing, you are paying a Borrow APY to the pool (for the users who supplied). This borrow
              APY is calculated based on the Parameters & The Math, and are displayed on our UI when you borrow. Borrow
              APY is added to your loan on a per-slot basis, so the amount of money you have to repay goes up over time.
            </Dropdown>
            <SizedBox height={10} />
            <Dropdown title="What is a borrow APY">
              When you are borrowing, you are paying a Borrow APY to the pool (for the users who supplied). This borrow
              APY is calculated based on the Parameters & The Math, and are displayed on our UI when you borrow. Borrow
              APY is added to your loan on a per-slot basis, so the amount of money you have to repay goes up over time.
            </Dropdown>
          </Column>
        </Row>
      </Container>
    </DashboardVMProvider>
  );
};

export default observer(Dashboard);
