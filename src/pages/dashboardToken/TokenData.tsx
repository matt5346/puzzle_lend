/* eslint-disable react/require-default-props */
import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useParams, Link } from 'react-router-dom';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import { TTokenStatistics, createITokenStat, IToken } from '@src/common/constants';
import { Text } from '@src/UIKit/Text';
import Card from '@src/common/styles/Card';
import BN from '@src/common/utils/BN';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';

interface IProps {
  token: IToken;
  rate?: BN;
  selfSupply?: BN;
  selfBorrow?: BN;
  dailyIncome?: string;
  setupLtv?: string;
  setupBorrowAPR?: string;
  setupSupplyAPY?: string;
  totalSupply: BN;
  totalBorrow: BN;
}

const Root = styled.div`
  width: 100%;
`;

const TokenData: React.FC<IProps> = ({
  rate,
  token,
  selfBorrow,
  selfSupply,
  dailyIncome,
  totalSupply,
  totalBorrow,
  setupLtv,
  setupBorrowAPR,
  setupSupplyAPY,
}) => {
  const [filteredTokens, setFilteredTokens] = useState<TTokenStatistics>();
  const { assetId } = useParams<{ assetId: string }>();
  console.log(assetId, 'assetId-----');
  const { tokenStore } = useStores();
  const { poolDataTokensWithStats } = tokenStore;

  useMemo(() => {
    console.log(Object.keys(poolDataTokensWithStats), assetId, 'data----111-');
    let data: TTokenStatistics = createITokenStat();

    if (assetId) data = tokenStore.poolDataTokensWithStats[assetId];
    console.log(data, 'data-----');

    setFilteredTokens(data);
  }, [assetId, tokenStore.poolDataTokensWithStats, poolDataTokensWithStats]);

  return (
    <Root>
      <Card>
        <Text weight={500} size="big" type="primary" fitContent>
          Market details
        </Text>
        <SizedBox height={24} />
        <Text weight={500} type="primary" fitContent>
          General info
        </Text>
        <SizedBox height={16} />
        <Row justifyContent="space-between">
          <Text size="medium" type="secondary" fitContent>
            Price
          </Text>
          <Text size="medium" type="secondary" fitContent>
            {rate?.gte(0.0001) ? rate?.toFormat(4) : rate?.toFormat(8)} $
          </Text>
        </Row>
        <SizedBox height={16} />
        <Row justifyContent="space-between">
          <Text size="medium" type="secondary" fitContent>
            Number of suppliers
          </Text>
          <Text size="medium" type="secondary" fitContent>
            ???
          </Text>
        </Row>
        <SizedBox height={16} />
        <Row justifyContent="space-between">
          <Text size="medium" type="secondary" fitContent>
            Number of borrowers
          </Text>
          <Text size="medium" type="secondary" fitContent>
            ???
          </Text>
        </Row>
        <SizedBox height={16} />
        <Row justifyContent="space-between">
          <Text size="medium" type="secondary" fitContent>
            LTV
          </Text>
          <Text size="medium" type="secondary" fitContent>
            {setupLtv}%
          </Text>
        </Row>
        <SizedBox height={16} />
        <Row justifyContent="space-between">
          <Text size="medium" type="secondary" fitContent>
            Liquidation threshold
          </Text>
          <Text size="medium" type="secondary" fitContent>
            ???
          </Text>
        </Row>
        <SizedBox height={16} />
        <Row justifyContent="space-between">
          <Text size="medium" type="secondary" fitContent>
            Liquidation penalty
          </Text>
          <Text size="medium" type="secondary" fitContent>
            ???
          </Text>
        </Row>
      </Card>
    </Root>
  );
};

export default observer(TokenData);
