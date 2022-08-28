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
const Fav = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const DesktopTokenTableRow: React.FC<IProps> = ({
  rate,
  token,
  handleSupplyAssetClick,
  totalSupply,
  totalBorrow,
  setupLtv,
  setupBorrowAPR,
  setupSupplyAPY,
}) => {
  const navigate = useNavigate();
  return (
    <Root className="gridRow">
      <Row>
        <SizedBox width={18} />
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
      {setupLtv != null ? <Text>{setupLtv}%</Text> : <Text>-</Text>}
      {totalSupply != null ? <Text>$ {totalSupply.toFormat(7)}</Text> : <Text>-</Text>}
      {setupSupplyAPY != null ? <Text>{setupSupplyAPY}%</Text> : <Text>-</Text>}
      {totalBorrow != null ? <Text>$ {totalBorrow.toFormat(7)}</Text> : <Text>-</Text>}
      {setupBorrowAPR != null ? <Text>{setupBorrowAPR}%</Text> : <Text>-</Text>}
      <Row justifyContent="center">
        <Button onClick={() => handleSupplyAssetClick(token.assetId, 0)} size="medium" kind="secondary">
          Details
        </Button>
        {/* <SizedBox width={18} />
        <Button onClick={() => handleSupplyAssetClick(token.assetId, 1)} size="medium" kind="secondary">
          Borrow
        </Button> */}
      </Row>
    </Root>
  );
};

export default observer(DesktopTokenTableRow);
