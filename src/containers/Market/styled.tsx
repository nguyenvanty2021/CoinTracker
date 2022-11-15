import { Grid, Select } from "@material-ui/core";
import styled from "styled-components";
const MarketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
`;
const ImageComp = styled.img`
  width: 25px;
  float: right;
  cursor: pointer;
  height: 25px;
  position: relative;
  z-index: 10000;
  object-fit: contain;
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
  ImageComp,
  CurrencyChange,
  GridComp,
  Title,
  SelectComp,
};
