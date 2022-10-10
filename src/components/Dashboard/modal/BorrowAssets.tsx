/* eslint-disable react/require-default-props */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useCallback } from 'react';
import { useStores } from '@src/stores';
import { useNavigate } from 'react-router-dom';
import { SizedBox } from '@src/UIKit/SizedBox';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { Emoji } from '@src/UIKit/Emoji';
import { Text } from '@src/UIKit/Text';
import { Button } from '@src/UIKit/Button';
import { MaxButton } from '@src/UIKit/MaxButton';
import { BigNumberInput } from '@src/UIKit/BigNumberInput';
import { AmountInput } from '@src/UIKit/AmountInput';
import { Row, Column } from '@src/common/styles/Flex';
import { Checkbox } from '@src/UIKit/Checkbox';
import BN from '@src/common/utils/BN';
import _, { values } from 'lodash';
import { TTokenStatistics, IToken } from '@src/common/constants';

import tokenLogos from '@src/common/constants/tokenLogos';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import { ReactComponent as Back } from '@src/common/assets/icons/arrowBackWithTail.svg';
import { ReactComponent as Swap } from '@src/common/assets/icons/swap.svg';

interface IProps {
  assetId: string;
  decimals: number;
  userColatteral: number;
  amount: BN;
  isAgree: boolean;
  assetName?: string;
  assetSymbol?: string;
  userHealth: number;
  totalSupply: BN;
  totalBorrow: BN;
  userBalance: BN;
  setupLtv: BN;
  setupLts: BN;
  setupBorrowAPR: BN;
  selfBorrow: BN;
  rate: BN;
  maxPrice: BN;
  setAmount?: (amount: BN) => void;
  onMaxClick?: (amount?: BN) => void;
  onClose?: () => void;
  onSubmit?: (amount: BN, assetId: string, contractAddress: string) => void;
  onChange: (agreement: boolean) => void;
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
  const [getDynamicAccountHealth, setAccountHealth] = useState<number>(100);
  const [error, setError] = useState<string>('');
  const { lendStore, accountStore, tokenStore } = useStores();

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const formatVal = (valArg: BN | number, decimal: number) => {
    return BN.formatUnits(valArg, decimal);
  };

  const getReserves = () => {
    return formatVal(props.totalSupply, props.decimals).minus(formatVal(props.totalBorrow, props.decimals)).toFixed(2);
  };

  // todo: BNNNN
  const countAccountHealth = (currentBorrow: any) => {
    if (+currentBorrow === 0) {
      setAccountHealth(100);
      return 100;
    }

    let currentBorrowAmount = formatVal(currentBorrow, props.decimals);
    const tokens = tokenStore.poolDataTokens;
    let borrowCapacity = BN.ZERO;
    let borrowCapacityUsed = BN.ZERO;

    if (!isNative) currentBorrowAmount = currentBorrowAmount.div(props.rate);

    tokens.forEach((item: IToken) => {
      const tokenData: TTokenStatistics = tokenStore.poolDataTokensWithStats[item.assetId];
      if (+tokenData.selfSupply > 0) {
        borrowCapacity = formatVal(tokenData.selfSupply, tokenData.decimals)
          .times(tokenData.minPrice)
          .times(+tokenData.setupLtv / 100)
          .plus(borrowCapacity);
      }

      if (+tokenData.selfBorrow > 0) {
        let localCapacityused = formatVal(tokenData.selfBorrow, tokenData.decimals)
          .times(tokenData.maxPrice)
          .div(+tokenData.setupLts / 100);

        if (tokenData.assetId === props.assetId) {
          localCapacityused = formatVal(tokenData.selfBorrow, tokenData.decimals)
            .plus(currentBorrowAmount)
            .times(tokenData.maxPrice)
            .div(+tokenData.setupLts / 100);
        }

        borrowCapacityUsed = localCapacityused.plus(borrowCapacityUsed);
      }
    });

    // case when user did'nt borrow anything
    if (+borrowCapacityUsed === 0 || props.selfBorrow.isEqualTo(0))
      borrowCapacityUsed = currentBorrowAmount
        .times(props.maxPrice)
        .div(+props.setupLts / 100)
        .plus(borrowCapacityUsed);

    const accountHealth: number = +BN.formatUnits(1, 0).minus(borrowCapacityUsed.div(borrowCapacity)).times(100);

    if (+borrowCapacity < 0 || accountHealth < 0) {
      setAccountHealth(0);
      return 0;
    }

    setAccountHealth(accountHealth);
    return accountHealth;
  };

