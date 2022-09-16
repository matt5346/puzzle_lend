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
import _ from 'lodash';
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
  setupLtv: string;
  setupBorrowAPR?: string;
  selfBorrow: BN;
  rate: BN;
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
  const [getDynamicAccountHealth, setAccountHealth] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const { lendStore, accountStore, tokenStore } = useStores();

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const formatVal = (valArg: BN, decimal: number) => {
    return (+valArg / 10 ** decimal).toFixed(2);
  };

  const setInputAmountMeasure = (isNativeToken: boolean) => {
    setConvertToNative(isNativeToken);
  };

  const getReserves = () => {
    return (+formatVal(props.totalSupply, props.decimals) - +formatVal(props.totalBorrow, props.decimals)).toFixed(2);
  };

  const countAccountHealth = (currentBorrow: any) => {
    let currentBorrowAmount = currentBorrow;
    const tokens = tokenStore.poolDataTokens;
    let borrowCapacity = 0;
    let borrowCapacityUsed = 0;

    if (!isNative) currentBorrowAmount /= +props.rate?.toFormat(4);

    tokens.forEach((item: IToken) => {
      const tokenData: TTokenStatistics = tokenStore.poolDataTokensWithStats[item.assetId];
      if (+tokenData.selfSupply > 0) {
        borrowCapacity +=
          (+tokenData.selfSupply / 10 ** tokenData.decimals) * +tokenData.currentPrice * (+tokenData.setupLtv / 100);
      }

      if (+tokenData.selfBorrow > 0) {
        let localCapacityused = (+tokenData.selfBorrow / 10 ** tokenData.decimals) * +tokenData.currentPrice;

        if (tokenData.assetId === props.assetId)
          localCapacityused =
            ((+currentBorrowAmount + +tokenData.selfBorrow) / 10 ** tokenData.decimals) * +tokenData.currentPrice;

        borrowCapacityUsed += localCapacityused;
      }
    });

    // case when user did'nt borrow anything
    if (borrowCapacityUsed === 0) borrowCapacityUsed = (+currentBorrowAmount / 10 ** props.decimals) * +props.rate;

    const accountHealth: number = (1 - borrowCapacityUsed / borrowCapacity) * 100;
    setAccountHealth(accountHealth);
  };

  // counting maximum amount for MAX btn
  const userMaximumToBorrowBN = (userColatteral: number, rate: BN) => {
    let maximum = 0;
    let isError = false;

    // if !isNative, show maximum in dollars, collateral in dollars by default
    maximum = userColatteral / 10 ** 6;

    // if isNative, show maximum in crypto AMOUNT
    if (isNative) maximum = userColatteral / 10 ** 6 / +rate.toFormat(4);

    const totalReserves = +formatVal(props.totalSupply, props.decimals) - +formatVal(props.totalBorrow, props.decimals);

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (totalReserves < maximum) {
      setError('Not enough Reserves in Pool');
      isError = true;
      return BN.formatUnits(totalReserves * 10 ** props.decimals * 0.8, 0);
    }

    if (!isError) setError('');
    const val = BN.formatUnits(Math.ceil(maximum * 10 ** props.decimals * 0.8), 0);
    countAccountHealth(val);
    // current recommended maximum borrow, no more than 80% of
    return val;
  };

  // counting maximum after USER INPUT
  const userMaximumToBorrow = (userColatteral: number, rate: BN) => {
    let maximum = userColatteral / 10 ** 6;

    // if isNative, show maximum in crypto AMOUNT
    // else in dollars
    if (isNative) maximum = userColatteral / 10 ** 6 / +rate.toFormat(4);

    const totalReserves = +formatVal(props.totalSupply, props.decimals) - +formatVal(props.totalBorrow, props.decimals);

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (totalReserves < maximum) {
      return (+totalReserves - +formatVal(amount, props.decimals)).toFixed(2);
    }

    return (maximum - +formatVal(amount, props.decimals)).toFixed(4);
  };

  const submitForm = () => {
    let amountVal = props.amount;

    if (!isNative) amountVal = BN.parseUnits(Math.ceil(+amountVal / +props.rate?.toFormat(4)), 0);

    props.onSubmit!(amountVal, props.assetId, lendStore.activePoolContract);
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
    let maxCollateral = props.userColatteral / 10 ** 6;
    // reserves in crypto amount by default
    let totalReserves = +formatVal(props.totalSupply, props.decimals) - +formatVal(props.totalBorrow, props.decimals);
    let isError = false;

    // if isNative, show maximum in crypto AMOUNT
    if (isNative) maxCollateral = props.userColatteral / 10 ** 6 / +props.rate?.toFormat(4);
    if (!isNative) totalReserves *= +props.rate?.toFormat(4);

    if (+formattedVal > +maxCollateral) {
      setError('Supply amount too low, please provide more');
      isError = true;
    }
    if (+formattedVal > +totalReserves) {
      setError('Not enough Reserves in Pool');
      isError = true;
    }

    if (!isError) setError('');
    countAccountHealth(v);
    setAmount(v);
    debounce(v);
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
                props.onMaxClick && props.onMaxClick(userMaximumToBorrowBN(props.userColatteral, props.rate));
              }}
              style={{ cursor: 'pointer' }}>
              {props.userColatteral && props.rate ? userMaximumToBorrow(props.userColatteral, props.rate) : 0}
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
              props.onMaxClick && props.onMaxClick(userMaximumToBorrowBN(props.userColatteral, props.rate));
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
          {props.assetName} liquidity
        </Text>
        <Text size="medium" fitContent>
          {props.totalSupply && props.totalBorrow && getReserves()} {props.assetSymbol}
        </Text>
      </Row>
      <SizedBox height={14} />
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
      <Row alignItems="center" justifyContent="space-between">
        <Text size="medium" type="secondary" nowrap>
          Account Health
        </Text>
        <Row alignItems="center" justifyContent="flex-end">
          <Text size="medium" type="success" fitContent>
            {props.userHealth - getDynamicAccountHealth > 1 ? `${props.userHealth.toFixed(2)}%` : null}
          </Text>
          {props.userHealth - getDynamicAccountHealth > 1 ? (
            <Back
              style={{
                minWidth: '16px',
                maxWidth: '16px',
                height: '18px',
                transform: 'rotate(180deg)',
              }}
            />
          ) : null}
          <Text type={props.userHealth - getDynamicAccountHealth > 1 ? 'error' : 'success'} size="medium" fitContent>
            <>&nbsp;</>
            {getDynamicAccountHealth && amount ? getDynamicAccountHealth.toFixed(2) : 0}%
          </Text>
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
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Checkbox
          label="You will be liquidated if you can not cover your borrow"
          checked={props.isAgree}
          onChange={(e) => props.onChange(e)}
        />
      </Row>
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
            <Button
              disabled={!props.isAgree || +amount === 0 || error !== ''}
              fixed
              kind={error !== '' ? 'error' : 'primary'}
              onClick={() => submitForm()}
              size="large">
              {error !== '' ? error : 'Borrow'}
            </Button>
          )
        )}
      </Footer>
    </Root>
  );
};
export default observer(BorrowAssets);
