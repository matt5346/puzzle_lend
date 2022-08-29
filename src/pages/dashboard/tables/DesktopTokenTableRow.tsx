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
import { Row } from '@src/common/styles/Flex';
import BN from '@src/common/utils/BN';

interface IProps {
  token: IToken;
  rate?: BN;
  selfSupply?: BN;
  selfBorrow?: BN;
  dailyIncome?: string;
  setupLtv?: string;
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
  setupLtv,
  setupBorrowAPR,
  setupSupplyAPY,
}) => {
  const navigate = useNavigate();
  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6).toString();
  };

  return (
    <Root className="gridRow">
      <Row>
        <Row onClick={() => navigate(`/explore/token/${token.assetId}`)} style={{ cursor: 'pointer' }}>
          <SquareTokenIcon src={tokenLogos[token.symbol]} />
          <SizedBox width={18} />
          <Text nowrap weight={500} fitContent>
            {token.name}
            <Text>$ {rate?.gte(0.0001) ? rate?.toFormat(4) : rate?.toFormat(8)}</Text>
          </Text>
          <SizedBox width={18} />
        </Row>
      </Row>
      {selfSupply != null ? <Text>{formatVal(selfSupply, token.decimals)}</Text> : null}
      {setupLtv != null ? <Text>{setupLtv}%</Text> : null}
      {totalSupply != null ? <Text>$ {totalSupply.toFormat(7)}</Text> : null}
      {setupSupplyAPY != null ? <Text>{Number(setupSupplyAPY).toFixed(2)}%</Text> : null}
      {dailyIncome != null ? <Text>{dailyIncome}</Text> : null}
      {totalBorrow != null ? <Text>$ {totalBorrow.toFormat(7)}</Text> : null}
      {setupBorrowAPR != null ? <Text>{setupBorrowAPR}%</Text> : null}
      {selfBorrow != null ? <Text>{formatVal(selfBorrow, token.decimals)}</Text> : null}

      {selfSupply ? (
        <Row justifyContent="center">
          <Button onClick={() => handleSupplyAssetClick(token.assetId, 0)} size="medium" kind="secondary">
            Supply
          </Button>
          <SizedBox width={12} />
          <Button onClick={() => handleSupplyAssetClick(token.assetId, 1)} size="medium" kind="secondary">
            Withdraw
          </Button>
        </Row>
      ) : null}

      {selfBorrow ? (
        <Row justifyContent="center">
          <Button onClick={() => handleSupplyAssetClick(token.assetId, 2)} size="medium" kind="secondary">
            Borrow
          </Button>
          <SizedBox width={12} />
          <Button onClick={() => handleSupplyAssetClick(token.assetId, 3)} size="medium" kind="secondary">
            Repay
          </Button>
        </Row>
      ) : null}

      {totalSupply ? (
        <Row justifyContent="center">
          <Button onClick={() => handleSupplyAssetClick(token.assetId, 0)} size="medium" kind="secondary">
            Details
          </Button>
        </Row>
      ) : null}
    </Root>
  );
};

export default observer(DesktopTokenTableRow);
