/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import React, { useCallback, useEffect, useState } from 'react';
import { MaxButton } from '@src/UIKit/MaxButton';
import { Text } from '@src/UIKit/Text';
import { BigNumberInput } from '@src/UIKit/BigNumberInput';
import { AmountInput } from '@src/UIKit/AmountInput';
import Balance from '@src/common/entities/Balance';
import BN from '@src/common/utils/BN';
import _ from 'lodash';
import TokenSelect from '@components/TokenInput/TokenSelect';
import { observer } from 'mobx-react-lite';
// import TokenSelectModal from "../TokensSelectModal";
interface IProps {
  balances: Balance[];

  assetId: string;
  setAssetId?: (assetId: string) => void;

  decimals: number;

  amount: BN;
  setAmount?: (amount: BN) => void;

  onMaxClick?: () => void;
  usdnEquivalent?: string;

  selectable?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;

  & > :first-of-type {
    margin-bottom: 8px;
  }

  @media (min-width: 560px) {
    flex-direction: row;
    & > :first-of-type {
      margin-bottom: 0;
      margin-right: 8px;
    }
  }
`;

const InputContainer = styled.div<{
  focused?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
}>`
  background: ${({ focused }) => (focused ? '#fffff' : '#f1f2fe')};
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

  border: 1px solid ${({ focused, readOnly }) => (focused && !readOnly ? '#7075E9' : '#f1f2fe')};

  :hover {
    border-color: ${({ readOnly, focused }) => (!readOnly && !focused ? '#C6C9F4' : focused ?? '#7075E9')};
  }
`;
const TokenInput: React.FC<IProps> = (props) => {
  const [focused, setFocused] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const selectedAssetBalance = props.balances?.find(({ assetId }) => assetId === props.assetId);
  const [amount, setAmount] = useState<BN>(props.amount);

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const handleChangeAmount = (v: BN) => {
    setAmount(v);
    debounce(v);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    _.debounce((value: BN) => {
      props.setAmount && props.setAmount(value);
    }, 500),
    []
  );

  return (
    <Root>
      <TokenSelect
        token={props.balances.find(({ assetId }) => assetId === props.assetId)}
        onClick={() => setOpenModal(!openModal)}
        balance={selectedAssetBalance?.formatBalance}
        selectable={props.selectable}
      />
      <InputContainer focused={focused} readOnly={!props.setAmount}>
        {props.onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              props.onMaxClick && props.onMaxClick();
            }}
          />
        )}
        <BigNumberInput
          renderInput={(props, ref) => (
            <AmountInput
              {...props}
              onFocus={(e) => {
                props.onFocus && props.onFocus(e);
                !props.readOnly && setFocused(true);
              }}
              onBlur={(e) => {
                props.onBlur && props.onBlur(e);
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
        <Text style={{ whiteSpace: 'nowrap' }} type="secondary" size="small" fitContent>
          {props.usdnEquivalent}
        </Text>
      </InputContainer>
    </Root>
  );
};
export default observer(TokenInput);
