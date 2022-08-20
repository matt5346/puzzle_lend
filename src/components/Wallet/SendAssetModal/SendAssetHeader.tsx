/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from '@emotion/styled';
import React, { SyntheticEvent } from 'react';
import { ReactComponent as Back } from '@src/common/assets/icons/arrowBackWithTail.svg';

import { Text } from '@src/UIKit/Text';
import { SizedBox } from '@src/UIKit/SizedBox';

interface IProps {
  tokenName?: string;
  onClose?: (e: SyntheticEvent) => any;
}

const Root = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const SendAssetHeader: React.FC<IProps> = ({ tokenName, onClose }) => {
  return (
    <Root>
      <Back onClick={onClose} style={{ cursor: 'pointer' }} />
      <Text fitContent weight={500}>
        {tokenName}
      </Text>
      <SizedBox width={24} />
    </Root>
  );
};
export default SendAssetHeader;
