import styled from '@emotion/styled';
import React, { useState } from 'react';
import puzzleLogo from '@src/common/assets/logo.svg';
import { Column, Row } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import Wallet from '@components/Wallet/Wallet';
import { ROUTES } from '@src/common/constants';
import { useLocation } from 'react-router-dom';
import { Anchor } from '@src/UIKit/Anchor';
import { observer } from 'mobx-react-lite';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const Root = styled(Column)`
  width: 100%;
  background: #120c18;
  align-items: center;
  z-index: 102;
  box-shadow: 0 8px 56px rgba(54, 56, 112, 0.16);

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
  height: 64px;
  padding: 0 16px;
  max-width: 1440px;
  z-index: 102;
  @media (min-width: 880px) {
    height: 80px;
  }
  box-sizing: border-box;
  background: #120c18;
  color: #fff;

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

const MenuItem = styled(Anchor)<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${({ selected }) => (selected ? '#fff' : '#c0c3ff')};
  box-sizing: border-box;
  border-bottom: 4px solid ${({ selected }) => (selected ? '#fff' : 'transparent')};
  height: 100%;
  margin: 0 12px;

  &:hover {
    border-bottom: 4px solid #c6c9f4;
    color: #7075e9;
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

const Header: React.FC<IProps> = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Home', link: ROUTES.HOME },
    { name: 'Dashboard', link: ROUTES.DASHBOARD },
  ];
  return (
    <Root>
      <TopMenu>
        <Row alignItems="center" crossAxisSize="max">
          <a href="https://puzzleswap.org">
            <img className="logo" src={puzzleLogo} alt="logo" />
          </a>
          <Desktop>
            <SizedBox width={54} />
            {menuItems.map(({ name, link }) => (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
                href={link}
                target={link !== 'https://puzzlemarket.org/' ? '_self' : ''}>
                {name}
              </MenuItem>
            ))}
          </Desktop>
        </Row>
        <Desktop>
          <Wallet />
        </Desktop>
      </TopMenu>
    </Root>
  );
};

export default observer(Header);
