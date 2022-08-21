/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import { Button } from '@src/UIKit/Button';
import { IToken } from '@src/common/constants';
import tokenLogos from '@src/common/constants/tokenLogos';
import RoundTokenIcon from '@src/common/styles/RoundTokenIcon';
import { Row } from '@src/common/styles/Flex';
import BN from '@src/common/utils/BN';

interface IProps {
  token: IToken;
  rate?: BN;
  vol24?: BN;
  handleWatchListChange: (assetId: string) => void;
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

const DesktopTokenTableRow: React.FC<IProps> = ({ token, handleWatchListChange, rate, vol24 }) => {
  const navigate = useNavigate();
  return (
    <Root className="gridRow">
      <Row>
        <SizedBox width={18} />
        <Row onClick={() => navigate(`/explore/token/${token.assetId}`)} style={{ cursor: 'pointer' }}>
          <RoundTokenIcon src={tokenLogos[token.symbol]} />
          <SizedBox width={18} />
          <Text nowrap weight={500} fitContent>
            {token.name}
          </Text>
          <SizedBox width={18} />
          <Text nowrap type="purple300" fitContent>
            {token.symbol}
          </Text>
        </Row>
      </Row>
      <Text>$ {rate?.gte(0.0001) ? rate?.toFormat(4) : rate?.toFormat(8)}</Text>
      {vol24 != null ? <Text>$ {vol24.toFormat(2)}</Text> : <Text>-</Text>}
      <Row justifyContent="center">
        <Button onClick={() => navigate(`/trade?asset1=${token.assetId}`)} size="medium" kind="secondary">
          Supply
        </Button>
        <SizedBox width={18} />
        <Button onClick={() => navigate(`/trade?asset1=${token.assetId}`)} size="medium" kind="secondary">
          Borrow
        </Button>
      </Row>
    </Root>
  );
};
export default DesktopTokenTableRow;
