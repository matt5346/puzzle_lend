/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Row, Column } from '@src/common/styles/Flex';
import { Text } from '@src/UIKit/Text';
import { Button } from '@src/UIKit/Button';
import { ReactComponent as RepayIcon } from '@src/common/assets/icons/repay.svg';
import { ReactComponent as WithdrawIcon } from '@src/common/assets/icons/withdraw.svg';
import { ReactComponent as SupplyIcon } from '@src/common/assets/icons/supply.svg';
import { ReactComponent as Divider } from '@src/common/assets/icons/divider.svg';
import { ReactComponent as LineDivider } from '@src/common/assets/icons/line_divider.svg';
import Card from '@src/common/styles/Card';
import { useDashboardVM } from '@src/pages/dashboard/DashboardVm';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const ButtonWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const HealthWrap = styled.div`
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translate(-50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid green;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const IconWrap = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #7075e9;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;

  svg {
    width: 32px;
    height: 32px;
  }
`;

const UserInfo: React.FC<IProps> = () => {
  const vm = useDashboardVM();
  console.log(vm, 'VM-----');
  const { tokenStore } = vm.rootStore;
  console.log(tokenStore, 'tokenStore-----');

  return (
    <Card
      style={{
        padding: '16px',
        overflow: 'visible',
        maxWidth: '315px',
        position: 'relative',
      }}
      justifyContent="center">
      <Text margin="0 0 10px 0" type="primary" weight={500} size="medium-2">
        Account
      </Text>
      <HealthWrap>
        <Text type="primary">100%</Text>
        <Text type="secondary" size="small">
          Account
        </Text>
        <Text type="secondary" size="small">
          Health
        </Text>
      </HealthWrap>
      <Divider />
      <Row justifyContent="space-between">
        <Text fitContent margin="0 0 10px 0" type="secondary" size="medium-2">
          Supply balance
        </Text>
        {tokenStore.supplyUserTotal != null ? (
          <Text fitContent>$ {tokenStore.supplyUserTotal.toFixed(7)}</Text>
        ) : (
          <Text>-</Text>
        )}
      </Row>
      <Row justifyContent="space-between">
        <Text fitContent margin="0 0 10px 0" type="secondary" size="medium-2">
          Borrow balance
        </Text>
        {tokenStore.borrowUserTotal != null ? (
          <Text fitContent>$ {tokenStore.borrowUserTotal.toFixed(7)}</Text>
        ) : (
          <Text>-</Text>
        )}
      </Row>
      <LineDivider />
      <Row justifyContent="space-between">
        <Text fitContent margin="10px 0" type="secondary" size="medium-2">
          NET APY
        </Text>
        {tokenStore.netAPY != null ? (
          <Text fitContent margin="10px 0">
            {tokenStore.netAPY.toFixed(2)}%
          </Text>
        ) : (
          <Text margin="10px 0">-</Text>
        )}
      </Row>
      <LineDivider />
      <Row margin="14px 0 0 0" justifyContent="space-between">
        <ButtonWrap onClick={() => null}>
          <IconWrap>
            <RepayIcon />
          </IconWrap>
          <Text margin="10px 0 0 0">Repay</Text>
        </ButtonWrap>
        <ButtonWrap onClick={() => null}>
          <IconWrap>
            <WithdrawIcon />
          </IconWrap>
          <Text margin="10px 0 0 0">Supply</Text>
        </ButtonWrap>
        <ButtonWrap onClick={() => null}>
          <IconWrap>
            <SupplyIcon />
          </IconWrap>
          <Text margin="10px 0 0 0">Withdraw</Text>
        </ButtonWrap>
      </Row>
    </Card>
  );
};

export default observer(UserInfo);
