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
import { Text } from '@src/UIKit/Text';
import { Button } from '@src/UIKit/Button';
import { MaxButton } from '@src/UIKit/MaxButton';
import { BigNumberInput } from '@src/UIKit/BigNumberInput';
import { Checkbox } from '@src/UIKit/Checkbox';
import { AmountInput } from '@src/UIKit/AmountInput';
import { Column, Row } from '@src/common/styles/Flex';
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
  isAgree: boolean;
  assetName?: string;
  assetSymbol?: string;
  userBalance: BN;
  supplyInterest: string;
  setupSupplyAPY?: string;
  rate: BN;
  selfBorrow: BN;
  selfSupply: BN;
  onChange: (agreement: boolean) => void;
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

const SupplyAssets: React.FC<IProps> = (props) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [isNative, setConvertToNative] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [amount, setAmount] = useState<BN>(props.amount);
  const { lendStore, accountStore } = useStores();

  const formatVal = (valArg: BN, decimal: number) => {
    return (+valArg / 10 ** decimal).toFixed(2);
  };

  const setInputAmountMeasure = (isNativeToken: boolean) => {
    console.log(isNativeToken, 'setInputAmountMeasure');
    setConvertToNative(isNativeToken);
  };

  const getDailyIncome = () => {
    return (+props.supplyInterest * +formatVal(amount, props.decimals)).toFixed(6);
  };

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
    console.log(+v, 'handleChangeAmount');
    const formattedVal = formatVal(v, props.decimals);
    let walletBal = formatVal(props.userBalance, props.decimals);
    let isError = false;

    if (!isNative) walletBal = (+walletBal * +props.rate?.toFormat(4)).toString();

    if (+formattedVal > +walletBal) {
      setError('Wallet Balance too low');
      isError = true;
    }

    if (!isError) setError('');
    setAmount(v);
    debounce(v);
  };

  const getUserBalance = () => {
    console.log(+amount, 'amount1');
    if (!isNative)
      return (
        +formatVal(props.userBalance, props.decimals) * +props.rate?.toFormat(4) -
        +formatVal(amount, props.decimals)
      ).toFixed(4);

    return props.userBalance
      ? (+formatVal(props.userBalance, props.decimals) - +formatVal(amount, props.decimals)).toFixed(2)
      : 0;
  };

  const getMaxSupply = (val: BN) => {
    if (!isNative) return BN.formatUnits(+val * +props.rate?.toFormat(4), 0);

    return val;
  };

  const submitForm = () => {
    let amountVal = props.amount;

    if (!isNative) amountVal = BN.parseUnits(Math.ceil(+amountVal / +props.rate?.toFormat(4)), 0);

    props.onSubmit!(amountVal, props.assetId, lendStore.activePoolContract);
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
          <Row alignItems="center">
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
            <Text size="medium" fitContent>
              {getUserBalance()}
              <>&nbsp;</>
              {isNative ? props.assetSymbol : '$'}
            </Text>
          </Row>
          <Text size="medium" type="secondary" nowrap>
            Wallet Balance
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
              props.onMaxClick && props.onMaxClick(getMaxSupply(props.userBalance));
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
              {props.rate && amount && +formatVal(amount.div(props.rate?.toFormat(4)), props.decimals)}
            </Text>
            <Swap />
          </TokenToDollar>
        )}
      </InputContainer>
      {/* itemData.self_daily_income = supplyInterest * (itemData.self_supply / 10 ** itemData.precision); */}
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type={+getDailyIncome() > 0 ? 'success' : 'secondary'} fitContent>
          Daily Income
        </Text>
        <Text size="medium" type={+getDailyIncome() > 0 ? 'success' : 'primary'} fitContent>
          $ {props.supplyInterest ? getDailyIncome() : 0}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Supply APY
        </Text>
        <Text size="medium" fitContent>
          {props.setupSupplyAPY ? (+props.setupSupplyAPY).toFixed(2) : 0}%
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
          Transaction fee
        </Text>
        <Text size="medium" fitContent>
          0.005 WAVES
        </Text>
      </Row>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Checkbox
          label="You will not be able to withdraw your funds if they are all borrowed"
          checked={props.isAgree}
          onChange={(e) => props.onChange(e)}
        />
      </Row>
      <SizedBox height={24} />
      <Footer>
        {accountStore && accountStore.address ? (
          <Button
            disabled={!props.isAgree || +amount === 0 || error !== ''}
            fixed
            kind={error !== '' ? 'error' : 'primary'}
            onClick={() => submitForm()}
            size="large">
            {error !== '' ? error : 'Supply'}
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
export default observer(SupplyAssets);
