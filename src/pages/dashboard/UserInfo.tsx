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

const HealthWrap = styled.div`
  position: absolute;
  top: -45px;
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
  const { tokenStore, lendStore } = vm.rootStore;
  const currentPoolData = tokenStore.poolStatsByContractId[lendStore.activePoolContract];
  console.log(currentPoolData, 'currentPoolData');

  return (
    <Card
      style={{
        padding: '16px',
        overflow: 'visible',
        maxWidth: '315px',
        position: 'relative',
      }}
      justifyContent="center">
      <Text margin="0 0 16px 0" type="secondary" weight={500} size="medium-2">
        Account
      </Text>
      <HealthWrap>
        <PercentageCircleBar
          size={250}
          strokeWidth={10}
          percentage={currentPoolData && currentPoolData.userHealth ? currentPoolData.userHealth : 100}
          color="purple"
        />
      </HealthWrap>
      <Divider />
      <Row justifyContent="space-between">
        <Text fitContent margin="0 0 10px 0" type="secondary" size="medium-2">
          Supply balance
        </Text>
        {currentPoolData && currentPoolData.supplyUserTotal != null ? (
          <Text fitContent>$ {currentPoolData.supplyUserTotal.toFixed(4)}</Text>
        ) : (
          <Text>-</Text>
        )}
      </Row>
      <Row justifyContent="space-between">
        <Text fitContent margin="0 0 10px 0" type="secondary" size="medium-2">
          Borrow balance
        </Text>
        {currentPoolData && currentPoolData.borrowUserTotal != null ? (
          <Text fitContent>$ {currentPoolData.borrowUserTotal.toFixed(4)}</Text>
        ) : (
          <Text>-</Text>
        )}
      </Row>
      <LineDivider />
      <Row justifyContent="space-between">
        <Text fitContent margin="10px 0" type="secondary" size="medium-2">
          NET APY
        </Text>
        {currentPoolData && currentPoolData.netAPY ? (
          <Text fitContent margin="10px 0">
            {currentPoolData.netAPY.toFixed(2)}%
          </Text>
        ) : (
          <Text fitContent margin="10px 0">
            0%
          </Text>
        )}
      </Row>
    </Card>
  );
};

export default observer(UserInfo);
