/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { Text } from '@src/UIKit/Text';
import { Pagination } from '@src/UIKit/Pagination';
import UsersTable from '@src/pages/usersList/UsersTable';

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
  const [perPageCounter, setPerPage] = useState<number>(10);
  const [pageCounter, setPage] = useState<number>(1);
  const [getFilteredUsers, setFilteredUsers] = useState<any>([]);

  const onPerPageChange = (perPage: any) => {
    console.log(perPage, 'CHANGE');
    setPerPage(perPage);
  };
  const onPageChange = (page: any) => {
    console.log(page, 'CHANGE2');
    setPage(page);
  };

  useEffect(() => {
    const to = pageCounter * perPageCounter;
    const from = to - perPageCounter;
    const users = filteredTokens.slice().splice(from, to);
    setFilteredUsers(users);
  }, [perPageCounter, pageCounter, filteredTokens]);

  return (
    <Root>
      <Wrap>
        {getFilteredUsers && getFilteredUsers.length ? (
          <>
            <UsersTable filteredTokens={getFilteredUsers} />
            <Pagination
              page={pageCounter}
              perPage={perPageCounter}
              total={filteredTokens.length}
              changePage={onPageChange}
              changePerPage={onPerPageChange}
            />
          </>
        ) : (
          <Text weight={500} type="secondary">
            No Users
          </Text>
        )}
      </Wrap>
    </Root>
  );
};

export default observer(DashboardTable);
