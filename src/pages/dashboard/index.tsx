/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect, useState, useReducer } from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { useStores } from '@src/stores';
import { IToken } from '@src/common/constants';
import { Row, Column } from '@src/common/styles/Flex';
import { DashboardVMProvider } from '@src/pages/dashboard/DashboardVm';
import useWindowSize from '@src/hooks/useWindowSize';
import DashboardTable from '@src/pages/dashboard/DashboardTable';
import Container from '@src/common/styles/Container';
import LinkItem from '@src/common/styles/LinkItem';
import { Text } from '@src/UIKit/Text';
import { Button } from '@src/UIKit/Button';
import { Preloader } from '@src/UIKit/Preloader';
import { Dropdown } from '@src/UIKit/Dropdown';
import { SizedBox } from '@src/UIKit/SizedBox';
import { LOGIN_TYPE } from '@src/stores/AccountStore';
import UserInfo from '@src/pages/dashboard/UserInfo';
import LoginSideView from '@src/pages/dashboard/LoginSideView';
import mainBg from '@src/common/assets/main_bg.png';

// images
import DashOne from '@src/common/assets/dashboard/dash1.png';
import DashTwo from '@src/common/assets/dashboard/dash2.png';
import DashThree from '@src/common/assets/dashboard/dash3.png';
import DashFour from '@src/common/assets/dashboard/dash4.png';

const SubTitleWrap = styled.div`
  width: 100%;
  margin-bottom: 24px;
`;

const PreloaderWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
`;

const SubTitleLiquidity = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  background-image: url(${mainBg});
  background-size: cover;
  background-position: center;
  padding: 8px 20px;
  width: calc(100% - 40px);
  border-radius: 10px;
  margin-top: 24px;

  @media (min-width: 880px) {
    margin-top: 0;
  }
`;

const TitleH = styled.h1`
  display: flex;
  color: #363870;
  font-weight: 500;
  margin: 0;
  flex-direction: column;
  word-break: break-word;

  span {
    color: #7075e9;
  }

  &:first-of-type {
    margin-bottom: 10px;
  }

  &:last-of-type {
    margin-bottom: 8px;
  }

  @media (min-width: 560px) {
    flex-direction: row;
  }
`;

const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .card {
    width: 100%;
    margin-bottom: 24px;

    @media (min-width: 560px) {
      width: 48%;
    }

    @media (min-width: 880px) {
      width: 24%;
      margin-bottom: 0;
    }
  }
`;

const DashHeader = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 880px) {
    flex-direction: row;
  }
`;

const Card = styled.div`
  position: relative;
  min-height: 250px;
  display: flex;
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
  align-self: flex-start;
  width: 100%;
  align-items: center;

  @media (min-width: 880px) {
    width: 50%;
    margin: 0 auto 20px auto;
  }

  @media (min-width: 1270px) {
    position: sticky;
    top: 117px;
    max-width: 315px;
    width: 30%;
    margin-top: 64px;
  }
`;

const FAQ = styled.div`
  width: 100%;
  margin-right: 100px;
  margin-bottom: 24px;

  @media (min-width: 880px) {
    margin-bottom: 0;
    width: 20%;
  }
`;

