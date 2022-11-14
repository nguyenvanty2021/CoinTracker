import { Grid, Select } from "@material-ui/core";
import styled from "styled-components";
const MarketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
`;

const Title = styled.h2`
  color: ${(p) => p.theme.colors.primary};
`;
const GridComp = styled(Grid)`
  margin-top: 1.25rem;
`;
const CurrencyChange = styled.div`
  display: flex;
  flex-direction: column;
`;
const SelectComp = styled(Select)`
  width: 10rem;
`;
export const SC = {
  MarketHeader,
  CurrencyChange,
  GridComp,
  Title,
  SelectComp,
};
