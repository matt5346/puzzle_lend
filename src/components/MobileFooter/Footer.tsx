import styled from '@emotion/styled';
import React, { useState, useEffect } from 'react';
import { useStores } from '@src/stores';
import { Row } from '@src/common/styles/Flex';
import { ROUTES } from '@src/common/constants';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Text } from '@src/UIKit/Text';
import { observer } from 'mobx-react-lite';

import ActionIcon from '@src/common/assets/icons/deposit.svg';
import Home from '@src/common/assets/icons/home.svg';
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const FooterMenu = styled.footer`
  position: fixed;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  z-index: 103;
  box-sizing: border-box;
  background: #ffffff;
  padding: 10px 0;

  @media (min-width: 880px) {
    height: 80px;
  }
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  border-box: 4px;
  box-sizing: border-box;
  height: 100%;
  padding: 0 16px;
  cursor: pointer;
  text-align: center;
  width: 33%;

  p {
    text-decoration: 1px solid #000;
    color: #8082c5;
  }

  &.selected {
    background-color: #7075e9;
    padding: 5px;
    borde-radius: 4px;

    p {
      color: #fff;
    }
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
`;

export interface LinkType {
  name: string;
  link: string;
  icon: string;
  params: string | null;
}

const isRoutesEquals = (a: string, b: string) => {
  const result = a.replaceAll('/', '') === b.replaceAll('/', '');

  return result;
};

const Header: React.FC<IProps> = () => {
  const [navItems, setNavItems] = useState<LinkType[]>([]);
  const { accountStore } = useStores();
  const { address } = accountStore;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const menuItems = [
      { name: 'My supply', link: ROUTES.DASHBOARD, params: 'supply', icon: ActionIcon },
      { name: 'Home', link: ROUTES.DASHBOARD, icon: Home, params: null },
      { name: 'My borrow', link: ROUTES.DASHBOARD, params: 'borrow', icon: ActionIcon },
    ];

    const menuItemsWithoutUser = [{ name: 'Home', link: ROUTES.DASHBOARD, icon: Home, params: null }];

    if (address == null) setNavItems(menuItemsWithoutUser);
    if (address != null) setNavItems(menuItems);
  }, [address]);

  return (
    <>
      <FooterMenu>
        <Row justifyContent="space-around" alignItems="center" crossAxisSize="max">
          {navItems.map(({ name, link, icon, params }) => (
            <MenuItem
              key={name}
              className={
                isRoutesEquals(params !== null ? `${link}/${params}` : 'dashboard', location.pathname) ? 'selected' : ''
              }
              onClick={(e) => {
                e.preventDefault();
                return navigate(params !== null ? `${link}/${params}` : link);
              }}>
              <Icon src={icon} alt={name} />
              <Text>{name}</Text>
            </MenuItem>
          ))}
        </Row>
      </FooterMenu>
    </>
  );
};

export default observer(Header);
