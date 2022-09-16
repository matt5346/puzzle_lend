/* eslint-disable react/require-default-props */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStores } from '@src/stores';
import { SizedBox } from '@src/UIKit/SizedBox';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { Text } from '@src/UIKit/Text';
import { Button } from '@src/UIKit/Button';
import { MaxButton } from '@src/UIKit/MaxButton';
import { BigNumberInput } from '@src/UIKit/BigNumberInput';
import { AmountInput } from '@src/UIKit/AmountInput';
import { Row, Column } from '@src/common/styles/Flex';
import BN from '@src/common/utils/BN';
import _ from 'lodash';

import tokenLogos from '@src/common/constants/tokenLogos';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import { ReactComponent as Back } from '@src/common/assets/icons/arrowBackWithTail.svg';
import { ReactComponent as Swap } from '@src/common/assets/icons/swap.svg';

interface IProps {
  assetId: string;
  decimals: number;
  amount: BN;
  assetSymbol?: string;
  assetName?: string;
  totalSupply: BN;
  userBalance: BN;
  setupBorrowAPR?: string;
  selfBorrow: BN;
  rate: BN;
  setAmount?: (amount: BN) => void;
  onMaxClick?: (amount?: BN) => void;
  onClose?: () => void;
  onSubmit?: (amount: BN, assetId: string, contractAddress: string) => void;
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
  display: flex;
  align-items: center;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;

  svg {
    margin-left: 5px;
  }

  &:hover {
    background-color: #fff;
  }
`;

const DollarSymbol = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  font-size: 18px;
  left: 67px;
  top: 50%;
  color: #363870;
  transform: translateY(-50%);
`;

const BorrowAssets: React.FC<IProps> = (props) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(props.amount);
  const [isNative, setConvertToNative] = useState<boolean>(true);
  const { lendStore, accountStore } = useStores();
  const [error, setError] = useState<string>('');

  const setInputAmountMeasure = (isNativeToken: boolean) => {
    setConvertToNative(isNativeToken);
  };

  const formatVal = (valArg: BN, decimal: number) => {
    return (+valArg / 10 ** decimal).toFixed(4);
  };

  useEffect(() => {
    props.amount && setAmount(props.amount);

    if (+props.selfBorrow === 0) setError('You did not borrow anything');
  }, [props.amount, props.selfBorrow]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    _.debounce((value: BN) => {
      props.setAmount && props.setAmount(value);
    }, 500),
    []
  );

  const getUserRepay = () => {
    if (!isNative && props.selfBorrow)
      return (
        +formatVal(props.selfBorrow, props.decimals) * +props.rate?.toFormat(4) -
        +formatVal(amount, props.decimals)
      ).toFixed(2);

    return (+formatVal(props.selfBorrow, props.decimals) - +formatVal(amount, props.decimals)).toFixed(2);
  };

  const handleChangeAmount = (v: BN) => {
    let isError = false;
    let walletBalance = props.userBalance;
    let forRepay = props.selfBorrow;
    if (!isNative) {
      walletBalance = BN.parseUnits(+walletBalance * +props.rate?.toFormat(4), 0);
      forRepay = BN.parseUnits(+forRepay * +props.rate?.toFormat(4), 0);
    }

    if (+forRepay * 1.05 < +v) {
      setError(`Too big value for repaying`);
      isError = true;
    }

    if (+walletBalance < +v) {
      setError(`Amount of repay bigger than wallet balance`);
      isError = true;
    }

    if (!isError) setError('');
    setAmount(v);
    debounce(v);
  };

  const submitForm = () => {
    let amountVal = props.amount;

    if (!isNative) amountVal = BN.parseUnits(Math.ceil(+amountVal / +props.rate?.toFormat(4)), 0);

    props.onSubmit!(amountVal, props.assetId, lendStore.activePoolContract);
  };

  const getMax = (val: BN) => {
    if (!isNative) return BN.formatUnits(Math.ceil(+val * +props.rate?.toFormat(4)), 0);

    // fixing problem of lower repaying number
    return BN.formatUnits(Math.ceil(+val + 1), 0);
  };

  return (
    <Root>
      <Row>
        <Row
          alignItems="center"
          onClick={() => navigate(`/dashboard/token/${props.assetId}`)}
          style={{ cursor: 'pointer' }}>
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
                maxWidth: '16px',
                transform: 'rotate(180deg)',
              }}
            />
            <Text
              size="medium"
              fitContent
              onClick={() => {
                setFocused(true);
                props.onMaxClick && props.onMaxClick(getMax(props.selfBorrow));
              }}
              style={{ cursor: 'pointer' }}>
              {getUserRepay()}
              <>&nbsp;</>
              {isNative ? props.assetSymbol : '$'}
            </Text>
          </Row>
          <Text textAlign="right" nowrap size="medium" type="secondary">
            Borrow Balance
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      <InputContainer focused={focused} readOnly={!props.setAmount} error={props.error}>
        {!isNative && <DollarSymbol>$</DollarSymbol>}
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
          isNative={isNative}
          rate={props.rate}
          autofocus={focused}
          decimals={props.decimals}
          value={amount}
          onChange={handleChangeAmount}
          placeholder="0.00"
          readOnly={!props.setAmount}
        />
        {isNative ? (
          <TokenToDollar onClick={() => setInputAmountMeasure(false)}>
            <Text size="small" type="secondary">
              ~${props.rate && amount ? (+formatVal(amount, props.decimals) * +props.rate?.toFormat(4)).toFixed(3) : 0}
            </Text>
            <Swap />
          </TokenToDollar>
        ) : (
          <TokenToDollar onClick={() => setInputAmountMeasure(true)}>
            <Text size="small" type="secondary">
              ~{props.assetSymbol}{' '}
              {props.rate && amount && +formatVal(BN.parseUnits(+amount / +props.rate?.toFormat(4), 0), props.decimals)}
            </Text>
            <Swap />
          </TokenToDollar>
        )}
      </InputContainer>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrow APY
        </Text>
        <Text size="medium" fitContent>
          {props.setupBorrowAPR ? (+props.setupBorrowAPR).toFixed(2) : 0}%
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrowed
        </Text>
        <Text size="medium" fitContent>
          {props.selfBorrow ? formatVal(props.selfBorrow, props.decimals) : 0}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Wallet Balance
        </Text>
        <Text size="medium" fitContent>
          {props.userBalance
            ? (+formatVal(props.userBalance, props.decimals) - +formatVal(amount, props.decimals)).toFixed(4)
            : 0}
          <>&nbsp;</>
          {props.assetName}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Transaction fee
        </Text>
        <Text size="medium" fitContent>
          0.005 WAVES
        </Text>
      </Row>
      <SizedBox height={16} />
      <Footer>
        {accountStore && accountStore.address ? (
          <Button
            disabled={+amount === 0 || error !== '' || +props.selfBorrow === 0}
            fixed
            kind={error !== '' ? 'error' : 'primary'}
            onClick={() => submitForm()}
            size="large">
            {error !== '' ? error : 'Repay'}
          </Button>
        ) : (
          <Button
            fixed
            onClick={() => {
              accountStore.setLoginModalOpened(true);
              lendStore.setDashboardModalOpened(false, '', lendStore.dashboardModalStep);
            }}
            size="large">
            Login
          </Button>
        )}
      </Footer>
    </Root>
  );
};
export default observer(BorrowAssets);
