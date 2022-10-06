import styled from '@emotion/styled';
import { Anchor } from '@src/UIKit/Anchor';

const LinkItem = styled(Anchor)<{ selected?: boolean; isRouterLink?: boolean; inverse?: boolean }>`
  display: inline-block;
  text-decoration: none;
  color: ${({ inverse }) => (inverse ? '#fff' : '#7075e9')};

  &:hover {
    text-decoration: ${({ isRouterLink }) => (isRouterLink ? 'unset' : 'underline')};
    color: ${({ inverse }) => (inverse ? '#fff' : '#8082c5')};
  }
`;
export default LinkItem;
