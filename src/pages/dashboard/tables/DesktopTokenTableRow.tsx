/* eslint-disable no-nested-ternary */
/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import { Button } from '@src/UIKit/Button';
import { IToken } from '@src/common/constants';
import tokenLogos from '@src/common/constants/tokenLogos';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import { Column, Row } from '@src/common/styles/Flex';
import BN from '@src/common/utils/BN';

interface IProps {
  token: IToken;
  rate?: BN;
  selfSupply?: BN;
  selfBorrow?: BN;
  dailyIncome?: string;
  selfDailyBorrowInterest?: string;
  setupBorrowAPR?: string;
  setupSupplyAPY?: string;
  totalSupply?: BN;
  totalBorrow?: BN;
  handleSupplyAssetClick: (assetId: string, step: number) => void;
}

const Root = styled.div`
  display: flex;
  align-items: center;
`;

const DesktopTokenTableRow: React.FC<IProps> = ({
  rate,
  token,
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
    return BN.formatUnits(val, decimal).toSignificant(6).toFormat(5);
  };

  return (
    <Root className="gridRow">
      <Row
        alignItems="center"
        onClick={() => navigate(`/dashboard/token/${token.assetId}`)}
        style={{ cursor: 'pointer' }}>
        <SquareTokenIcon size="small" src={tokenLogos[token.symbol]} />
        <SizedBox width={18} />
        <Text nowrap weight={500} fitContent>
          {token.name}
          <Text>$ {rate?.gte(0.0001) ? rate?.toFormat(4) : rate?.toFormat(8)}</Text>
        </Text>
        <SizedBox width={18} />
      </Row>

      {selfSupply != null && rate ? (
        <Column crossAxisSize="max">
          <Text textAlign="right" size="medium">
            {(+formatVal(selfSupply, token.decimals)).toFixed(4)} {token.symbol}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            $ {(+formatVal(selfSupply, token.decimals) * +rate).toFixed(4)}
          </Text>
        </Column>
      ) : null}

      {/* {setupLtv != null ? (
        <Column crossAxisSize="max">
          <Text textAlign="right">{setupLtv}%</Text>
        </Column>
      ) : null} */}

      {totalSupply != null && rate ? (
        <Column crossAxisSize="max">
          <Text textAlign="right" size="medium">
            {(+formatVal(totalSupply, token.decimals)).toFixed(2)} {token.symbol}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            $ {(+formatVal(totalSupply, token.decimals) * +rate).toFixed(2)}
          </Text>
        </Column>
      ) : null}

      {setupSupplyAPY ? (
        <Column crossAxisSize="max">
          <Text textAlign="right">{Number(setupSupplyAPY).toFixed(2)}%</Text>
        </Column>
      ) : selfBorrow ? null : (
        <Text textAlign="right">0%</Text>
      )}

      {dailyIncome && rate != null ? (
        <Column crossAxisSize="max">
          <Text textAlign="right" size="medium">
            {(+dailyIncome / +rate).toFixed(6)} {token.symbol}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            $ {Number(dailyIncome).toFixed(8)}
          </Text>
        </Column>
      ) : selfSupply && +selfSupply > 0 ? (
        <Text textAlign="right">0</Text>
      ) : null}

      {totalBorrow != null && rate ? (
        <Column crossAxisSize="max">
          <Text textAlign="right" size="medium">
            {(+formatVal(totalBorrow, token.decimals)).toFixed(2)} {token.symbol}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            $ {(+formatVal(totalBorrow, token.decimals) * +rate).toFixed(2)}
          </Text>
        </Column>
      ) : null}

      {selfBorrow != null && rate ? (
        <Column crossAxisSize="max">
          <Text textAlign="right" size="medium">
            {(+formatVal(selfBorrow, token.decimals)).toFixed(4)} {token.symbol}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            $ {(+formatVal(selfBorrow, token.decimals) * +rate).toFixed(4)}
          </Text>
        </Column>
      ) : null}

      {setupBorrowAPR != null ? (
        <Column crossAxisSize="max">
          <Text textAlign="right">{(+setupBorrowAPR).toFixed(2)}%</Text>
        </Column>
      ) : null}

      {selfDailyBorrowInterest && rate != null ? (
        <Column crossAxisSize="max">
          <Text textAlign="right" size="medium">
            {(+selfDailyBorrowInterest / +rate).toFixed(6)} {token.symbol}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            $ {Number(selfDailyBorrowInterest).toFixed(8)}
          </Text>
        </Column>
      ) : null}

      {selfSupply ? (
        <Row justifyContent="flex-end">
          <Button
            minWidth="108px"
            onClick={() => handleSupplyAssetClick(token.assetId, 0)}
            size="medium"
            kind="secondary">
            Supply
          </Button>
          <SizedBox width={12} />
          <Button
            minWidth="108px"
            onClick={() => handleSupplyAssetClick(token.assetId, 1)}
            size="medium"
            kind="secondary">
            Withdraw
          </Button>
        </Row>
      ) : null}

      {selfBorrow ? (
        <Row justifyContent="flex-end">
          <Button
            minWidth="108px"
            onClick={() => handleSupplyAssetClick(token.assetId, 2)}
            size="medium"
            kind="secondary">
            Borrow
          </Button>
          <SizedBox width={12} />
          <Button
            minWidth="108px"
            onClick={() => handleSupplyAssetClick(token.assetId, 3)}
            size="medium"
            kind="secondary">
            Repay
          </Button>
        </Row>
      ) : null}

      {totalSupply ? (
        <Row justifyContent="flex-end">
          <Button
            minWidth="108px"
            onClick={() => handleSupplyAssetClick(token.assetId, 0)}
            size="medium"
            kind="secondary">
            Supply
          </Button>
          <SizedBox width={12} />
          <Button
            minWidth="108px"
            onClick={() => handleSupplyAssetClick(token.assetId, 2)}
            size="medium"
            kind="secondary">
            Borrow
          </Button>
        </Row>
      ) : null}
    </Root>
  );
};

export default observer(DesktopTokenTableRow);
