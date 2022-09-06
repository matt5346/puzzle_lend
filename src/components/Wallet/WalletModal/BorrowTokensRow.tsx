/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import BN from '@src/common/utils/BN';
import React, { HTMLAttributes } from 'react';
import { Column, Row } from '@src/common/styles/Flex';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import Skeleton from 'react-loading-skeleton';
import tokenLogos from '@src/common/constants/tokenLogos';
import { IToken } from '@src/common/constants';
import RoundTokenIcon from '@src/common/styles/RoundTokenIcon';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  token: IToken;
  rate?: BN;
  vol24?: BN;
  setupLtv?: string;
  selfBorrow?: BN;
  setupBorrowAPR?: string;
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
const SupplyTokensRow: React.FC<IProps> = ({ vol24, token, rate, selfBorrow, setupBorrowAPR, ...rest }) => {
  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6).toString();
  };

  return (
    <Root {...rest}>
      <RoundTokenIcon src={tokenLogos[token.symbol]} />
      <Column>
        <Text type="primary" className="text" textAlign="center">
          Borrow APR
        </Text>
        {setupBorrowAPR != null ? <Text type="primary">{(+setupBorrowAPR).toFixed(2)}%</Text> : <Text>-</Text>}
      </Column>
      <Column>
        <Text type="primary" className="text" textAlign="center">
          To be repaid
        </Text>
        {selfBorrow != null ? (
          <Text type="primary">{(+formatVal(selfBorrow, token.decimals)).toFixed(4)}$</Text>
        ) : (
          <Text>-</Text>
        )}
      </Column>
    </Root>
  );
};

export default SupplyTokensRow;
