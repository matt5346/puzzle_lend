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
  owner?: string;
  totalBorrow?: number;
  totalSupply?: number;
}

const Root = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  .owner {
    text-overflow: ellipsis;
    overflow-x: hidden;
    max-width: 100px;
    min-width: unset !important;
  }

  @media (min-width: 880px) {
    .owner {
      max-width: 320px;
      overflow-x: unset;
    }
  }
`;

const DesktopTokenTableRow: React.FC<IProps> = ({ owner, totalSupply, totalBorrow }) => {
  const navigate = useNavigate();

  return (
    <Root
      className="gridRow"
      onClick={(e) => {
        e.preventDefault();
        if (owner === 'total') return;

        // eslint-disable-next-line consistent-return
        return navigate(`/user/${owner}`);
      }}>
      {owner != null ? (
        <Column className="owner" style={{ minWidth: '350px' }} crossAxisSize="max" mainAxisSize="stretch">
          <Text textAlign="left">{owner}</Text>
        </Column>
      ) : (
        <Column crossAxisSize="max" mainAxisSize="stretch">
          <Text textAlign="right" />
        </Column>
      )}

      {totalBorrow != null ? (
        <Column crossAxisSize="max" mainAxisSize="stretch">
          <Text textAlign="right">$ {totalBorrow.toFixed(2)}</Text>
        </Column>
      ) : (
        <Column crossAxisSize="max" mainAxisSize="stretch">
          <Text textAlign="right" />
        </Column>
      )}

      {totalSupply != null ? (
        <Column crossAxisSize="max" mainAxisSize="stretch">
          <Text textAlign="right">$ {totalSupply.toFixed(2)}</Text>
        </Column>
      ) : (
        <Column crossAxisSize="max" mainAxisSize="stretch">
          <Text textAlign="right" />
        </Column>
      )}

      {owner !== 'total' ? (
        <Row justifyContent="flex-end">
          <Button
            minWidth="108px"
            size="medium"
            kind="secondary"
            onClick={(e) => {
              e.preventDefault();
              return navigate(`/user/${owner}`);
            }}>
            Check user
          </Button>
        </Row>
      ) : (
        <Column crossAxisSize="max" mainAxisSize="stretch">
          <Text textAlign="right" />
        </Column>
      )}
    </Root>
  );
};

export default observer(DesktopTokenTableRow);
