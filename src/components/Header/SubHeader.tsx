import styled from '@emotion/styled';
import React, { useState } from 'react';
import { useStores } from '@src/stores';
import { Column, Row } from '@src/common/styles/Flex';
import { Text } from '@src/UIKit/Text';
import { ROUTES, LENDS_CONTRACTS } from '@src/common/constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import TokenStore from '@src/stores/TokenStore';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const Root = styled(Column)`
  width: 100%;
  background: #fff;
  align-items: center;
  z-index: 102;
  // box-shadow: 0 8px 56px rgba(54, 56, 112, 0.16);

  //todo check
  a {
    text-decoration: none;
  }
`;

const TopMenu = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  padding: 0 16px;
  max-width: 1440px;
  z-index: 102;
  box-sizing: border-box;
  background: #ffffff;

  .logo {
    height: 30px;
    @media (min-width: 880px) {
      height: 36px;
    }
  }

  .icon {
    cursor: pointer;
  }
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  box-sizing: border-box;
  border-bottom: 4px solid ${({ selected }) => (selected ? '#7075e9' : 'transparent')};
  height: 100%;
  margin: 0 12px;

  a {
    color: ${({ selected }) => (selected ? '#363870' : '#8082c5')};
  }

  &:hover {
    border-bottom: 4px solid #c6c9f4;
    a {
      color: #7075e9;
    }
  }
`;

const Desktop = styled.div`
  display: none;
  min-width: fit-content;
  @media (min-width: 880px) {
    height: 100%;
    display: flex;
  }
`;

const isRoutesEquals = (a: string, b: string) => a.replaceAll('/', '') === b.replaceAll('/', '');

const poolId = 'waves_pool';

const Header: React.FC<IProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lendStore, tokenStore } = useStores();

  const menuItems = [
    { name: 'Main Pool', link: ROUTES.DASHBOARD, poolContract: LENDS_CONTRACTS.mainPool },
    {
      name: 'Waves Pool',
      link: `/dashboard/pool/${LENDS_CONTRACTS.wavesPool}`,
      poolId,
      poolContract: LENDS_CONTRACTS.wavesPool,
    },
  ];
  return (
    <Root>
      <TopMenu>
        <Row alignItems="center" crossAxisSize="max">
          <Desktop>
            {menuItems.map(({ name, link, poolContract }) => (
              <MenuItem key={name} selected={isRoutesEquals(link, location.pathname)}>
                <Text
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    lendStore.setActivePool(poolContract);
                    tokenStore.syncTokenStatistics(lendStore.activePoolName);
                    navigate(link, { replace: true });
                  }}>
                  {name}
                </Text>
              </MenuItem>
            ))}
          </Desktop>
        </Row>
      </TopMenu>
    </Root>
  );
};

export default observer(Header);
