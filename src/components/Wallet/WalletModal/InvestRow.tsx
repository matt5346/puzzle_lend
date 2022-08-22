/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import BN from '@src/common/utils/BN';
import React, { HTMLAttributes } from 'react';
import { Column, Row } from '@src/common/styles/Flex';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import Skeleton from 'react-loading-skeleton';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  logo?: string;
  topLeftInfo?: string;
  topRightInfo?: string;
  bottomLeftInfo?: string;
  bottomRightInfo?: string;
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
const DefaultIcon = styled.div`
  width: 40px;
  height: 40px;
  color: #000;
  border: 1px solid #f1f2fe;
  border-radius: 8px;
`;
const InvestRow: React.FC<IProps> = ({
  logo,
  topLeftInfo,
  topRightInfo,
  bottomLeftInfo,
  bottomRightInfo,
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
          <Text size="medium" type="primary">
            {bottomLeftInfo}&nbsp;
            {rateChange != null &&
              !rateChange.eq(0) &&
              (rateChange.lt(0) ? (
                <span className="red">{rateChange.toFormat(2)}%</span>
              ) : (
                <span className="green">+{rateChange.toFormat(2)}%</span>
              ))}
          </Text>
        </Column>
      </Row>
      <Column alignItems="flex-end">
        <Text weight={500} size="medium" style={{ whiteSpace: 'nowrap' }} type="primary" textAlign="right">
          {topRightInfo}
        </Text>
        <Text style={{ whiteSpace: 'nowrap' }} textAlign="right" type="primary" size="small">
          {bottomRightInfo}
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
