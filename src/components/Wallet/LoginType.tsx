import styled from '@emotion/styled';
import React, { HTMLAttributes } from 'react';
import { Text } from '@src/UIKit/Text';
import { LOGIN_TYPE } from '@src/stores/AccountStore';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  icon: string;
  type: LOGIN_TYPE;
}

const Root = styled.div<{ disable?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px 24px;
  border: 1px solid #f1f2fe;
  box-sizing: border-box;
  border-radius: 12px;
  margin: 4px 0;
  cursor: ${({ disable }) => (disable ? 'not-allowed' : 'pointer')};

  &:hover {
    background: #f8f8ff;
  }
`;
const Icon = styled.img`
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
`;

const LoginType: React.FC<IProps> = ({ title, icon, type, ...rest }) => {
  return (
    <Root {...rest} disable={rest.onClick == null}>
      <Text type="blue500" size="medium" weight={500}>
        {title}
      </Text>
      <Icon src={icon} alt={type} />
    </Root>
  );
};
export default LoginType;
