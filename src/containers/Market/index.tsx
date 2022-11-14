import React, { useEffect } from "react";
import { Grid, Snackbar, SnackbarCloseReason } from "@material-ui/core";
import { Skeleton, Alert } from "@material-ui/lab";
import useAxios from "axios-hooks";
import PrimaryChart from "components/PrimaryChart";
import SecondaryChart from "components/SecondaryChart";
import TimeFilterButtons from "components/TimeFilterButtons";
import { SC } from "./styled";
import { DataProps } from "interfaces/DataProps";
import useWindowDimensions from "hooks/useWindowDimensions";
import { useQueryParams, StringParam } from "use-query-params";
import { MarketContext } from "store/MarketProvider";
import { MenuItem } from "@material-ui/core";
import { InputLabel } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import { makeStyles } from "@material-ui/core/styles";
import { format } from "date-fns";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
interface ListProps<T> {
  id: number;
  key: T;
  value: T;
}
const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});
function createData(date: string, price: number) {
  return { date, price };
}
const Market = () => {
  const listDisplayType: ListProps<string>[] = [
    {
      id: 1,
      key: "Chart",
      value: "chart",
    },
    {
      id: 2,
      key: "List",
      value: "list",
    },
  ];
  const listCurrencyChange: ListProps<string>[] = [
    {
      id: 1,
      key: "USD",
      value: "usd",
    },
    {
      id: 2,
      key: "CHF",
      value: "chf",
    },
    {
      id: 3,
      key: "AUD",
      value: "aud",
    },
    {
      id: 4,
      key: "BRL",
      value: "brl",
    },
    {
      id: 5,
      key: "CAD",
      value: "cad",
    },
  ];
  const classes = useStyles();
  const {
    filteredDataState: { filteredData },
  } = React.useContext(MarketContext);
  const [queryParams] = useQueryParams({
    id: StringParam,
    name: StringParam,
  });
  const [rows, setRows] = React.useState<
    {
      date: string;
      price: number;
    }[]
  >([]);
  const [displayType, setDisplayType] = React.useState<string>("chart");
  const [currencyChange, setCurrencyChange] = React.useState<string>("usd");
  const [timeFilter, setTimeFilter] = React.useState<string>("1");
  const [isErrorMessage, setIsErrorMessage] = React.useState<string>("");
  const [boxWidth, setBoxWidth] = React.useState<number>(0);
  const { height } = useWindowDimensions();
  const [{ data, loading, error }, fetch] = useAxios(
    {
      url: `https://api.coingecko.com/api/v3/coins/${queryParams?.id}/market_chart?vs_currency=${currencyChange}&days=${timeFilter}`,
      method: "GET",
    },
    { manual: true }
  );

  const gridItemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (queryParams.id && queryParams.name) {
      fetch();
    }
  }, [fetch, queryParams, queryParams.id, queryParams.name]);

  React.useEffect(() => {
    if (error) {
      setIsErrorMessage(error.message);
    }
  }, [error]);

  React.useEffect(() => {
    const handleResize = (width?: number) => {
      setBoxWidth(width || 0);
    };

    handleResize(gridItemRef.current?.clientWidth || 0);

    window.addEventListener("resize", () =>
      handleResize(gridItemRef?.current?.clientWidth || 0)
    );

    return () => {
      window.removeEventListener("resize", () => handleResize());
    };
  }, [gridItemRef]);

  const mappedData: DataProps[] = React.useMemo(() => {
    return data
      ? data?.prices.map((ele: any) => ({
          date: new Date(ele[0]),
          price: ele[1],
        }))
      : [];
  }, [data]);
  const mappedDataList: DataProps[] = React.useMemo(() => {
    return data
      ? data?.prices.map((ele: any) =>
          createData(format(new Date(new Date(ele[0])), "dd/MM/yyyy"), ele[1])
        )
      : [];
  }, [data]);
  const handleError = (
    e: React.SyntheticEvent<any>,
    reason?: SnackbarCloseReason
  ) => {
    setIsErrorMessage("");
  };

  useEffect(() => {
    const listTemp = [...rows];
    filteredData.forEach((values) => {
      listTemp.push(
        createData(format(new Date(values.date), "dd/MM/yyyy"), values.price)
      );
    });
    setRows([...listTemp]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData]);

  return (
    <>
      <Grid container justify="center">
        <Grid ref={gridItemRef} item xs={12} md={10} lg={8}>
          <SC.MarketHeader>
            <SC.Title>
              {" "}
              <InputLabel id="demo-simple-select-label">
                Select display type
              </InputLabel>
              <SC.SelectComp
                labelId="demo-simple-select-label"
                id="demo-simple-select-outlined"
                value={displayType}
                onChange={(e: any) => setDisplayType(e.target.value)}
              >
                {listDisplayType?.length > 0 &&
                  listDisplayType.map((values) => {
                    return (
                      <MenuItem value={values.value} key={values.id}>
                        {values.key}
                      </MenuItem>
                    );
                  })}
              </SC.SelectComp>
            </SC.Title>
            <SC.CurrencyChange>
              <InputLabel id="demo-simple-select-label">
                Currency you want to change to
              </InputLabel>
              <SC.SelectComp
                labelId="demo-simple-select-label"
                id="demo-simple-select-outlined"
                value={currencyChange}
                onChange={(e: any) => setCurrencyChange(e.target.value)}
              >
                {listCurrencyChange?.length > 0 &&
                  listCurrencyChange.map((values) => {
                    return (
                      <MenuItem value={values.value} key={values.id}>
                        {values.key}
                      </MenuItem>
                    );
                  })}
              </SC.SelectComp>
            </SC.CurrencyChange>
          </SC.MarketHeader>
        </Grid>
        {displayType === "chart" ? (
          <Grid ref={gridItemRef} item xs={12} md={10} lg={8}>
            <SC.MarketHeader>
              <SC.Title>{`${
                queryParams?.name
              }/${currencyChange.toUpperCase()}`}</SC.Title>
              <TimeFilterButtons
                value={timeFilter}
                onChange={(v) => setTimeFilter(v || "")}
              />
            </SC.MarketHeader>
            {loading ? (
              <Skeleton
                variant="rect"
                height={Math.floor(height * 0.6)}
                width={boxWidth}
              />
            ) : mappedData?.length ? (
              <>
                <PrimaryChart
                  data={filteredData ?? []}
                  height={Math.floor(height * 0.4)}
                  width={boxWidth}
                  margin={{
                    top: 16,
                    right: 16,
                    bottom: 40,
                    left: 48,
                  }}
                />
                <SecondaryChart
                  data={mappedData ?? []}
                  height={Math.floor(height * 0.1)}
                  width={boxWidth}
                  margin={{
                    top: 0,
                    right: 16,
                    bottom: 24,
                    left: 48,
                  }}
                />
              </>
            ) : null}
          </Grid>
        ) : (
          <SC.GridComp ref={gridItemRef} item xs={12} md={10} lg={8}>
            <SC.MarketHeader>
              <SC.Title>{queryParams?.name}</SC.Title>
              <TimeFilterButtons
                value={timeFilter}
                onChange={(v) => setTimeFilter(v || "")}
              />
            </SC.MarketHeader>
            {mappedDataList?.length > 0 && rows?.length > 0 && (
              <TableContainer style={{ height: "70vh" }} component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">Date</TableCell>
                      <TableCell align="left">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappedDataList?.length > 0
                      ? mappedDataList.map((row) => (
                          <TableRow key={row.date}>
                            <TableCell align="left">{row.date}</TableCell>
                            <TableCell align="left">{row.price}</TableCell>
                          </TableRow>
                        ))
                      : rows.map((row) => (
                          <TableRow key={row.date}>
                            <TableCell align="left">{row.date}</TableCell>
                            <TableCell align="left">{row.price}</TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SC.GridComp>
        )}

        <Snackbar open={!!isErrorMessage} onClose={handleError}>
          <Alert onClose={handleError} severity="error">
            {isErrorMessage}
          </Alert>
        </Snackbar>
      </Grid>
    </>
  );
};

export default Market;
