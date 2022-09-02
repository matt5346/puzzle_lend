import React from 'react';
import { useStores } from '@src/stores';
import styled from '@emotion/styled';
import { Row, Column } from '@src/common/styles/Flex';
import { DashboardVMProvider } from '@src/pages/dashboard/DashboardVm';
import DashboardTable from '@src/pages/dashboard/DashboardTable';
import Container from '@src/common/styles/Container';
import { Text } from '@src/UIKit/Text';
import { Dropdown } from '@src/UIKit/Dropdown';
import { observer } from 'mobx-react-lite';
import { SizedBox } from '@src/UIKit/SizedBox';
import { LoginTypesRender } from '@src/components/Wallet/LoginModal';
import { LOGIN_TYPE } from '@src/stores/AccountStore';
import UserInfo from '@src/pages/dashboard/UserInfo';
import LoginSideView from '@src/pages/dashboard/LoginSideView';

// images
import DashOne from '@src/common/assets/dashboard/dash1.png';
import DashTwo from '@src/common/assets/dashboard/dash2.png';
import DashThree from '@src/common/assets/dashboard/dash3.png';
import DashFour from '@src/common/assets/dashboard/dash4.png';

const SubTitleWrap = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const TitleH = styled.h1`
  display: flex;
  color: #363870;
  font-weight: 500;
  margin: 0;

  b {
    color: #7075e9;
  }

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
  width: 24%;
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 85%;
  margin-top: 60px;

  span {
    color: #7075e9;
  }
`;

const CardImg = styled.img`
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 0 16px 16px 0;
`;

const SideViewWrap = styled.div`
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
  const { accountStore, tokenStore } = useStores();
  const { address } = accountStore;
  const isKeeperDisabled = !accountStore.isWavesKeeperInstalled;

  const handleLogin = (loginType: LOGIN_TYPE) => {
    console.log(loginType, 'LOGIN');
    accountStore.login(loginType);
  };

  return (
    <DashboardVMProvider>
      <Container>
        <TitleH>
          Earn interest, borrow assets. Total liquidity: <b>&nbsp;$ {tokenStore.poolTotal.toFixed(2)}</b>
        </TitleH>

        <SubTitleWrap>
          <Text size="medium">
            Get interest and borrow more than 6 assets at low rate on Puzzle Lend DeFi lending protocol, which are the
            fastest growing platform on Waves
          </Text>
        </SubTitleWrap>

        <Row justifyContent="space-between">
          <Column crossAxisSize="max">
            <DashboardTable />
          </Column>
          <SizedBox width={40} />
          {address == null ? (
            <SideViewWrap>
              <SizedBox height={34} />
              <LoginSideView isKeeperDisabled={isKeeperDisabled} handleLogin={handleLogin} />
            </SideViewWrap>
          ) : (
            <SideViewWrap>
              <SizedBox height={34} />
              <UserInfo />
            </SideViewWrap>
          )}
        </Row>

        <SizedBox height={96} />
        <TitleH>What is Puzzle Lend?</TitleH>
        <Row justifyContent="space-between">
          <Card>
            <CardImg src={DashOne} />
            <CardText>
              <Text type="primary" weight={500}>
                Deposit assets
              </Text>
              <SizedBox height={14} />
              <Text size="medium">
                You can pick any tokens from the <span>Waves Ecosystem</span> to put them into markets and start earning
                Supply rewards.
              </Text>
            </CardText>
          </Card>
          <Card>
            <CardImg src={DashTwo} />
            <CardText>
              <Text type="primary" weight={500}>
                Borrow funds
              </Text>
              <SizedBox height={14} />
              <Text size="medium">
                You can borrow assets from the market to use for <span>extending your DeFi experience.</span> Take into
                account that you will pay Borrow interest for it.
              </Text>
            </CardText>
          </Card>
          <Card>
            <CardImg src={DashThree} />
            <CardText>
              <Text type="primary" weight={500}>
                Leverage position
              </Text>
              <SizedBox height={14} />
              <Text size="medium">
                You can use lending protocol <br /> to take long or short positions with an{' '}
                <span>upto 3x leverage.</span>
              </Text>
            </CardText>
          </Card>
          <Card>
            <CardImg src={DashFour} />
            <CardText>
              <Text type="primary" weight={500}>
                Avoid liquidations
              </Text>
              <SizedBox height={14} />
              <Text size="medium">
                Use an advanced Oracle system based on the TWAP model, which guarantees that the
                <span>market cannot be manipulated</span> to liquidate safe positions.
              </Text>
            </CardText>
          </Card>
        </Row>

        <SizedBox height={106} />

        <Row>
          <FAQ>
            <TitleH>FAQ</TitleH>
            <Text size="medium" type="secondary">
              Get answers on the most
            </Text>
            <Text size="medium" type="secondary">
              asked questions
            </Text>
          </FAQ>
          <Column>
            <Dropdown isOpened title="What is the idea of Puzzle Lend?">
              Puzzle Lend uses an experience of existing Lending Protocols to maximise the user experience. Thanks to an
              isolated market model, Puzzle Lend enables to supply/borrow even small-cap assets presented in the Waves
              Ecosystem.
            </Dropdown>
            <SizedBox height={10} />
            <Dropdown title="What are the risks of using Puzzle Lend?">
              WFor supplying an asset, there are 2 types of risks. The first one is the utilisation ratio: if it reaches
              100%, you will be temporarily not able to withdraw your deposit. The second one is the smart contract
              risk: we don’t recommend putting a significant amount of supply before Puzzle Lend smart contracts get
              official audits.
            </Dropdown>
            <SizedBox height={10} />
            <Dropdown title="What is Supply and Borrow APY?">
              APY means compounded percent calculated for daily interest by the formula: APY = 100% * ((1 + interest) **
              365 - 1). It demonstrates the percentage value of your deposit/debt change, if you don’t operate with it
              for a year.
            </Dropdown>
            <SizedBox height={10} />
            <Dropdown title="How many funds can I borrow?">
              To borrow assets, you need to deposit some collateral. After you supply an asset, the available amount to
              borrow will be shown. It’s calculated according to the LTV (loan-to-value) factor of your deposit.
            </Dropdown>
            <SizedBox height={100} />
          </Column>
        </Row>
      </Container>
    </DashboardVMProvider>
  );
};

export default observer(Dashboard);
