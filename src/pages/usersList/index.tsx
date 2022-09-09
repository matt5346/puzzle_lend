/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import Card from '@src/common/styles/Card';
import { Text } from '@src/UIKit/Text';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Select } from '@src/UIKit/Select';
import styled from '@emotion/styled';
import DashboardTable from '@src/pages/usersList/DashboardTable';
import { ReactComponent as LineDivider } from '@src/common/assets/icons/line_divider.svg';

const Root = styled.div`
  display: flex;
  max-width: 1360px;
`;

const SideViewWrap = styled.div`
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 117px;
  align-self: flex-start;
`;

const categoriesOptions = [
  { title: 'All Pools', key: 'all' },
  { title: 'Main Pool', key: '3P6dkRGSqgsNpQFbSYn9m8n4Dd8KRaj5TUU' },
  { title: 'Puzzle Pool', key: '3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT' },
];

const moneyOptions = [{ title: 'USDN', key: 'usdn' }];

const UsersList: React.FC = () => {
  const { lendStore } = useStores();

  const [usersData, setUsersData] = useState<any>([]);
  const [getPoolType, setPoolType] = useState<number>(0);
  const [getMoneyType, setMoneyType] = useState<number>(0);

  useEffect(() => {
    console.log(lendStore.usersStatsByPool, 'usersStatsByPool---1');
    let arr: any = [];

    lendStore.usersStatsByPool.forEach((item: any) => arr.push(...item.tokens));
    arr = arr.filter((item: any) => (item.owner !== 'total' ? item : false));
    console.log(arr, 'usersStatsByPool---3');
    setUsersData(arr);
  }, [lendStore]);

  return (
    <Root>
      <Column crossAxisSize="max">
        <SizedBox height={54} />
        <Text size="large" weight={500}>
          Users stats
        </Text>
        <SizedBox height={24} />
        <Text type="secondary" weight={500}>
          All users ({usersData.length})
        </Text>
        <SizedBox height={12} />
        <Row>
          <Select
            options={categoriesOptions}
            selected={categoriesOptions[getPoolType]}
            onSelect={({ key }) => {
              const index = categoriesOptions.findIndex((o) => o.key === key);
              console.log(key, getPoolType, 'KEY');
              setPoolType(index);
            }}
          />
          <SizedBox width={24} />
          <Select
            options={moneyOptions}
            selected={moneyOptions[getMoneyType]}
            onSelect={({ key }) => {
              const index = moneyOptions.findIndex((o) => o.key === key);
              console.log(key, getMoneyType, 'KEY');
              setMoneyType(index);
            }}
          />
        </Row>
        <SizedBox height={12} />
        <Row justifyContent="space-between">
          <Column crossAxisSize="max">
            {usersData && usersData.length && (
              <Column crossAxisSize="max">
                <DashboardTable filteredTokens={usersData} />
                <SizedBox height={40} />
              </Column>
            )}
          </Column>
          <SizedBox width={24} />
          <SideViewWrap>
            <Card
              style={{
                padding: '16px',
                overflow: 'visible',
                maxWidth: '315px',
                position: 'relative',
              }}
              justifyContent="center">
              <Text margin="0 0 16px 0" size="big" weight={500}>
                Total value
              </Text>
              <LineDivider />
            </Card>
          </SideViewWrap>
        </Row>
      </Column>
    </Root>
  );
};

export default observer(UsersList);
