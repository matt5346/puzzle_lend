/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import BN from '@src/common/utils/BN';
import React, { HTMLAttributes } from 'react';
import { Column, Row } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import tokenLogos from '@src/common/constants/tokenLogos';
import { IToken } from '@src/common/constants';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import DefaultIcon from '@src/common/styles/DefaultIcon';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  token: IToken;
  rate?: BN;
  setupLtv?: BN;
  selfBorrow?: BN;
  setupBorrowAPR?: BN;
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
const SupplyTokensRow: React.FC<IProps> = ({ token, rate, selfBorrow, setupBorrowAPR, ...rest }) => {
  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6).toString();
  };

  return (
    <Root {...rest}>
      <Row>
        {token?.symbol ? <SquareTokenIcon size="small" src={tokenLogos[token.symbol]} /> : <DefaultIcon />}
        <SizedBox width={8} />
        <Column crossAxisSize="max">
          <Row>
            <Text weight={500} size="medium" type="primary" className="text" textAlign="left">
              To be repaid
            </Text>
            {selfBorrow != null ? (
              <Text type="primary" size="medium" textAlign="right">
                {(+formatVal(selfBorrow, token.decimals)).toFixed(4)} {token.symbol}
              </Text>
            ) : (
              <Text>-</Text>
            )}
          </Row>
          <Row>
            <Text weight={500} size="medium" type="primary" className="text" textAlign="left">
              Borrow APY
            </Text>
            {setupBorrowAPR != null ? (
              <Text size="small" type="primary" textAlign="right">
                {(+setupBorrowAPR).toFixed(2)}%
              </Text>
            ) : (
              <Text>-</Text>
            )}
          </Row>
        </Column>
      </Row>
    </Root>
  );
};

export default SupplyTokensRow;
