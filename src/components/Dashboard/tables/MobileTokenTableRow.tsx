/* eslint-disable no-nested-ternary */
/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import React from 'react';
import star from '@src/assets/icons/star.svg';
import { useNavigate } from 'react-router-dom';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import { Button } from '@src/UIKit/Button';
import { IToken } from '@src/common/constants';
import tokenLogos from '@src/common/constants/tokenLogos';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import { Column, Row } from '@src/common/styles/Flex';
import Card from '@src/common/styles/Card';
import BN from '@src/common/utils/BN';

interface IProps {
  token: IToken;
  rate?: BN;
  selfSupply?: BN;
  selfBorrow?: BN;
  dailyIncome?: BN;
  selfDailyBorrowInterest?: BN;
  setupBorrowAPR?: BN;
  setupSupplyAPY?: BN;
  totalSupply?: BN;
  totalBorrow?: BN;
  isUserStats: boolean;
  handleSupplyAssetClick: (assetId: string, step: number) => void;
}

const StatsRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f2fe;
  padding-bottom: 8px;
  margin-bottom: 16px;

  &:first-child {
    margin-top: 16px;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
`;

const MobileTokenTableRow: React.FC<IProps> = ({
  rate,
  token,
  isUserStats,
  handleSupplyAssetClick,
  selfBorrow,
  selfSupply,
  dailyIncome,
  totalSupply,
  totalBorrow,
  selfDailyBorrowInterest,
  setupBorrowAPR,
  setupSupplyAPY,
}) => {
  const navigate = useNavigate();
  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6);
  };

  return (
    <Card className="token-card" justifyContent="space-between">
      <Row alignItems="center">
        <Row onClick={() => navigate(`/explore/token/${token.assetId}`)} style={{ cursor: 'pointer' }}>
          <SquareTokenIcon src={tokenLogos[token.symbol]} size="small" />
          <SizedBox width={18} />
          <Column>
            <Text>{token.name}</Text>
            <Text type="purple300" size="small">
              {token.symbol}
            </Text>
          </Column>
        </Row>
      </Row>
      <Column crossAxisSize="max">
        {selfSupply != null && rate ? (
          <StatsRow>
            <Text type="secondary" size="medium">
              Supplied
            </Text>
            <Column crossAxisSize="max">
              <Text weight={500} textAlign="right" size="medium">
                {formatVal(selfSupply, token.decimals).toFormat(2)} {token.symbol}
              </Text>
              <Text textAlign="right" size="small" type="secondary">
                $ {formatVal(selfSupply, token.decimals).times(rate).toFormat(2)}
              </Text>
            </Column>
          </StatsRow>
        ) : null}

        {selfBorrow != null && rate ? (
          <StatsRow>
            <Text type="secondary" size="medium">
              Borrowed
            </Text>
            <Column crossAxisSize="max">
              <Text weight={500} textAlign="right" size="medium">
                {formatVal(selfBorrow, token.decimals).toFormat(4)} {token.symbol}
              </Text>
              <Text textAlign="right" size="small" type="secondary">
                $ {formatVal(selfBorrow, token.decimals).times(rate).toFormat(2)}
              </Text>
            </Column>
          </StatsRow>
        ) : null}

        {totalSupply != null && rate ? (
          <StatsRow>
            <Text type="secondary" size="medium">
              Total supply
            </Text>
            <Column crossAxisSize="max">
              <Text weight={500} textAlign="right" size="medium">
                {formatVal(totalSupply, token.decimals).toFormat(2)} {token.symbol}
              </Text>
              <Text textAlign="right" size="small" type="secondary">
                $ {formatVal(totalSupply, token.decimals).times(rate).toFormat(2)}
              </Text>
            </Column>
          </StatsRow>
        ) : null}

        {totalBorrow != null && rate ? (
          <StatsRow>
            <Text type="secondary" size="medium">
              Total borrow
            </Text>
            <Column>
              <Text weight={500} textAlign="right" size="medium" nowrap>
                {formatVal(totalBorrow, token.decimals).toFormat(2)} {token.symbol}
              </Text>
              <Text textAlign="right" size="small" type="secondary">
                $ {formatVal(totalBorrow, token.decimals).times(rate).toFormat(2)}
              </Text>
            </Column>
          </StatsRow>
        ) : null}

        {dailyIncome && rate != null && (
          <StatsRow>
            <Text type="secondary" size="medium">
              Daily interest
            </Text>
            <Column crossAxisSize="max">
              <Text weight={500} textAlign="right" size="medium">
                {dailyIncome.div(rate).toFormat(6)} {token.symbol}
              </Text>
              <Text textAlign="right" size="small" type="secondary">
                $ {dailyIncome.toFormat(8)}
              </Text>
            </Column>
          </StatsRow>
        )}

        {selfDailyBorrowInterest && rate != null && (
          <StatsRow>
            <Text type="secondary" size="medium">
              Daily loan interest
            </Text>
            <Column crossAxisSize="max">
              <Text weight={500} textAlign="right" size="medium">
                {selfDailyBorrowInterest.div(rate).toFormat(6)} {token.symbol}
              </Text>
              <Text textAlign="right" size="small" type="secondary">
                $ {selfDailyBorrowInterest.toFormat(8)}
              </Text>
            </Column>
          </StatsRow>
        )}

        {setupSupplyAPY && (
          <StatsRow>
            <Text type="secondary" size="medium">
              Supply APY
            </Text>
            <Text size="medium" textAlign="right">
              {setupSupplyAPY.toFormat(2)}%
            </Text>
          </StatsRow>
        )}

        {setupBorrowAPR != null ? (
          <StatsRow>
            <Text type="secondary" size="medium">
              Borrow APY
            </Text>
            <Text size="medium" textAlign="right">
              {setupBorrowAPR.toFormat(2)}%
            </Text>
          </StatsRow>
        ) : null}
      </Column>

      {selfSupply && !isUserStats ? (
        <Row justifyContent="space-between">
          <Button
            minWidth="108px"
            maxWidth="156px"
            fixed
            onClick={(e) => {
              e.stopPropagation();
              handleSupplyAssetClick(token.assetId, 0);
            }}
            size="medium"
            kind="secondary">
            Supply
          </Button>
          <SizedBox width={12} />
          <Button
            minWidth="108px"
            maxWidth="156px"
            fixed
            onClick={(e) => {
              e.stopPropagation();
              handleSupplyAssetClick(token.assetId, 1);
            }}
            size="medium"
            kind="secondary">
            Withdraw
          </Button>
        </Row>
      ) : null}

      {selfBorrow && !isUserStats ? (
        <Row justifyContent="space-between">
          <Button
            minWidth="108px"
            maxWidth="156px"
            fixed
            onClick={(e) => {
              e.stopPropagation();
              handleSupplyAssetClick(token.assetId, 2);
            }}
            size="medium"
            kind="secondary">
            Borrow
          </Button>
          <SizedBox width={12} />
          <Button
            minWidth="108px"
            maxWidth="156px"
            fixed
            onClick={(e) => {
              e.stopPropagation();
              handleSupplyAssetClick(token.assetId, 3);
            }}
            size="medium"
            kind="secondary">
            Repay
          </Button>
        </Row>
      ) : null}

      {totalSupply ? (
        <Row justifyContent="space-between">
          <Button
            minWidth="108px"
            maxWidth="156px"
            fixed
            onClick={(e) => {
              e.stopPropagation();
              handleSupplyAssetClick(token.assetId, 0);
            }}
            size="medium"
            kind="secondary">
            Supply
          </Button>
          <SizedBox width={12} />
          <Button
            minWidth="108px"
            maxWidth="156px"
            fixed
            onClick={(e) => {
              e.stopPropagation();
              handleSupplyAssetClick(token.assetId, 2);
            }}
            size="medium"
            kind="secondary">
            Borrow
          </Button>
        </Row>
      ) : null}
    </Card>
  );
};
export default MobileTokenTableRow;
