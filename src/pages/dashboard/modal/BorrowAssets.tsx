/* eslint-disable react/require-default-props */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { Button } from '@src/UIKit/Button';
import { MaxButton } from '@src/UIKit/MaxButton';
import { useStores } from '@src/stores';
import InputContainer from '@src/common/styles/InputContainer';
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
  onClose?: () => void;
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

const BorrowAssets: React.FC<IProps> = (props) => {
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
        <Button onClick={() => props.onClose && props.onClose()} size="large" kind="primary">
          Cancel
        </Button>
        <Button onClick={() => props.onSubmit && props.onSubmit(amount, props.assetId)} size="large" kind="secondary">
          Borrow
        </Button>
      </Footer>
    </Root>
  );
};
export default observer(BorrowAssets);
