/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable default-case */
import React from 'react';
import styled from '@emotion/styled';
import { TNotifyOptions } from '@src/stores/NotificationStore';
import { Row, Column } from '@src/common/styles/Flex';
import { Text } from '@src/UIKit/Text';

import { ReactComponent as CloseIcon } from '@src/common/assets/icons/close.svg';
import { ReactComponent as ErrorIcon } from '@src/common/assets/icons/error.svg';
import { ReactComponent as SuccessIcon } from '@src/common/assets/icons/success.svg';
import { ReactComponent as WarningIcon } from '@src/common/assets/icons/warning.svg';
import { ReactComponent as InfoIcon } from '@src/common/assets/icons/information.svg';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Body = styled(Row)`
  padding-right: 48px;
  box-sizing: border-box;
`;

const Link = styled.a`
  margin-top: 12px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #7075e9;
  cursor: pointer;
`;

const Icon: React.FunctionComponent<{
  type: 'error' | 'info' | 'warning' | 'success';
}> = ({ type }) => {
  let icon = null;

  const IconRoot = styled.div`
    margin-right: 16px;
    //flex: 1;
  `;
  switch (type) {
    case 'error':
      icon = <ErrorIcon />;
      break;
    case 'success':
      icon = <SuccessIcon />;
      break;
    case 'info':
      icon = <InfoIcon />;
      break;
    case 'warning':
      icon = <WarningIcon />;
      break;
  }
  return <IconRoot>{icon}</IconRoot>;
};

const getAlert = (content: string, { type, title, link, linkTitle, onClick, onClickText }: TNotifyOptions) => {
  if (!type) return null;
  return (
    <Root>
      <Body>
        <Icon type={type} />
        <Column>
          {title && (
            <Text size="medium" weight={500}>
              {title}
            </Text>
          )}
          <Text size="small" type="secondary" style={{ marginTop: 2, width: '100%', wordBreak: 'break-word' }}>
            {content}
          </Text>
          {link && (
            <Link target="_blank" href={link}>
              {linkTitle || link}
            </Link>
          )}
          {onClick && (
            <Link target="_blank" onClick={onClick}>
              {onClickText}
            </Link>
          )}
        </Column>
      </Body>
    </Root>
  );
};

export const closeAlertIcon = <CloseIcon />;

export default getAlert;
