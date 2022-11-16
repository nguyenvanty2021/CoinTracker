import { Grid, Select } from "@material-ui/core";
import styled from "styled-components";
const MarketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
`;
const BorderChart = styled.div`
  position: relative;
`;
const ImageComp = styled.img`
  width: 25px;
  float: right;
  cursor: pointer;
  height: 25px;
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  margin: 15px 15px 0 0;
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
  BorderChart,
  GridComp,
  Title,
  SelectComp,
};
