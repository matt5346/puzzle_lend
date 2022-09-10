/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from '@src/common/constants';
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
  const [getSupplyUsers, setTotalSupplyUsers] = useState<number>(0);
  const [getBorrowUsers, setTotalBorrowUsers] = useState<number>(0);
  const { assetId } = useParams<{ assetId: string }>();
  const { tokenStore, lendStore, usersStore } = useStores();
  const { poolDataTokensWithStats } = tokenStore;

  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6).toFormat(5);
  };

  useEffect(() => {
    console.log(poolDataTokensWithStats, assetId, usersStore, 'data----111-');
    async function fetchMyAPI() {
      const response = await Promise.all(
        Object.values(LENDS_CONTRACTS).map(async (item) => {
          return { [item]: await tokenStore.loadTokenUsers(item) };
        })
      );
      console.log(usersStore, response, '---usersStore');
      const poolTokens = response.filter((item) => (item[lendStore.activePoolContract] ? item : false))[0];
      const currentToken = poolTokens[lendStore.activePoolContract].filter((item: any) =>
        item[assetId!] ? item : false
      )[0];
      console.log(currentToken, 'currentToken');

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
      console.log(totalBorrowUsers, totalSupplyUsers, '---currentToken2');

      const iData: IToken =
        TOKENS_LIST(lendStore.activePoolName).find((item) => item.assetId === assetId) || createIToken();
      let data: TTokenStatistics = createITokenStat();

      if (assetId) {
        data = tokenStore.poolDataTokensWithStats[assetId];
        const token = TOKENS_LIST(lendStore.activePoolName).find((item) => item.assetId === assetId)!;
        console.log(token, 'iData-----');
      }

      console.log(data, iData, TOKENS_LIST(lendStore.activePoolName), 'data-----');

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
    tokenStore.poolDataTokensWithStats,
    lendStore.activePoolContract,
    poolDataTokensWithStats,
  ]);

  return (
    <Root>
      <Link className="details-link" to={ROUTES.HOME}>
        <ChevronDown />
        <Text weight={500} type="blue500" fitContent>
          Back to Main Pool
        </Text>
      </Link>
      <SizedBox height={24} />
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
                {tokenFullData.setupSupplyAPY ? (+tokenFullData.setupSupplyAPY).toFixed(2) : 0} %
              </Text>
            </Column>
            <SizedBox width={32} />
            <Column>
              <Text size="medium" type="secondary" fitContent>
                Borrow APY
              </Text>
              <Text size="medium" type="primary" fitContent>
                {tokenFullData.setupBorrowAPR ? (+tokenFullData.setupBorrowAPR).toFixed(2) : 0} %
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
          totalSupply={getSupplyUsers}
          totalBorrow={getBorrowUsers}
        />
      )}
      <SizedBox height={24} />
      <Row>
        <Anchor href={`https://puzzleswap.org/trade?asset0=${assetId}`} className="details-link-btn">
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
    </Root>
  );
};

export default observer(DashboardToken);
