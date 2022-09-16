/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import useWindowSize from '@src/hooks/useWindowSize';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import Card from '@src/common/styles/Card';
import { Text } from '@src/UIKit/Text';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Select } from '@src/UIKit/Select';
import DashboardTable from '@src/pages/usersList/DashboardTable';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import tokenLogos from '@src/common/constants/tokenLogos';
import Container from '@src/common/styles/Container';
import { LENDS_CONTRACTS, TOKENS_LIST_FULL, ROUTES } from '@src/common/constants';
import BN from '@src/common/utils/BN';
import { ReactComponent as LineDivider } from '@src/common/assets/icons/line_divider.svg';
import { ReactComponent as ChevronDown } from '@src/common/assets/icons/chevron_down.svg';

const Root = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  .details-link {
    display: flex;
    justify-content: flex-start;
    color: #7075e9;
    text-decoration: unset;

    svg {
      width: 20px;
      margin-right: 10px;
      transform: translateX(0) rotate(90deg);
      transition: transform 0.15s ease;
    }

    &:hover {
      text-decoration: underline;

      svg {
        transform: translateX(5px) rotate(90deg);
      }
    }
  }
`;

const AssetWrap = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
  border-bottom: 1px solid #f1f2fe;
  cursor: pointer;
  padding: 0 16px 10px 16px;
  box-sizing: border-box;

  &:last-child {
    padding-bottom: 16px;
    margin-bottom: 0;
    border-bottom: unset;
  }

  &:hover {
    background: #f8f8ff;
  }
`;

const SideViewWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  margin: 0 0 20px 0;
  width: 100%;

  @media (min-width: 880px) {
    width: 50%;
    margin: 0 0 20px 0;
  }

  @media (min-width: 1270px) {
    position: sticky;
    top: 117px;
    width: 30%;
    margin: 0 0 0 24px;
  }
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
  const { windowWidth } = useWindowSize();
  const [getTokensData, setTokensFullData] = useState<any>([]);
  const [getPoolType, setPoolType] = useState<number>(0);
  const [getMoneyType, setMoneyType] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMyAPI() {
      const poolsData: any = [];
      let arr: any = [];
      const poolsContracts: any = [];

      await Promise.all(Object.values(LENDS_CONTRACTS).map((item) => usersStore.loadBorrowSupplyUsers(item))).then(() =>
        usersStore.setInitialized(true)
      );

      if (getPoolType === 0) {
        poolsContracts.push(categoriesOptions[1].key, categoriesOptions[2].key);
      } else {
        poolsContracts.push(categoriesOptions[getPoolType].key);
      }

      if (usersStore.initialized && tokenStore.initialized) {
        poolsContracts.forEach((item: any) => {
          const tokens = tokenStore.filterPoolDataTokensStats(item);

          // counting values of TOKENS SUPPLY, depending of select value
          Object.entries(tokens).forEach(([key, tokenItem]) => {
            const tokenIndex = poolsData.map((poolItem: any) => poolItem.assetId).indexOf(key);

            // todo:
            // probleem with countring same assets for different pools
            if (tokenIndex === -1) {
              poolsData.push(tokenItem);
            } else {
              poolsData[tokenIndex].totalAssetSupply = BN.formatUnits(
                +poolsData[tokenIndex].totalAssetSupply + +tokenItem.totalAssetSupply,
                0
              );
            }
          });
        });

        // verifying with active select contract pool
        poolsContracts.forEach((contractId: string) => {
          usersStore.usersStatsByPool.forEach((item: any) => {
            if (item.contractId === contractId) arr.push(...item.tokens);
          });
        });

        arr = arr.filter((item: any) => (item.owner !== 'total' ? item : false));
      }

      setUsersData(arr);
      setTokensFullData(poolsData);
    }

    fetchMyAPI();
  }, [usersStore, tokenStore, usersStore.initialized, tokenStore.initialized, getPoolType]);

  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6).toFormat(5);
  };

  return (
    <Root>
      <Container>
        <Link className="details-link" to={ROUTES.HOME}>
          <ChevronDown />
          <Text weight={500} type="blue500" fitContent>
            Back to Main page
          </Text>
        </Link>
        <SizedBox height={24} />
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
              setPoolType(index);
            }}
          />
          <SizedBox width={24} />
          <Select
            options={moneyOptions}
            selected={moneyOptions[getMoneyType]}
            onSelect={({ key }) => {
              const index = moneyOptions.findIndex((o) => o.key === key);
              setMoneyType(index);
            }}
          />
        </Row>
        <SizedBox height={12} />
        <Row
          justifyContent="space-between"
          style={windowWidth! < 1270 ? { flexWrap: 'wrap', justifyContent: 'flex-start' } : { flexWrap: 'unset' }}>
          <Column
            crossAxisSize="max"
            style={windowWidth! < 1270 ? { order: 2, width: '100%' } : { order: 0, width: '70%' }}>
            {usersData && usersData.length ? (
              <Column crossAxisSize="max">
                <DashboardTable filteredTokens={usersData} />
                <SizedBox height={40} />
              </Column>
            ) : (
              <Text size="big">Assets loading...</Text>
            )}
          </Column>
          <SideViewWrap>
            <Card
              style={{
                padding: '16px 0 0 0',
                overflow: 'visible',
                position: 'relative',
              }}
              justifyContent="center">
              <Text margin="0 0 16px 0" size="big" weight={500} style={{ padding: '0 16px' }}>
                Total supply/borrow
              </Text>
              <LineDivider style={{ width: '100%' }} />
              <SizedBox height={18} />
              <Column crossAxisSize="max">
                {getTokensData && getTokensData.length ? (
                  getTokensData.map((item: any) => {
                    const iData = TOKENS_LIST_FULL.find((listItem: any) => listItem.assetId === item.assetId);

                    return (
                      <AssetWrap key={item.assetId}>
                        <Row
                          alignItems="center"
                          onClick={(e) => {
                            e.preventDefault();
                            return navigate(`/dashboard/token/${item.assetId}`);
                          }}>
                          {iData && iData.symbol && <SquareTokenIcon size="small" src={tokenLogos[iData.symbol]} />}
                          <SizedBox width={18} />
                          <Column>
                            <Text nowrap weight={500} fitContent>
                              {item.name}
                            </Text>
                            <Text>
                              ${' '}
                              {item?.currentPrice?.gte(0.0001)
                                ? item.currentPrice?.toFormat(4)
                                : item.currentPrice?.toFormat(8)}
                            </Text>
                          </Column>
                        </Row>
                        <Column>
                          <Text weight={500} textAlign="right" size="medium" nowrap>
                            {(+formatVal(item.totalAssetSupply, item.decimals)).toFixed(2)} {'/ '}
                            {(+formatVal(item.totalAssetBorrow, item.decimals)).toFixed(2)} {item.symbol}
                          </Text>
                          <Text textAlign="right" size="small" type="secondary">
                            $ {(+formatVal(item.totalAssetSupply, item.decimals) * +item.currentPrice).toFixed(2)}{' '}
                            {'/ '}$ {(+formatVal(item.totalAssetBorrow, item.decimals) * +item.currentPrice).toFixed(2)}
                          </Text>
                        </Column>
                      </AssetWrap>
                    );
                  })
                ) : (
                  <Text size="big" textAlign="center" style={{ margin: '10px' }}>
                    Assets loading...
                  </Text>
                )}
              </Column>
            </Card>
          </SideViewWrap>
        </Row>
      </Container>
    </Root>
  );
};

export default observer(UsersList);
