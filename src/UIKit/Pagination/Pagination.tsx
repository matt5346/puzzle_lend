/* eslint-disable react/require-default-props */
/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { Text } from '@src/UIKit/Text';
import { Select } from '@src/UIKit/Select';
import { Row } from '@src/common/styles/Flex';

interface IOption {
  key: string;
  title: string;
}
interface IProps {
  page: number;
  perPage: number;
  total: number;
  perPageOptions?: IOption[];
  changePage: (page: number) => void;
  changePerPage: (page: number) => void;
}

const LeftPagination = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;
  padding-right: 4px;
`;

const PaginationItem = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  padding: 4px;
  background-color: white;
  font-size: 12px;
  color: #8082c5;
  cursor: pointer;
  min-width: 32px;
  border-radius: 10px;
  text-align: center;
  margin-right: 4px;
  opacity: 0.9;
  transition: background-color 0.25s;

  &.active {
    font-weight: 500;
    color: #363870;
    background-color: #fff;
    cursor: default;
    pointer-events: none;
    opacity: 1;
  }

  &.disabled {
    pointer-events: none;
  }

  &:hover {
    background-color: #ededed;
    color: #363870;
    opacity: 1;

    &.active {
      background-color: #fff;
      color: #363870;
      opacity: 1;
    }
  }

  &.next,
  &.prev {
    position: relative;

    &:before {
      position: absolute;
      background-color: #000;
      content: '';
    }

    &:hover::before {
      background-color: $primary-color;
    }

    &.disabled::before {
      background-color: #aaa;
    }
  }

  &.next,
  &.prev {
    &:before {
      width: 6px;
      height: 10px;
      -webkit-mask: $icon-arrow;
      mask: $icon-arrow;
    }
  }

  &.prev {
    &:before {
      transform: rotate(180deg);
    }
  }
`;

const PaginationCenter = styled.div`
  line-height: 16px;
  // margin: 0 auto;
  font-size: 12px;
  font-weight: 500;
`;

const PaginationRight = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  padding-left: 4px;

  span {
    line-height: 16px;
    font-size: 12px;
    font-weight: 500;
    margin-right: 10px;
  }
`;

const categoriesOptions = [
  { title: '10', key: '10' },
  { title: '25', key: '25' },
  { title: '50', key: '50' },
  { title: '100', key: '100' },
];

const Pagination: React.FC<IProps> = ({
  page,
  perPage,
  total,
  changePage,
  changePerPage,
  perPageOptions = categoriesOptions,
}) => {
  const [pageItems, setPaginationsItems] = useState<any>([]);
  const [shownFromState, setShownFrom] = useState<number>(0);
  const [shownToState, setShownTo] = useState<number>(0);
  const [getSelectValue, setSelectValue] = useState<number>(0);
  const pagesCount = Math.ceil(total / perPage);

  const paginationItems = useCallback(() => {
    const current = page;
    const totalPagination = pagesCount;
    const delta = 4;
    const limit = 9;
    let left = current - delta;
    let right = current + delta + 1;

    // if pages from 1 to 5
    if (totalPagination > limit && limit - current >= 4) {
      right = limit + 1;
      left = limit - current - delta - 3;
    }

    // if choosen pages from total-4 to total
    if (totalPagination > limit && totalPagination - current <= 4) {
      right = current + (totalPagination - current) + 1;
      left = current - limit + (totalPagination - current) + 1;
    }

    // if total < limit
    let result: any = Array.from(
      {
        length: totalPagination,
      },
      (v, index) => index + 1
    );

    // otherwise use delta
    if (totalPagination > limit) {
      result = Array.from(
        {
          length: totalPagination,
        },
        (v, index) => index + 1
      ).filter((_) => {
        return _ && _ >= left && _ < right;
      });
    }

    // Если доступно более одной страницы
    if (result.length > 1) {
      if (result[0] > 1) {
        if (result[1] > 2) {
          result[1] = '...';
        }
        result[0] = 1;
      }

      if (result[result.length - 1] < totalPagination) {
        if (result[result.length - 2] !== totalPagination - 1) {
          result[result.length - 2] = '...';
        }
        result[result.length - 1] = totalPagination;
      }
    }

    return result;
  }, [page, pagesCount]);

  const itemsShownFrom = useCallback(() => {
    if (!total) setShownFrom(0);

    setShownFrom((page - 1) * perPage + 1);
  }, [page, perPage, total]);

  console.log(perPageOptions, 'perPAGE');

  const itemsShownTo = useCallback(() => {
    if (total < perPage) setShownTo(total);
    if (total < page * perPage) setShownTo(total);

    return setShownTo(page * perPage);
  }, [page, perPage, total]);

  useEffect(() => {
    const val = paginationItems();
    itemsShownFrom();
    itemsShownTo();
    console.log(val, 'perPAGE2');

    const selectVal = perPageOptions.findIndex((o) => o.key === perPage.toString());

    setSelectValue(selectVal);
    setPaginationsItems(val);
  }, [page, perPage, perPageOptions, paginationItems, itemsShownFrom, itemsShownTo]);

  return (
    <Row
      alignItems="center"
      style={{
        margin: '24px 0 0 0',
      }}>
      <LeftPagination>
        {pageItems &&
          pageItems.length &&
          pageItems.map((pageItem: number, index: number) => {
            return (
              <PaginationItem
                className={pageItem === page ? 'active' : ''}
                key={index}
                onClick={() => changePage(pageItem)}>
                <Text>{pageItem}</Text>
              </PaginationItem>
            );
          })}
      </LeftPagination>

      <PaginationCenter>
        {shownFromState}-{shownToState} из {total}
      </PaginationCenter>

      <PaginationRight>
        <span>Показывать по: </span>
        <Select
          options={perPageOptions}
          selected={perPageOptions[getSelectValue]}
          onSelect={({ key }) => {
            const index = perPageOptions.findIndex((o) => o.key === key);
            changePerPage(+perPageOptions[index].key);
          }}
        />
      </PaginationRight>
    </Row>
  );
};

export default Pagination;
