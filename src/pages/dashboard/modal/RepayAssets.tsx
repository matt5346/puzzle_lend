/* eslint-disable react/require-default-props */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SizedBox } from '@src/UIKit/SizedBox';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { Text } from '@src/UIKit/Text';
import { Button } from '@src/UIKit/Button';
import { MaxButton } from '@src/UIKit/MaxButton';
import { useStores } from '@src/stores';
import { BigNumberInput } from '@src/UIKit/BigNumberInput';
import { AmountInput } from '@src/UIKit/AmountInput';
import { Row, Column } from '@src/common/styles/Flex';
import BN from '@src/common/utils/BN';
import _ from 'lodash';

import tokenLogos from '@src/common/constants/tokenLogos';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import { ReactComponent as Back } from '@src/common/assets/icons/arrowBackWithTail.svg';

interface IProps {
  assetId: string;
  decimals: number;
  amount: BN;
  assetSymbol?: string;
  assetName?: string;
  totalSupply: BN;
  userBalance?: BN;
  setupBorrowAPR?: string;
  selfBorrow: BN;
  rate: BN;
  setAmount?: (amount: BN) => void;
  onMaxClick?: (amount?: BN) => void;
  onClose?: () => void;
  onSubmit?: (amount: BN, assetId: string) => void;
  usdnEquivalent?: string;
  error?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 300px;
  padding: 24px 20px 16px 20px;
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
  background: ${({ focused, error }) => (focused ? '#ffffff' : '#F1F2FE')};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: 56px;
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

const TokenToDollar = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
`;

const BorrowAssets: React.FC<IProps> = (props) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
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

    if (+props.selfBorrow < +v) return;

    setAmount(v);
    debounce(v);
  };

  const getMax = (v: BN) => {
    console.log(+v, +props.selfBorrow, 'handleChangeAmount11111111');
    return BN.formatUnits(Math.ceil(+v), 0);
  };

  const formatVal = (val: BN, decimal: number) => {
    return BN.formatUnits(val, decimal).toSignificant(6).toString();
  };

  return (
    <Root>
      <Row onClick={() => navigate(`/dashboard/token/${props.assetId}`)} style={{ cursor: 'pointer' }}>
        <Row alignItems="center">
          {props.assetSymbol && <SquareTokenIcon size="small" src={tokenLogos[props.assetSymbol]} />}
          <SizedBox width={8} />
          <Column>
            <Text size="medium">{props.assetSymbol}</Text>
            <Text size="small" type="secondary">
              {props.assetName ? props.assetName : ''}
            </Text>
          </Column>
        </Row>
        <Column alignItems="flex-end">
          <Row alignItems="center" justifyContent="flex-end">
            <Text size="medium" type="secondary" fitContent>
              {formatVal(amount, props.decimals) || 0}
            </Text>
            <Back
              style={{
                minWidth: '16px',
                transform: 'rotate(180deg)',
              }}
            />
            <Text size="medium" fitContent>
              {props.selfBorrow
                ? (+formatVal(props.selfBorrow, props.decimals) - +formatVal(amount, props.decimals)).toFixed(3)
                : 0}
              <>&nbsp;</>
              {props.assetSymbol}
            </Text>
          </Row>
          <Text textAlign="right" nowrap size="medium" type="secondary">
            Borrow Balance
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      <InputContainer focused={focused} readOnly={!props.setAmount} error={props.error}>
        {props.onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              props.onMaxClick && props.onMaxClick(getMax(props.selfBorrow));
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
        <TokenToDollar>
          <Text size="small" type="secondary">
            ~${props.rate && amount ? (+formatVal(amount, props.decimals) * +props.rate.toFormat(4)).toFixed(3) : 0}
          </Text>
        </TokenToDollar>
      </InputContainer>
      <SizedBox height={8} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Wallet Balance
        </Text>
        <Text size="medium" fitContent>
          {BN.formatUnits(props.userBalance ? props.userBalance : BN.ZERO, props.decimals)
            .toSignificant(6)
            .toString()}
          <>&nbsp;</>
          {props.assetName}
        </Text>
      </Row>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrow APR
        </Text>
        <Text size="medium" fitContent>
          {props.setupBorrowAPR}%
        </Text>
      </Row>
      <SizedBox height={12} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrowed
        </Text>
        <Text size="medium" fitContent>
          {formatVal(props.selfBorrow, props.decimals)}
        </Text>
      </Row>
      <SizedBox height={12} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Transaction fee
        </Text>
        <Text size="medium" fitContent>
          0,005 WAVES
        </Text>
      </Row>
      <SizedBox height={16} />
      <Footer>
        <Button
          disabled={+amount === 0}
          fixed
          onClick={() => props.onSubmit && props.onSubmit(amount, props.assetId)}
          size="large">
          Repay
        </Button>
      </Footer>
    </Root>
  );
};
export default observer(BorrowAssets);
