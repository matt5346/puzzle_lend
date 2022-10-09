/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import BN from '@src/common/utils/BN';
import React, { HTMLAttributes } from 'react';
import { Column, Row } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import DefaultIcon from '@src/common/styles/DefaultIcon';
import Skeleton from 'react-loading-skeleton';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  logo?: string;
  symbol?: string;
  rate: BN;
  topLeftInfo?: string;
  topRightInfo: string;
  bottomLeftInfo?: string;
  withClickLogic?: boolean;
  rateChange?: BN | null;
}

const Root = styled.div<{ withClickLogic?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  cursor: ${({ withClickLogic }) => (withClickLogic ? 'pointer' : 'default')};
  padding: 8px 24px;

  :hover {
    background: ${({ withClickLogic }) => withClickLogic && '#f1f2fe;'};
  }

  .green {
    color: #35a15a;
  }

  .red {
    color: #ed827e;
  }
`;

const InvestRow: React.FC<IProps> = ({
  logo,
  symbol,
  rate,
  topLeftInfo,
  topRightInfo,
  bottomLeftInfo,
  withClickLogic,
  rateChange,
  ...rest
}) => {
  return (
    <Root withClickLogic={withClickLogic} {...rest}>
      <Row>
        {logo ? <SquareTokenIcon size="small" src={logo} /> : <DefaultIcon />}
        <SizedBox width={8} />
        <Column>
          <Text weight={500} size="medium" type="primary">
            {topLeftInfo}
          </Text>
          <Text weight={500} size="medium" type="primary">
            {+rate.toFixed(2) || 0} $
          </Text>
        </Column>
      </Row>
      <Column alignItems="flex-end">
        <Text size="medium" style={{ whiteSpace: 'nowrap' }} type="primary" textAlign="right">
          {topRightInfo} {symbol}
        </Text>
        <Text style={{ whiteSpace: 'nowrap' }} textAlign="right" type="primary" size="small">
          {+BN.formatUnits(+topRightInfo, 0)
            .times(rate)
            .toDecimalPlaces(2) || 0}{' '}
          $
        </Text>
      </Column>
    </Root>
  );
};

export default InvestRow;

export const InvestRowSkeleton = () => (
  <Root>
    <Row>
      <DefaultIcon />
      <SizedBox width={8} />
      <Column>
        <Skeleton height={14} width={260} />
        <Skeleton height={14} width={260} />
      </Column>
    </Row>
  </Root>
);
