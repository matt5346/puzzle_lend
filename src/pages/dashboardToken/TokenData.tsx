/* eslint-disable react/require-default-props */
import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { Text } from '@src/UIKit/Text';
import Card from '@src/common/styles/Card';
import BN from '@src/common/utils/BN';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';

interface IProps {
  rate?: BN;
  setupLtv?: string;
  setupLts?: string;
  setupPenalty?: string;
  totalSupply?: number;
  totalBorrow?: number;
}

const Root = styled.div`
  width: 100%;
`;

const TokenData: React.FC<IProps> = ({ rate, totalSupply, totalBorrow, setupLtv, setupLts, setupPenalty }) => {
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
        <Row
          justifyContent="space-between"
          style={{ borderBottom: '1px solid #F1F2FE', paddingBottom: '8px', marginBottom: '8px' }}>
          <Text size="medium" type="secondary" fitContent>
            Price
          </Text>
          <Text size="medium" type="secondary" fitContent>
            {rate?.gte(0.0001) ? rate?.toFormat(4) : rate?.toFormat(8)} $
          </Text>
        </Row>
        <Row
          justifyContent="space-between"
          style={{ borderBottom: '1px solid #F1F2FE', paddingBottom: '8px', marginBottom: '8px' }}>
          <Text size="medium" type="secondary" fitContent>
            Number of suppliers
          </Text>
          <Text size="medium" type="secondary" fitContent>
            {totalSupply || 0}
          </Text>
        </Row>
        <Row
          justifyContent="space-between"
          style={{ borderBottom: '1px solid #F1F2FE', paddingBottom: '8px', marginBottom: '8px' }}>
          <Text size="medium" type="secondary" fitContent>
            Number of borrowers
          </Text>
          <Text size="medium" type="secondary" fitContent>
            {totalBorrow || 0}
          </Text>
        </Row>
        <Row
          justifyContent="space-between"
          style={{ borderBottom: '1px solid #F1F2FE', paddingBottom: '8px', marginBottom: '8px' }}>
          <Text size="medium" type="secondary" fitContent>
            LTV
          </Text>
          <Text size="medium" type="secondary" fitContent>
            {setupLtv || 0}%
          </Text>
        </Row>
        <Row
          justifyContent="space-between"
          style={{ borderBottom: '1px solid #F1F2FE', paddingBottom: '8px', marginBottom: '8px' }}>
          <Text size="medium" type="secondary" fitContent>
            Liquidation threshold
          </Text>
          <Text size="medium" type="secondary" fitContent>
            {setupLts || 0}%
          </Text>
        </Row>
        <Row justifyContent="space-between">
          <Text size="medium" type="secondary" fitContent>
            Liquidation penalty
          </Text>
          <Text size="medium" type="secondary" fitContent>
            {setupPenalty || 0}%
          </Text>
        </Row>
      </Card>
    </Root>
  );
};

export default observer(TokenData);
