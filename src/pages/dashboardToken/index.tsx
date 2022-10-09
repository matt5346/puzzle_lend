/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useParams, useNavigate } from 'react-router-dom';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import {
  TOKENS_LIST,
  ROUTES,
  TTokenStatistics,
  createITokenStat,
  LENDS_CONTRACTS,
  IToken,
  createIToken,
  TOKENS_LIST_FULL,
} from '@src/common/constants';
import { Text } from '@src/UIKit/Text';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import TokenData from '@src/pages/dashboardToken/TokenData';
import { Button } from '@src/UIKit/Button';
import { Anchor } from '@src/UIKit/Anchor';
import { Preloader } from '@src/UIKit/Preloader';
import Container from '@src/common/styles/Container';
import BN from '@src/common/utils/BN';

import tokenLogos from '@src/common/constants/tokenLogos';
import RoundTokenIcon from '@src/common/styles/SquareTokenIcon';
import { ReactComponent as ChevronDown } from '@src/common/assets/icons/chevron_down.svg';
import { ReactComponent as Exchange } from '@src/common/assets/icons/exchange.svg';
import { ReactComponent as Info } from '@src/common/assets/icons/info.svg';

const TokenStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;

  div {
    width: 33%;
    margin-bottom: 10px;
  }

  @media (min-width: 880px) {
    flex-wrap: unset;

    div {
      width: 16%;
    }
  }
`;

const PreloaderWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%);
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 660px;
  margin: 50px auto;

  .details-link {
    display: flex;
    justify-content: flex-start;
    color: #7075e9;
    cursor: pointer;

    svg {
      width: 20px;
      margin-right: 10px;
      transform: translateX(0) rotate(90deg);
      transition: transform 0.15s ease;
    }

    &:hover {
      text-decoration: underline;

      svg {
        transform: translateX(5px) rotate(90deg);
      }
    }
  }

  .details-link-btn {
    text-decoration: unset;
  }
`;

