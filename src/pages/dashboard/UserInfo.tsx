/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Row, Column } from '@src/common/styles/Flex';
import { Text } from '@src/UIKit/Text';
import { PercentageCircleBar } from '@src/UIKit/PercentageCircleBar';
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
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #fff;
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
        {/* <Text type="primary">{+tokenStore.userHealth.toFixed(2) * 100}%</Text>
        <Text type="secondary" size="small">
          Account
        </Text>
        <Text type="secondary" size="small">
          Health
        </Text> */}
        <PercentageCircleBar
          size={250}
          strokeWidth={10}
          percentage={+tokenStore.userHealth.toFixed(2) * 100}
          color="purple"
        />
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
    </Card>
  );
};

export default observer(UserInfo);
