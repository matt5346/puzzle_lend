/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import { TOKENS_LIST, ROUTES, TTokenStatistics, createITokenStat, IToken, createIToken } from '@src/common/constants';
import { Text } from '@src/UIKit/Text';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import styled from '@emotion/styled';
import TokenData from '@src/pages/dashboardToken/TokenData';
import { Button } from '@src/UIKit/Button';
import { Anchor } from '@src/UIKit/Anchor';
import BN from '@src/common/utils/BN';

import tokenLogos from '@src/common/constants/tokenLogos';
import RoundTokenIcon from '@src/common/styles/SquareTokenIcon';
import { ReactComponent as ChevronDown } from '@src/common/assets/icons/chevron_down.svg';
import { ReactComponent as Exchange } from '@src/common/assets/icons/exchange.svg';
import { ReactComponent as Info } from '@src/common/assets/icons/info.svg';

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
    text-decoration: unset;

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
  const { assetId } = useParams<{ assetId: string }>();
  const { tokenStore, lendStore } = useStores();
  const { poolDataTokensWithStats } = tokenStore;

  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6).toFormat(5);
  };

  useMemo(() => {
    console.log(poolDataTokensWithStats, assetId, 'data----111-');
    const iData: IToken =
      TOKENS_LIST(lendStore.activePoolName).find((item) => item.assetId === assetId) || createIToken();
    let data: TTokenStatistics = createITokenStat();

    if (assetId) data = tokenStore.poolDataTokensWithStats[assetId];

    console.log(data, iData, 'data-----');

    setFilteredTokens(data);
    setIToken(iData);
  }, [assetId, lendStore.activePoolName, tokenStore.poolDataTokensWithStats, poolDataTokensWithStats]);

  return (
    <Root>
      <Link className="details-link" to={ROUTES.HOME}>
        <ChevronDown />
        <Text weight={500} type="blue500" fitContent>
          Back to Main Pool
        </Text>
      </Link>
      <h1>DashboardToken</h1>
      {tokenIData && tokenFullData && (
        <Column>
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
          <Row alignItems="center">
            <Column>
              <Text size="medium" type="secondary" fitContent>
                Total supply
              </Text>
              <Text size="medium" type="primary" fitContent>
                {formatVal(tokenFullData.totalAssetSupply, tokenFullData.decimals)}
              </Text>
            </Column>
            <SizedBox width={32} />
            <Column>
              <Text size="medium" type="secondary" fitContent>
                Total borrowing
              </Text>
              <Text size="medium" type="primary" fitContent>
                {formatVal(tokenFullData.totalAssetBorrow, tokenFullData.decimals)}
              </Text>
            </Column>
            <SizedBox width={32} />
            <Column>
              <Text size="medium" type="secondary" fitContent>
                Reserves
              </Text>
              <Text size="medium" type="primary" fitContent>
                {(
                  +formatVal(tokenFullData.totalAssetSupply, tokenFullData.decimals) -
                  +formatVal(tokenFullData.totalAssetBorrow, tokenFullData.decimals)
                ).toFixed(5)}
              </Text>
            </Column>
            <SizedBox width={32} />
            <Column>
              <Text size="medium" type="secondary" fitContent>
                Supply APY
              </Text>
              <Text size="medium" type="primary" fitContent>
                {tokenFullData.setupSupplyAPY} %
              </Text>
            </Column>
            <SizedBox width={32} />
            <Column>
              <Text size="medium" type="secondary" fitContent>
                Borrow APR
              </Text>
              <Text size="medium" type="primary" fitContent>
                {tokenFullData.setupBorrowAPR} %
              </Text>
            </Column>
          </Row>
          <SizedBox height={28} />
        </Column>
      )}
      {tokenFullData && tokenFullData.assetId && (
        <TokenData
          token={tokenIData!}
          key={tokenFullData.assetId}
          rate={tokenFullData.currentPrice}
          setupBorrowAPR={tokenFullData.setupBorrowAPR}
          setupSupplyAPY={tokenFullData.setupSupplyAPY}
          setupLtv={tokenFullData.setupLtv}
          totalSupply={tokenFullData.totalAssetSupply}
          totalBorrow={tokenFullData.totalAssetBorrow}
        />
      )}
      <SizedBox height={24} />
      <Row>
        <Anchor href="https://puzzleswap.org/" className="details-link-btn">
          <Button size="medium" kind="secondary">
            <Exchange />
            Trade on Puzzle Swap
          </Button>
        </Anchor>
        <SizedBox width={8} />
        <Anchor href="https://puzzleswap.org/" className="details-link-btn">
          <Button size="medium" kind="secondary">
            <Info />
            More info
          </Button>
        </Anchor>
      </Row>
    </Root>
  );
};

export default observer(DashboardToken);
