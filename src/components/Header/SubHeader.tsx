import styled from '@emotion/styled';
import React, { useState } from 'react';
import puzzleLogo from '@src/common/assets/logo.svg';
import { Column, Row } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import Wallet from '@components/Wallet/Wallet';
import { ROUTES } from '@src/common/constants';
import { useLocation, Link } from 'react-router-dom';
import { Anchor } from '@src/UIKit/Anchor';
import { observer } from 'mobx-react-lite';

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

const poolId = 'TURBO_PUZZLE_Pool';

const Header: React.FC<IProps> = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Main Pool', link: ROUTES.DASHBOARD },
    { name: 'TURBO PUZZLE Pool', link: `/dashboard/pool/${poolId}`, poolId },
  ];
  return (
    <Root>
      <TopMenu>
        <Row alignItems="center" crossAxisSize="max">
          <Desktop>
            {menuItems.map(({ name, link }) => (
              <MenuItem key={name} selected={isRoutesEquals(link, location.pathname)}>
                <Link to={link}>{name}</Link>
              </MenuItem>
            ))}
          </Desktop>
        </Row>
      </TopMenu>
    </Root>
  );
};

export default observer(Header);