  // counting maximum amount for MAX btn
  const userMaximumToBorrowBN = (userColatteral: number, rate: BN) => {
    let maximum = BN.ZERO;
    let isError = false;

    // if !isNative, show maximum in dollars, collateral in dollars by default
    maximum = formatVal(userColatteral, 6);
    maximum = maximum.times(+props.setupLts / 100);

    // if isNative, show maximum in crypto AMOUNT
    if (isNative) maximum = maximum.div(rate);

    const totalReserves = formatVal(props.totalSupply, props.decimals).minus(
      formatVal(props.totalBorrow, props.decimals)
    );

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (totalReserves.lt(maximum)) {
      setError('Not enough Reserves in Pool');
      isError = true;
      return totalReserves.times(10 ** props.decimals).times(0.8);
    }

    const val = maximum.times(10 ** props.decimals).times(0.8);

    if (countAccountHealth(val) < 1) {
      setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) setError('');
    // current recommended maximum borrow, no more than 80% of
    return val.toSignificant(0);
  };

  // counting maximum after USER INPUT
  const userMaximumToBorrow = (userColatteral: number, rate: BN) => {
    let maximum = formatVal(userColatteral, 6);

    // if isNative, show maximum in crypto AMOUNT
    // else in dollars
    if (isNative) maximum = formatVal(userColatteral, 6).div(rate);

    maximum = maximum.times(+props.setupLts / 100);

    const totalReserves = formatVal(props.totalSupply, props.decimals).minus(
      formatVal(props.totalBorrow, props.decimals)
    );

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (totalReserves.lt(maximum)) {
      return +totalReserves.minus(formatVal(amount, props.decimals));
    }

    return maximum.minus(formatVal(amount, props.decimals));
  };

  const submitForm = () => {
    let amountVal = props.amount;

    if (!isNative) amountVal = amountVal.div(props.rate);

    props.onSubmit!(formatVal(+amountVal.toFixed(0), 0), props.assetId, lendStore.activePoolContract);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    _.debounce((value: BN) => {
      props.setAmount && props.setAmount(value);
    }, 500),
    []
  );

  const handleChangeAmount = (v: BN) => {
    const formattedVal = formatVal(v, props.decimals);
    // if !isNative, show maximum in dollars, collateral in dollars by default
    let maxCollateral = formatVal(props.userColatteral, 6);
    // reserves in crypto amount by default
    let totalReserves = formatVal(props.totalSupply, props.decimals).minus(
      formatVal(props.totalBorrow, props.decimals)
    );
    let isError = false;

    // if isNative, show maximum in crypto AMOUNT
    if (isNative) maxCollateral = formatVal(props.userColatteral, 6).div(props.rate);
    if (!isNative) totalReserves = totalReserves.times(props.rate);

    console.log(+formattedVal, +maxCollateral, '+formattedVal, +maxCollateral');
    if (maxCollateral.isLessThanOrEqualTo(formattedVal)) {
      setError('Borrow amount less than your Collateral');
      isError = true;
    }

    if (totalReserves.isLessThanOrEqualTo(formattedVal)) {
      setError('Not enough Reserves in Pool');
      isError = true;
    }

    if (countAccountHealth(v) < 1) {
      setError(`Account health in risk of liquidation`);
      isError = true;
    }

    if (!isError) setError('');
    setAmount(v);
    debounce(v);
  };