const DashboardToken: React.FC = () => {
  const [tokenIData, setIToken] = useState<IToken>();
  const [tokenFullData, setFilteredTokens] = useState<TTokenStatistics>();
  const [getSupplyUsers, setTotalSupplyUsers] = useState<number>(0);
  const [getBorrowUsers, setTotalBorrowUsers] = useState<number>(0);
  const { assetId } = useParams<{ assetId: string }>();
  const { tokenStore, lendStore, usersStore } = useStores();
  const { poolDataTokensWithStats } = tokenStore;
  const navigate = useNavigate();

  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6).toFormat(2);
  };

  const getUtilizationRatio = (borrow: BN, supply: BN) => {
    if (+borrow === 0 || +supply === 0) return 0;

    return borrow.div(supply).times(100).toFixed(2);
  };

  useEffect(() => {
    async function fetchMyAPI() {
      const response = await Promise.all(
        Object.values(LENDS_CONTRACTS).map(async (item) => {
          return { [item]: await tokenStore.loadTokenUsers(item) };
        })
      );
      const poolTokens = response.filter((item) => (item[lendStore.activePoolContract] ? item : false))[0];
      const currentToken = poolTokens[lendStore.activePoolContract].filter((item: any) =>
        item[assetId!] ? item : false
      )[0];

      let totalBorrowUsers = 0;
      let totalSupplyUsers = 0;

      if (currentToken && currentToken[assetId!]) {
        currentToken[assetId!].forEach((assetObj: any) => {
          const objDataSplitted = assetObj.key.split('_');

          // counting TOTAL USERS SUPPLIED
          if (objDataSplitted[1] === 'supplied' && objDataSplitted[0] !== 'total') {
            totalSupplyUsers += 1;
          }

          // counting TOTAL USERS BORROWED
          if (objDataSplitted[1] === 'borrowed' && objDataSplitted[0] !== 'total') {
            totalBorrowUsers += 1;
          }
        });
      }

      const iData: IToken = TOKENS_LIST_FULL.find((item) => item.assetId === assetId) || createIToken();
      let data: TTokenStatistics = createITokenStat();

      if (assetId && poolDataTokensWithStats) {
        data = poolDataTokensWithStats[assetId];
      }

      console.log(data, '---DATA');

      setTotalSupplyUsers(totalSupplyUsers);
      setTotalBorrowUsers(totalBorrowUsers);
      setFilteredTokens(data);
      setIToken(iData);
    }

    fetchMyAPI();
  }, [
    assetId,
    tokenStore,
    lendStore.activePoolName,
    usersStore,
    lendStore.activePoolContract,
    poolDataTokensWithStats,
  ]);

  return (
    <Root>
      <Container>
        <Text className="details-link" onClick={() => navigate(-1)}>
          <ChevronDown />
          <Text weight={500} type="blue500" fitContent>
            Back to Pools
          </Text>
        </Text>
        <SizedBox height={24} />
        {tokenIData && tokenFullData && tokenFullData.assetId && (
          <Column crossAxisSize="max">
            <Row alignItems="center">
              <RoundTokenIcon src={tokenLogos[tokenIData.symbol]} />
              <SizedBox width={8} />
              <Text size="big" weight={500} type="primary" fitContent>
                {tokenIData.name}
              </Text>
              <SizedBox width={8} />
              <Text size="big" weight={500} type="secondary" fitContent>
                {tokenIData.symbol}
              </Text>
            </Row>
            <SizedBox height={24} />
            <TokenStats>
              <Column>
                <Text size="medium" type="secondary" fitContent>
                  Total supply
                </Text>
                <Text size="medium" type="primary" fitContent>
                  {+formatVal(tokenFullData.totalAssetSupply, tokenFullData.decimals)} {tokenFullData.symbol}
                </Text>
              </Column>
              <Column>
                <Text size="medium" type="secondary" fitContent>
                  Total borrow
                </Text>
                <Text size="medium" type="primary" fitContent>
                  {+formatVal(tokenFullData.totalAssetBorrow, tokenFullData.decimals)} {tokenFullData.symbol}
                </Text>
              </Column>
              <Column>
                <Text size="medium" type="secondary" fitContent>
                  Utilization ratio
                </Text>
                <Text size="medium" type="primary" fitContent>
                  {+getUtilizationRatio(tokenFullData.totalAssetBorrow, tokenFullData.totalAssetSupply)}%
                </Text>
              </Column>
              <Column>
                <Text size="medium" type="secondary" fitContent>
                  Reserves
                </Text>
                <Text size="medium" type="primary" fitContent>
                  {(
                    +formatVal(tokenFullData.totalAssetSupply, tokenFullData.decimals) -
                    +formatVal(tokenFullData.totalAssetBorrow, tokenFullData.decimals)
                  ).toFixed(2)}{' '}
                  {tokenFullData.symbol}
                </Text>
              </Column>
              <Column>
                <Text size="medium" type="secondary" fitContent>
                  Supply APY
                </Text>
                <Text size="medium" type="primary" fitContent>
                  {+tokenFullData.setupSupplyAPY ? (+tokenFullData.setupSupplyAPY).toFixed(2) : 0} %
                </Text>
              </Column>
              <Column>
                <Text size="medium" type="secondary" fitContent>
                  Borrow APY
                </Text>
                <Text size="medium" type="primary" fitContent>
                  {+tokenFullData.setupBorrowAPR ? (+tokenFullData.setupBorrowAPR).toFixed(2) : 0} %
                </Text>
              </Column>
            </TokenStats>
            <SizedBox height={28} />
          </Column>
        )}
        <TokenData
          key={tokenFullData?.assetId}
          rate={tokenFullData?.currentPrice}
          setupLtv={tokenFullData?.setupLtv || BN.ZERO}
          setupLts={tokenFullData?.setupLts || BN.ZERO}
          setupPenalty={tokenFullData?.setupPenalty || BN.ZERO}
          totalSupply={getSupplyUsers || 0}
          totalBorrow={getBorrowUsers || 0}
        />
        {!poolDataTokensWithStats ||
          (!tokenFullData?.assetId && (
            <PreloaderWrap>
              <Preloader />
            </PreloaderWrap>
          ))}
        <SizedBox height={24} />
        <Row style={{ flexWrap: 'wrap' }}>
          <Anchor href={`https://puzzleswap.org/trade?asset1=${assetId}`} className="details-link-btn">
            <Button size="medium" kind="secondary">
              <Exchange />
              Trade on Puzzle Swap
            </Button>
          </Anchor>
          <SizedBox width={8} />
          <Anchor href={`https://puzzleswap.org/explore/token/${assetId}`} className="details-link-btn">
            <Button size="medium" kind="secondary">
              <Info />
              More info
            </Button>
          </Anchor>
        </Row>
      </Container>
    </Root>
  );
};

export default observer(DashboardToken);
