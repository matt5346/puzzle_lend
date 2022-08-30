import styled from '@emotion/styled';

const GridTable = styled.div<{
  desktopTemplate?: string;
  mobileTemplate?: string;
}>`
  & .gridTitle {
    display: grid;
    column-gap: 8px;
    grid-template-columns: ${({ mobileTemplate }) => mobileTemplate ?? '6fr 2fr 1fr'};
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    color: #8082c5;
    padding: 14px 16px;
    box-sizing: border-box;
    border-bottom: 1px solid #f1f2fe;
    margin-bottom: 8px;
    @media (min-width: 880px) {
      grid-template-columns: ${({ desktopTemplate }) => desktopTemplate ?? '6fr 2fr 1fr'};
      padding: 14px 24px;
    }
  }

  & .gridRow {
    position: relative;
    max-width: 100%;
    cursor: pointer;
    display: grid;
    column-gap: 8px;
    grid-template-columns: ${({ mobileTemplate }) => mobileTemplate ?? '6fr 2fr 1fr'};
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    color: #8082c5;
    box-sizing: border-box;
    padding: 16px;
    border-bottom: 1px solid #f1f2fe;
    transition: background 0.1s ease;

    &:after {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 0;
      display: block;
      content: '';
      width: 4px;
      height: 80%;
      background: #7075e9;
      opacity: 0;
    }

    &:hover {
      background: #f8f8ff;

      &:after {
        opacity: 1;
      }
    }

    @media (min-width: 880px) {
      grid-template-columns: ${({ desktopTemplate }) => desktopTemplate ?? '6fr 2fr 1fr'};
      padding: 24px;
    }

    :last-of-type {
      border-bottom: none;
    }
  }
`;

export default GridTable;
