/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import Card from '@src/common/styles/Card';
import { Text } from '@src/UIKit/Text';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Select } from '@src/UIKit/Select';
import { LENDS_CONTRACTS, TOKENS_LIST_FULL } from '@src/common/constants';
import DashboardTable from '@src/pages/usersList/DashboardTable';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import tokenLogos from '@src/common/constants/tokenLogos';
import BN from '@src/common/utils/BN';
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
  const { usersStore, tokenStore } = useStores();
  const [usersData, setUsersData] = useState<any>([]);
  const [getTokensData, setTokensFullData] = useState<any>([]);
  const [getPoolType, setPoolType] = useState<number>(0);
  const [getMoneyType, setMoneyType] = useState<number>(0);

  useEffect(() => {
    const poolsData: any = [];
    console.log(Object.values(LENDS_CONTRACTS), 'Object.values(LENDS_CONTRACTS)---1');
    Object.values(LENDS_CONTRACTS).forEach((item) => {
      console.log(tokenStore.filterPoolDataTokensStats(item), '...tokenStore.filterPoolDataTokens(item)');
      // poolsData.push(...tokenStore.filterPoolDataTokens(item));
      const tokens = tokenStore.filterPoolDataTokensStats(item);

      Object.entries(tokens).forEach(([key, tokenItem]) => {
        const tokenIndex = poolsData.map((poolItem: any) => poolItem.assetId).indexOf(key);

        console.log(tokenIndex, 'index -1');
        if (tokenIndex === -1) {
          poolsData.push(tokenItem);
        } else {
          const poolItem = poolsData[tokenIndex];
        }
      });
    });
    console.log(poolsData, 'poolsData1');

    let arr: any = [];

    usersStore.usersStatsByPool.forEach((item: any) => arr.push(...item.tokens));
    arr = arr.filter((item: any) => (item.owner !== 'total' ? item : false));
    console.log(arr, 'usersStatsByPool---3');
    setUsersData(arr);
    setTokensFullData(poolsData);
  }, [usersStore, tokenStore]);

  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6).toFormat(5);
  };

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
                minWidth: '400px',
                position: 'relative',
              }}
              justifyContent="center">
              <Text margin="0 0 16px 0" size="big" weight={500}>
                Total value
              </Text>
              <LineDivider style={{ width: '100%' }} />
              <SizedBox height={18} />
              <Column crossAxisSize="max">
                {getTokensData &&
                  getTokensData.length &&
                  getTokensData.map((item: any) => {
                    const iData = TOKENS_LIST_FULL.find((listItem: any) => listItem.assetId === item.assetId);
                    console.log(iData, 'IDATA');

                    return (
                      <Row
                        mainAxisSize="stretch"
                        justifyContent="space-between"
                        style={{ paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid #f1f2fe' }}>
                        <Row alignItems="center" style={{ cursor: 'pointer' }}>
                          {iData && iData.symbol && <SquareTokenIcon size="small" src={tokenLogos[iData.symbol]} />}
                          <SizedBox width={18} />
                          <Text nowrap weight={500} fitContent>
                            {item.name}
                            <Text>
                              ${' '}
                              {item?.currentPrice?.gte(0.0001)
                                ? item.currentPrice?.toFormat(4)
                                : item.currentPrice?.toFormat(8)}
                            </Text>
                          </Text>
                        </Row>
                        <Column>
                          <Text weight={500} textAlign="right" size="medium" nowrap>
                            {formatVal(item.totalAssetSupply, item.decimals)} {item.symbol}
                          </Text>
                          <Text textAlign="right" size="small" type="secondary">
                            $ {(+formatVal(item.totalAssetSupply, item.decimals) * +item.currentPrice).toFixed(2)}
                          </Text>
                        </Column>
                      </Row>
                    );
                  })}
              </Column>
            </Card>
          </SideViewWrap>
        </Row>
      </Column>
    </Root>
  );
};

export default observer(UsersList);
