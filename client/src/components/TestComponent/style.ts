import styled from "styled-components";

export const Bar = styled.header`
  display: flex; align-items: center; justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
`;