const Dashboard: React.FC = () => {
  const { accountStore, tokenStore, lendStore } = useStores();
  const { windowWidth } = useWindowSize();
  const { address } = accountStore;
  const isKeeperDisabled = !accountStore.isWavesKeeperInstalled;
  const history = useLocation();

  const [filteredTokens, setFilteredTokens] = useState<IToken[]>([]);
  const [showBorrow, showBorrowTable] = useState<boolean>(false);
  const [showSupply, showSupplyTable] = useState<boolean>(false);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    forceUpdate();
    const poolsData = tokenStore.poolDataTokens;

    if (poolsData.every((item) => +tokenStore.poolDataTokensWithStats[item.assetId].selfBorrow === 0))
      showBorrowTable(false);

    if (poolsData.every((item) => +tokenStore.poolDataTokensWithStats[item.assetId].selfSupply === 0))
      showSupplyTable(false);

    // filtering USER supply/borrow values
    // for showing or hiding supply/borrow TABLES
    poolsData.forEach((t) => {
      const stats = tokenStore.poolDataTokensWithStats[t.assetId];

      if (showBorrow === false && Number(stats.selfBorrow) > 0) {
        showBorrowTable(true);
      }

      if (showBorrow === false && Number(stats.selfSupply) > 0) {
        showSupplyTable(true);
      }
    });

    setFilteredTokens(poolsData);
  }, [showBorrow, tokenStore.poolDataTokensWithStats, tokenStore.poolDataTokens, history]);

  const handleLogin = (loginType: LOGIN_TYPE) => {
    accountStore.login(loginType);
  };

  const currentPoolData = tokenStore.poolStatsByContractId[lendStore.activePoolContract];

  return (
    <DashboardVMProvider>
      <Container>
        <DashHeader>
          <TitleH>
            Lending protocol built on the<>&nbsp;</>
            <span>Waves blockchain</span>
          </TitleH>
        </DashHeader>

        <SubTitleWrap>
          <Text size="medium-2">Supply and borrow tokens using different pools</Text>
        </SubTitleWrap>

        <Row justifyContent="space-between" style={windowWidth! < 1270 ? { flexWrap: 'wrap' } : { flexWrap: 'unset' }}>
          <Column
            crossAxisSize="max"
            style={windowWidth! < 1270 ? { order: 2, position: 'relative' } : { order: 0, position: 'relative' }}>
            <SubTitleLiquidity>
              <Text size="medium" type="light" fitContent>
                {lendStore && lendStore.activePoolTitle ? lendStore.activePoolTitle : ''} liquidity: <>&nbsp;</>
              </Text>
              <Text style={{ fontSize: '18px' }} type="light" fitContent>
                ${currentPoolData?.poolTotal.toFormat(2)}
              </Text>
            </SubTitleLiquidity>
            <DashboardTable
              filteredTokens={filteredTokens}
              showSupply={showSupply}
              showBorrow={showBorrow}
              showAll
              isUserStats={false}
            />
            {lendStore.isLoading && (
              <PreloaderWrap>
                <Preloader />
              </PreloaderWrap>
            )}
          </Column>
          <SizedBox width={40} />
          {address == null ? (
            <SideViewWrap>
              <SizedBox height={34} />
              <LoginSideView isKeeperDisabled={isKeeperDisabled} handleLogin={handleLogin} />
              <SizedBox height={12} />
              {windowWidth! < 880 && (
                <Button size="medium" maxWidth="156px" fixed>
                  <LinkItem target="_blank" href="https://puzzle-lend.gitbook.io/guidebook/" inverse isRouterLink>
                    Check GuideBook
                  </LinkItem>
                </Button>
              )}
            </SideViewWrap>
          ) : (
            <SideViewWrap>
              <SizedBox height={34} />
              <UserInfo />
            </SideViewWrap>
          )}
        </Row>

        {address == null ? (
          <Column>
            <SizedBox height={96} />
            <TitleH>What is Puzzle Lend?</TitleH>
            <CardsWrapper>
              <Card className="card">
                <CardImg src={DashOne} />
                <CardText>
                  <Text type="primary" weight={500}>
                    Deposit assets
                  </Text>
                  <SizedBox height={14} />
                  <Text size="medium">
                    You can pick any tokens from the <span>Waves Ecosystem</span> to put into markets and start earning
                    Supply rewards.
                  </Text>
                </CardText>
              </Card>
              <Card className="card">
                <CardImg src={DashTwo} />
                <CardText>
                  <Text type="primary" weight={500}>
                    Borrow funds
                  </Text>
                  <SizedBox height={14} />
                  <Text size="medium">
                    You can borrow assets from the market to use for <span>extending your DeFi experience.</span> Take
                    into account that you will pay Borrow interest for it.
                  </Text>
                </CardText>
              </Card>
              <Card className="card">
                <CardImg src={DashThree} />
                <CardText>
                  <Text type="primary" weight={500}>
                    Leverage positions
                  </Text>
                  <SizedBox height={14} />
                  <Text size="medium">
                    You can use lending protocol <br /> to take long or short positions with{' '}
                    <span>up to 3x leverage.</span>
                  </Text>
                </CardText>
              </Card>
              <Card className="card">
                <CardImg src={DashFour} />
                <CardText>
                  <Text type="primary" weight={500}>
                    Avoid liquidations
                  </Text>
                  <SizedBox height={14} />
                  <Text size="medium">
                    Use an advanced Oracle system based on the TWAP model, which guarantees that the{' '}
                    <span>market cannot be manipulated</span> to liquidate safe positions.
                  </Text>
                </CardText>
              </Card>
            </CardsWrapper>
          </Column>
        ) : null}

        <SizedBox height={106} />

        <Row style={windowWidth! < 880 ? { flexDirection: 'column' } : { flexDirection: 'row' }}>
          <FAQ>
            <TitleH>FAQ</TitleH>
            <Text size="medium" type="secondary">
              Answers to the most
            </Text>
            <Text size="medium" type="secondary">
              asked questions
            </Text>
          </FAQ>
          <Column>
            <Dropdown isOpened title="What is the idea of Puzzle Lend?">
              Puzzle Lend has been created with the best practices of existing Lending Protocols in mind to enhance the
              user experience. Thanks to an isolated market model, Puzzle Lend enables to supply/borrow even small-cap
              assets presented in the Waves Ecosystem.
            </Dropdown>
            <SizedBox height={10} />
            <Dropdown title="What are the risks of using Puzzle Lend?">
              When supplying an asset, there are 2 types of risks. The first one is the utilisation ratio: if it reaches
              100%, you will be temporarily unable to withdraw your deposit. The second one is the smart contract risk:
              we don’t recommend putting a significant amount of supply before Puzzle Lend smart contracts get official
              audits.
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
