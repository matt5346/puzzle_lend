import styled from '@emotion/styled';
import React, { useState } from 'react';
import puzzleLogo from '@src/common/assets/logo.svg';
import { Column, Row } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import Wallet from '@components/Wallet/Wallet';
import SubMenu from '@components/Header/SubHeader';
import { ROUTES } from '@src/common/constants';
import { useLocation, Link } from 'react-router-dom';
import { Anchor } from '@src/UIKit/Anchor';
import { observer } from 'mobx-react-lite';
import LinkItem from '@src/common/styles/LinkItem';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const Root = styled(Column)`
  width: 100%;
  background: #fff;
  align-items: center;
  z-index: 102;
  box-shadow: 0 8px 56px rgba(54, 56, 112, 0.16);

  //todo check
  a {
    text-decoration: none;
  }
`;

const TopMenu = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 64px;
  padding: 0 16px;
  max-width: 1440px;
  z-index: 103;
  box-sizing: border-box;
  background: #ffffff;

  &:after {
    display: block;
    content: '';
    position: absolute;
    width: 100vw;
    height: 1px;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f1f2fe;
  }

  @media (min-width: 880px) {
    height: 80px;
  }

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
  color: ${({ selected }) => (selected ? '#363870' : '#8082c5')};
  box-sizing: border-box;
  border-bottom: 4px solid ${({ selected }) => (selected ? '#7075e9' : 'transparent')};
  height: 100%;
  margin: 0 12px;

  a {
    color: ${({ selected }) => (selected ? '#363870' : '#8082c5')};
  }

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

const isRoutesEquals = (a: string, b: string) => {
  let result = a.replaceAll('/', '') === b.replaceAll('/', '');

  const splittedUrl = b.split('/');

  if (splittedUrl.includes(a.replaceAll('/', ''))) result = true;

  return result;
};

const Header: React.FC<IProps> = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', link: ROUTES.HOME, isBlank: false },
    { name: 'Puzzle Guidebook', link: 'https://puzzle-lend.gitbook.io/guidebook/', isBlank: true },
  ];
  return (
    <Root>
      <TopMenu>
        <Row alignItems="center" crossAxisSize="max">
          <Link to={menuItems[0].link}>
            <img className="logo" src={puzzleLogo} alt="logo" />
          </Link>
          <Desktop>
            <SizedBox width={54} />
            {menuItems.map(({ name, link, isBlank }) => (
              <MenuItem key={name} selected={isRoutesEquals(link, location.pathname)}>
                {!isBlank ? (
                  <Link to={link}>{name}</Link>
                ) : (
                  <LinkItem isRouterLink target="_blank" href="https://puzzle-lend.gitbook.io/guidebook/">
                    {name}
                  </LinkItem>
                )}
              </MenuItem>
            ))}
          </Desktop>
        </Row>
        <Wallet />
      </TopMenu>
      <SubMenu />
    </Root>
  );
};

export default observer(Header);
