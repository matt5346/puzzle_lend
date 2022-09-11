import styled from '@emotion/styled';

const MobileCardsWrap = styled.div<{
  isColumn?: boolean;
}>`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .token-card {
    padding: 16px;
    margin-bottom: 24px;
    width: 100%;

    @media (min-width: 560px) {
      width: ${({ isColumn }) => (isColumn ? '100%' : '49%')};
    }
  }
`;

export default MobileCardsWrap;
