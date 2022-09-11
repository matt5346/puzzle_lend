/* eslint-disable @typescript-eslint/no-empty-interface */
import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import noPage from '@src/common/assets/404.svg';
import { Text } from '@src/UIKit/Text';
import { Row } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import { ROUTES } from '@src/common/constants';

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  width: 100%;
`;
const Img = styled.img`
  max-width: 240px;
  height: auto;
  padding-bottom: 44px;
`;
const paths = [{ title: 'Dashboard', link: ROUTES.DASHBOARD }];
const Path = styled(Link)`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #7075e9;

  margin-left: 32px;

  &:first-of-type {
    margin-left: 0;
  }
`;
const NotFound: React.FC<IProps> = () => {
  return (
    <Root>
      <Img src={noPage} alt="noPage" />
      <Text fitContent size="large">
        There is no such page
      </Text>
      <Text fitContent type="secondary" size="medium">
        But there are many other useful pages
      </Text>
      <SizedBox height={32} />
      <Row justifyContent="center" className="nav-links">
        {paths.map((i, index) => (
          <Path to={i.link} key={index}>
            {i.title}
          </Path>
        ))}
      </Row>
    </Root>
  );
};
export default NotFound;