  const setInputAmountMeasure = (isNativeToken: boolean) => {
    let fixedValue = amount;

    if (isNativeToken && !isNative) fixedValue = fixedValue.div(props.rate);

    setAmount(fixedValue);
    debounce(fixedValue);
    setConvertToNative(isNativeToken);
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
              {+formatVal(amount, props.decimals).toFixed(4) || 0}
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
                props.onMaxClick && props.onMaxClick(userMaximumToBorrowBN(props.userColatteral, props.maxPrice));
              }}
              style={{ cursor: 'pointer' }}>
              {+props.userColatteral && +props.maxPrice
                ? (+userMaximumToBorrow(props.userColatteral, props.maxPrice)).toFixed(6)
                : 0}
              <>&nbsp;</>
              {isNative ? props.assetSymbol : '$'}
            </Text>
          </Row>
          <Text textAlign="right" nowrap size="medium" type="secondary">
            Max possible to borrow
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
              props.onMaxClick && props.onMaxClick(userMaximumToBorrowBN(props.userColatteral, props.maxPrice));
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
          rate={props.rate}
          isNative={isNative}
          onChange={handleChangeAmount}
          placeholder="0.00"
          readOnly={!props.setAmount}
        />
        {isNative ? (
          <TokenToDollar onClick={() => setInputAmountMeasure(false)}>
            <Text size="small" type="secondary">
              ~${props.rate && amount ? (+formatVal(amount, props.decimals).times(props.rate)).toFixed(4) : 0}
            </Text>
            <Swap />
          </TokenToDollar>
        ) : (
          <TokenToDollar onClick={() => setInputAmountMeasure(true)}>
            <Text size="small" type="secondary">
              ~{props.assetSymbol}{' '}
              {props.rate && amount && (+formatVal(amount.div(props.rate), props.decimals)).toFixed(4)}
            </Text>
            <Swap />
          </TokenToDollar>
        )}
      </InputContainer>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          {props.assetSymbol} liquidity
        </Text>
        <Text size="medium" fitContent>
          {getReserves() || 0} {props.assetSymbol}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrow APY
        </Text>
        <Text size="medium" fitContent>
          {+props.setupBorrowAPR ? (+props.setupBorrowAPR).toFixed(2) : 0} %
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrowed
        </Text>
        <Text size="medium" fitContent>
          {+props.selfBorrow ? (+formatVal(props.selfBorrow, props.decimals)).toFixed(4) : 0} {props.assetSymbol}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row alignItems="center" justifyContent="space-between">
        <Text size="medium" type="secondary" nowrap>
          Account Health
        </Text>
        <Row alignItems="center" justifyContent="flex-end">
          <Text size="medium" type="success" fitContent>
            {+props.userHealth.toFixed(2) || 0} %
          </Text>
          {getDynamicAccountHealth !== 100 ? (
            <>
              <Back
                style={{
                  minWidth: '16px',
                  maxWidth: '16px',
                  height: '18px',
                  transform: 'rotate(180deg)',
                }}
              />
              <Text type={getDynamicAccountHealth < +props.userHealth ? 'error' : 'success'} size="medium" fitContent>
                <>&nbsp;</>
                {getDynamicAccountHealth && amount ? getDynamicAccountHealth.toFixed(2) : 0}%
              </Text>
            </>
          ) : null}
        </Row>
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
      {/* <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Checkbox
          label="You will be liquidated if you can not cover your borrow"
          checked={props.isAgree}
          onChange={(e) => props.onChange(e)}
        />
      </Row> */}
      <SizedBox height={24} />
      {/* if NO liquidity show ERROR, else borrow or login */}
      <Footer>
        {accountStore && !accountStore.address ? (
          <Button
            fixed
            onClick={() => {
              accountStore.setLoginModalOpened(true);
              lendStore.setDashboardModalOpened(false, '', lendStore.dashboardModalStep);
            }}
            size="large">
            Login
          </Button>
        ) : (
          accountStore &&
          accountStore.address && (
            <Button fixed kind={error !== '' ? 'error' : 'primary'} onClick={() => submitForm()} size="large">
              Borrow
            </Button>
          )
        )}
      </Footer>
    </Root>
  );
};
export default observer(BorrowAssets);
