/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Row, Column } from '@src/common/styles/Flex';
import { Text } from '@src/UIKit/Text';
import { PercentageCircleBar } from '@src/UIKit/PercentageCircleBar';
import { ReactComponent as Divider } from '@src/common/assets/icons/divider.svg';
import { ReactComponent as LineDivider } from '@src/common/assets/icons/line_divider.svg';
import Card from '@src/common/styles/Card';
import { Tooltip } from '@src/UIKit/Tooltip';
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

  return (
    <Card
      style={{
        padding: '16px',
        overflow: 'visible',
        position: 'relative',
      }}
      justifyContent="center">
      <Text margin="0 0 16px 0" type="secondary" weight={500} size="medium-2">
        Account
      </Text>
      <HealthWrap>
        <Tooltip
          width="100%"
          containerStyles={{ display: 'flex', alignItems: 'center', width: '100%' }}
          content={
            <Text>
              In essence, Account health is a proportion between your Borrow Limit (Borrow Capacity) and your Borrow
              Capacity Used.
            </Text>
          }>
          <PercentageCircleBar
            size={100}
            strokeWidth={3}
            percentage={currentPoolData && currentPoolData.userHealth ? currentPoolData.userHealth : 100}
            color="purple"
          />
        </Tooltip>
      </HealthWrap>
      <Divider />
      <Row justifyContent="space-between">
        <Tooltip
          width="100%"
          containerStyles={{ display: 'flex', alignItems: 'center', width: '100%' }}
          content={<Text>USD value of your deposits in total</Text>}>
          <Text decoration="underline dotted" fitContent margin="0 0 10px 0" type="secondary" size="medium-2">
            Supply balance
          </Text>
        </Tooltip>
        {currentPoolData && currentPoolData.supplyUserTotal != null ? (
          <Text fitContent nowrap>
            $ {currentPoolData.supplyUserTotal.toFixed(4)}
          </Text>
        ) : (
          <Text>-</Text>
        )}
      </Row>
      <Row justifyContent="space-between">
        <Tooltip
          width="100%"
          containerStyles={{ display: 'flex', alignItems: 'center', width: '100%' }}
          content={<Text>USD value of your borrows in total</Text>}>
          <Text decoration="underline dotted" fitContent margin="0 0 10px 0" type="secondary" size="medium-2">
            Borrow balance
          </Text>
        </Tooltip>
        {currentPoolData && currentPoolData.borrowUserTotal != null ? (
          <Text fitContent nowrap>
            $ {currentPoolData.borrowUserTotal.toFixed(4)}
          </Text>
        ) : (
          <Text>-</Text>
        )}
      </Row>
      <LineDivider />
      <Row justifyContent="space-between">
        <Tooltip
          width="100%"
          containerStyles={{ display: 'flex', alignItems: 'center', width: '100%' }}
          content={<Text>Your annual net profit(expenses) relative to your deposits(loans) USD value.</Text>}>
          <Text decoration="underline dotted" fitContent margin="0 0 10px 0" type="secondary" size="medium-2">
            NET APY
          </Text>
        </Tooltip>
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
