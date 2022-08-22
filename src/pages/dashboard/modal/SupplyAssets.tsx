/* eslint-disable react/require-default-props */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
// import InvestRow, { InvestRowSkeleton } from "@src/components/InvestRow";
import { useWalletVM } from '@components/Wallet/WalletModal/WalletVM';
import styled from '@emotion/styled';
import { Text } from '@src/UIKit/Text';
import { ReactComponent as NotFoundIcon } from '@src/assets/notFound.svg';
import { Button } from '@src/UIKit/Button';
import { MaxButton } from '@src/UIKit/MaxButton';
import { Column } from '@src/common/styles/Flex';
import { useStores } from '@src/stores';
import { BigNumberInput } from '@src/UIKit/BigNumberInput';
import { AmountInput } from '@src/UIKit/AmountInput';
import BN from '@src/common/utils/BN';
import _ from 'lodash';

interface IProps {
  assetId: string;
  decimals: number;
  amount: BN;
  setAmount?: (amount: BN) => void;
  onMaxClick?: () => void;
  onSubmit?: (amount: BN, assetId: string) => void;
  usdnEquivalent?: string;
  error?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
  padding: 10px 20px;
`;

const Footer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: auto;
`;

const InputContainer = styled.div<{
  focused?: boolean;
  error?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
}>`
  background: ${({ focused, error }) => (focused ? '#ffffff' : '#ffffff')};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: 48px;
  border-radius: 12px;
  width: 100%;
  position: relative;
  cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'unset')};

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'unset')};
  }

  border: 1px solid
    ${({ focused, readOnly, error }) => (error ? '#ED827E' : focused && !readOnly ? '#7075E9' : '#f1f2fe')};

  :hover {
    border-color: ${({ readOnly, focused, error }) =>
      error ? '#ED827E' : !readOnly && !focused ? '#C6C9F4' : focused ?? '#7075E9'};
  }
`;

const SupplyAssets: React.FC<IProps> = (props) => {
  // const { accountStore, poolsStore, stakeStore } = useStores();
  const [focused, setFocused] = useState(false);
  const { lendStore } = useStores();
  const [amount, setAmount] = useState<BN>(props.amount);

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    _.debounce((value: BN) => {
      props.setAmount && props.setAmount(value);
    }, 500),
    []
  );

  const handleChangeAmount = (v: BN) => {
    console.log('handleChangeAmount');
    setAmount(v);
    debounce(v);
  };

  return (
    <Root>
      <InputContainer focused={focused} readOnly={!props.setAmount} error={props.error}>
        {props.onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              props.onMaxClick && props.onMaxClick();
            }}
          />
        )}
        <BigNumberInput
          renderInput={(inputProps, ref) => (
            <AmountInput
              {...inputProps}
              onFocus={(e) => {
                inputProps.onFocus && inputProps.onFocus(e);
                !inputProps.readOnly && setFocused(true);
              }}
              onBlur={(e) => {
                inputProps.onBlur && inputProps.onBlur(e);
                setFocused(false);
              }}
              ref={ref}
            />
          )}
          autofocus={focused}
          decimals={props.decimals}
          value={amount}
          onChange={handleChangeAmount}
          placeholder="0.00"
          readOnly={!props.setAmount}
        />
      </InputContainer>
      <Footer>
        <Button onClick={() => lendStore.setDashboardModalOpened(false, '')} size="large" kind="primary">
          Cancel
        </Button>
        <Button onClick={() => props.onSubmit && props.onSubmit(amount, props.assetId)} size="large" kind="secondary">
          Supply
        </Button>
      </Footer>
    </Root>
  );
};
export default observer(SupplyAssets);
