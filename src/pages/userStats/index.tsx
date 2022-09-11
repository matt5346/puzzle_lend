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
import UsersTable from '@src/pages/userStats/UsersTable';

const Root = styled.div`
  display: flex;
  width: 1010px;
`;

const UserStats: React.FC = () => {
  const { accountStore, usersStore, lendStore } = useStores();
  const { userId } = useParams<{ userId: string }>();

  const [isReady, setReady] = useState<boolean>(false);

  useEffect(() => {
    async function fetchMyAPI() {
      const response = await Promise.all(
        Object.values(LENDS_CONTRACTS).map((item) => usersStore.syncTokenStatistics(item, userId!))
      );
      console.log(usersStore, response, '---usersStore');
      setReady(true);
    }

    fetchMyAPI();
  }, [lendStore.activePoolContract, userId, usersStore]);

  return (
    <Root>
      <Column crossAxisSize="max">
        <SizedBox height={54} />
        <Text size="big" weight={500}>
          User: {userId || ''}
        </Text>
        <SizedBox height={54} />
        {isReady &&
          Object.values(LENDS_CONTRACTS).map((pool: any) => {
            return <UsersTable key={pool} poolId={pool} />;
          })}
      </Column>
    </Root>
  );
};

export default observer(UserStats);
