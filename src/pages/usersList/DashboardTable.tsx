/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import { Text } from '@src/UIKit/Text';
import { TOKENS_BY_ASSET_ID } from '@src/common/constants';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Row, Column } from '@src/common/styles/Flex';
import tokenLogos from '@src/common/constants/tokenLogos';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import AssetsTable from '@src/pages/usersList/AssetsTable';

// for some time
export enum TokenCategoriesEnum {
  all = 0,
  global = 1,
  stable = 2,
  defi = 3,
  ducks = 4,
}
// isUserStats -- case for all users except user whos logged with wallet
interface IProps {
  filteredTokens: any;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const DashboardTable: React.FC<IProps> = ({ filteredTokens }) => {
  return (
    <Root>
      <Wrap>
        {filteredTokens && filteredTokens.length ? (
          <AssetsTable filteredTokens={filteredTokens} />
        ) : (
          <Text weight={500} type="secondary">
            No borrowers
          </Text>
        )}
      </Wrap>
    </Root>
  );
};

export default observer(DashboardTable);
