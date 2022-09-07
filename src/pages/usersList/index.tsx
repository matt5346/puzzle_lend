/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import { LENDS_CONTRACTS, IToken } from '@src/common/constants';
import { Text } from '@src/UIKit/Text';
import { Row, Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import styled from '@emotion/styled';
import DashboardTable from '@src/pages/usersList/DashboardTable';

const Root = styled.div`
  display: flex;
  width: 1010px;
`;

const UsersList: React.FC = () => {
  const { accountStore, tokenStore, lendStore } = useStores();

  const [filteredTokens, setFilteredTokens] = useState<any>([]);
  const [showBorrow, showBorrowTable] = useState<boolean>(false);
  const [showSupply, showSupplyTable] = useState<boolean>(false);

  useEffect(() => {
    console.log(lendStore.usersStatsByPool, 'usersStatsByPool---');
    setFilteredTokens(lendStore.usersStatsByPool);
  }, [lendStore]);

  return (
    <Root>
      <Column crossAxisSize="max">
        <SizedBox height={54} />
        <Text size="large" weight={500}>
          Users stats
        </Text>
        <SizedBox height={40} />
        <Row justifyContent="space-between">
          <Column crossAxisSize="max">
            {filteredTokens.map((t: any) => {
              if (t) {
                return (
                  <Column crossAxisSize="max">
                    <Text weight={500} size="big">
                      Pool: {lendStore.poolNameById(t.contractId)}
                    </Text>
                    <SizedBox height={24} />
                    <DashboardTable
                      filteredTokens={t.tokens}
                      showSupply={showSupply}
                      showBorrow={showBorrow}
                      showAll
                      isUserStats={false}
                    />
                    <SizedBox height={40} />
                  </Column>
                );
              }

              return null;
            })}
          </Column>
        </Row>
      </Column>
    </Root>
  );
};

export default observer(UsersList);
