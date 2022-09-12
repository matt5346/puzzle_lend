/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStores } from '@src/stores';
import { observer } from 'mobx-react-lite';
import { LENDS_CONTRACTS, ROUTES } from '@src/common/constants';
import { Text } from '@src/UIKit/Text';
import { Column } from '@src/common/styles/Flex';
import { SizedBox } from '@src/UIKit/SizedBox';
import styled from '@emotion/styled';
import UsersTable from '@src/pages/userStats/UsersTable';
import Container from '@src/common/styles/Container';
import { ReactComponent as ChevronDown } from '@src/common/assets/icons/chevron_down.svg';

const Root = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  .details-link {
    display: flex;
    justify-content: flex-start;
    color: #7075e9;
    text-decoration: unset;

    svg {
      width: 20px;
      margin-right: 10px;
      transform: translateX(0) rotate(90deg);
      transition: transform 0.15s ease;
    }

    &:hover {
      text-decoration: underline;

      svg {
        transform: translateX(5px) rotate(90deg);
      }
    }
  }
`;

const UserStats: React.FC = () => {
  const { usersStore, lendStore } = useStores();
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
      <Container>
        <Column crossAxisSize="max">
          <Link className="details-link" to={ROUTES.USERS_LIST}>
            <ChevronDown />
            <Text weight={500} type="blue500" fitContent>
              Back to Users list
            </Text>
          </Link>
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
      </Container>
    </Root>
  );
};

export default observer(UserStats);
