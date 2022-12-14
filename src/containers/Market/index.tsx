import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Grid, Snackbar } from "@material-ui/core";
import { Skeleton, Alert } from "@material-ui/lab";
import useAxios from "axios-hooks";
import PrimaryChart from "components/PrimaryChart";
import SecondaryChart from "components/SecondaryChart";
import TimeFilterButtons, { TimePeriod } from "components/TimeFilterButtons";
import { SC } from "./styled";
import { DataProps } from "interfaces/DataProps";
import useWindowDimensions from "hooks/useWindowDimensions";
import { useQueryParams, StringParam } from "use-query-params";
import { MarketContext } from "store/MarketProvider";
import { MenuItem } from "@material-ui/core";
import { InputLabel } from "@material-ui/core";
import unlike from "assets/img/unlike.png";
import like from "assets/img/like.png";
import Table from "@material-ui/core/Table";
import { makeStyles } from "@material-ui/core/styles";
import { format } from "date-fns";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { getQueryParam, updateUrlGallery } from "utils/query";
import coinApi from "api/coinApi";
import { Status } from "enums/TimeFilters";
import { Link, useHistory } from "react-router-dom";
import numeral from "numeral";
import { CoinDataProps } from "containers/Coins/interfaces";
interface ListProps<T> {
  id: number;
  key: T;
  value: T;
}
interface FilterProps<T> {
  displayType: T;
  currencyChange: T;
  priceTo: T;
}
interface ListWatchedProps {
  id: string;
  watched: boolean;
}
const HeartComponent = ({
  statusHeart,
  listWatched,
  setStatusHeart,
}: {
  statusHeart: string;
  listWatched: ListWatchedProps[];
  setStatusHeart: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const queryParam = getQueryParam<any>();
  const status = statusHeart === "true" ? "false" : "true";
  return (
    <SC.ImageComp
      onClick={() => {
        updateUrlGallery("watched", status);
        setStatusHeart(status);
        const index = listWatched.findIndex((el) => el.id === queryParam["id"]);
        if (index > -1) {
          listWatched[index].watched = statusHeart === "true" ? false : true;
          localStorage.setItem("listWatched", JSON.stringify(listWatched));
        }
      }}
      src={statusHeart === "true" ? like : unlike}
      alt="Unlike"
    />
  );
};
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
  const classes = useStyles();
  const {
    filteredDataState: { filteredData },
  } = useContext(MarketContext);
  const [queryParams] = useQueryParams({
    id: StringParam,
  });
  const [rows, setRows] = useState<
    {
      date: string;
      price: number;
    }[]
  >([]);
  const history = useHistory();
  const { pathname } = history.location;
  const coinFrom = pathname.split("/")[pathname.split("/").length - 1];
  const queryParam = getQueryParam<any>();
  const [filterCommonSubmit, setFilterCommonSubmit] = useState<
    FilterProps<string>
  >({
    displayType: queryParam["displayType"],
    currencyChange: queryParam["currency"],
    priceTo: queryParam["priceCurrency"],
  });
  const [timeFilter, setTimeFilter] = useState<string>(queryParam["range"]);
  const [isErrorMessage, setIsErrorMessage] = useState<string>("");
  const [boxWidth, setBoxWidth] = useState<number>(0);
  const [listCurrentcy, setListCurrency] = useState<string[]>([]);
  const { height } = useWindowDimensions();
  const [filterCommonSaved, setFilterCommonSaved] = useState<
    FilterProps<string>
  >({
    displayType: queryParam["displayType"],
    currencyChange: queryParam["currency"],
    priceTo: queryParam["priceCurrency"],
  });
  const [statusHeart, setStatusHeart] = useState<string>("false");
  const [listMarkets, setListMarkets] = useState<CoinDataProps[]>([]);
  const local: any = localStorage?.getItem("listWatched");
  const listWatched: {
    id: string;
    watched: boolean;
    price: string;
    coin: string;
    priceTo: string;
  }[] = local && JSON.parse(local);
  const [{ data, loading, error }, fetch] = useAxios(
    {
      url: `https://api.coingecko.com/api/v3/coins/${queryParams?.id}/market_chart?vs_currency=${filterCommonSubmit.currencyChange}&days=${TimePeriod[timeFilter]}`,
      method: "GET",
    },
    { manual: true }
  );
  const gridItemRef = useRef<HTMLDivElement>(null);
  const mappedData: DataProps[] = useMemo(() => {
    return data
      ? data?.prices.map((ele: any) => ({
          date: new Date(ele[0]),
          price: ele[1],
        }))
      : [];
  }, [data]);
  const mappedDataList: DataProps[] = useMemo(() => {
    return data
      ? data?.prices.map((ele: any) =>
          createData(format(new Date(new Date(ele[0])), "dd/MM/yyyy"), ele[1])
        )
      : [];
  }, [data]);
  const handleError = () => setIsErrorMessage("");
  const handleGetAllCurrency = async () => {
    try {
      const [listCurrencyData, listMarketData] = await Promise.all([
        coinApi.getAllMoney(),
        coinApi.getAllMarkets(),
      ]);
      if (
        listCurrencyData.status === Status.SUCCESS &&
        listMarketData.status === Status.SUCCESS
      ) {
        setListCurrency(listCurrencyData?.data);
        setListMarkets(listMarketData?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (queryParams.id && coinFrom) {
      fetch();
    }
  }, [fetch, queryParams, queryParams.id, coinFrom]);
  useEffect(() => {
    if (error) {
      setIsErrorMessage(error.message);
    }
  }, [error]);
  useEffect(() => {
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
  useEffect(() => {
    if (listWatched?.length > 0) {
      const founded = listWatched.every((el) => el.id !== queryParam["id"]);
      if (founded) {
        listWatched.push({
          id: queryParam["id"],
          watched: queryParam["watched"],
          price: queryParam["price"],
          coin: `${coinFrom.toUpperCase()} to ${filterCommonSubmit.currencyChange.toUpperCase()}`,
          priceTo: filterCommonSaved.priceTo,
        });
        localStorage.setItem("listWatched", JSON.stringify(listWatched));
      }
    } else {
      localStorage.setItem(
        "listWatched",
        JSON.stringify([
          {
            id: queryParam["id"],
            watched: queryParam["watched"],
            price: queryParam["price"],
            coin: `${coinFrom.toUpperCase()} to ${filterCommonSubmit.currencyChange.toUpperCase()}`,
            priceTo: filterCommonSaved.priceTo,
          },
        ])
      );
    }
    setStatusHeart(queryParam["watched"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCommonSaved]);
  useEffect(() => {
    handleGetAllCurrency();
  }, []);
  return (
    <>
      <Grid container justify="center">
        <Grid ref={gridItemRef} item xs={12} md={10} lg={8}>
          <Link to="/">Back to Coin List</Link>
          <SC.MarketHeader style={{ justifyContent: "flex-start" }}>
            <SC.FilterComp>
              <SC.Title>
                <InputLabel id="demo-simple-select-label">
                  Select display type
                </InputLabel>
                <SC.SelectComp
                  labelId="demo-simple-select-label"
                  id="demo-simple-select-outlined"
                  value={filterCommonSaved.displayType}
                  onChange={(e: any) =>
                    setFilterCommonSaved({
                      ...filterCommonSaved,
                      displayType: e.target.value,
                    })
                  }
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
                  Select Currency
                </InputLabel>
                <SC.SelectComp
                  labelId="demo-simple-select-label"
                  id="demo-simple-select-outlined"
                  value={filterCommonSaved.currencyChange}
                  onChange={(e: any) => {
                    const obj = listMarkets.find(
                      (values) => values.symbol === queryParam["currency"]
                    );
                    setFilterCommonSaved({
                      ...filterCommonSaved,
                      priceTo: numeral(obj?.current_price).format("0,0.00"),
                      currencyChange: e.target.value,
                    });
                  }}
                >
                  {listCurrentcy?.length > 0 &&
                    listCurrentcy.map((values, index) => {
                      return (
                        <MenuItem
                          disabled={coinFrom === values}
                          value={values}
                          key={index}
                        >
                          {values.toUpperCase()}
                        </MenuItem>
                      );
                    })}
                </SC.SelectComp>
              </SC.CurrencyChange>
            </SC.FilterComp>
            <Button
              onClick={() => {
                const { currencyChange, displayType, priceTo } =
                  filterCommonSaved;
                setFilterCommonSubmit({
                  ...filterCommonSubmit,
                  currencyChange,
                  displayType,
                  priceTo,
                });
                updateUrlGallery("currency", currencyChange);
                updateUrlGallery("displayType", displayType);
                updateUrlGallery("priceCurrency", priceTo);
                const index = listWatched.findIndex(
                  (values) => values.id === queryParam["id"]
                );
                if (index > -1) {
                  listWatched[index].priceTo = priceTo;
                  listWatched[
                    index
                  ].coin = `${coinFrom.toUpperCase()} to ${filterCommonSaved.currencyChange.toUpperCase()}`;
                }
                localStorage.setItem(
                  "listWatched",
                  JSON.stringify(listWatched)
                );
              }}
              variant="contained"
            >
              Apply
            </Button>
          </SC.MarketHeader>
        </Grid>
        {filterCommonSubmit.displayType === "chart" ? (
          <Grid ref={gridItemRef} item xs={12} md={10} lg={8}>
            <SC.MarketHeader>
              <SC.Title>{`${coinFrom.toUpperCase()} to ${filterCommonSubmit.currencyChange.toUpperCase()} Price Chart`}</SC.Title>
              <TimeFilterButtons
                value={timeFilter}
                onChange={(v) => {
                  const index = Object.values(TimePeriod).findIndex(
                    (values) => values === v
                  );
                  if (index > -1) {
                    const listKeys = Object.keys(TimePeriod);
                    setTimeFilter(listKeys[index] || "");
                    updateUrlGallery("range", listKeys[index] || "");
                  }
                }}
              />
            </SC.MarketHeader>

            {loading ? (
              <Skeleton
                variant="rect"
                height={Math.floor(height * 0.6)}
                width={boxWidth}
              />
            ) : mappedData?.length ? (
              <SC.BorderChart>
                <HeartComponent
                  setStatusHeart={setStatusHeart}
                  statusHeart={statusHeart}
                  listWatched={listWatched}
                />
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
              </SC.BorderChart>
            ) : null}
          </Grid>
        ) : (
          <SC.GridComp ref={gridItemRef} item xs={12} md={10} lg={8}>
            <SC.MarketHeader>
              <SC.Title>{`${coinFrom.toUpperCase()} to ${filterCommonSubmit.currencyChange.toUpperCase()} Price Chart`}</SC.Title>
              <TimeFilterButtons
                value={timeFilter}
                onChange={(v) => {
                  const index = Object.values(TimePeriod).findIndex(
                    (values) => values === v
                  );
                  if (index > -1) {
                    const listKeys = Object.keys(TimePeriod);
                    setTimeFilter(listKeys[index] || "");
                    updateUrlGallery("range", listKeys[index] || "");
                  }
                }}
              />
            </SC.MarketHeader>
            <SC.BorderChart>
              <HeartComponent
                setStatusHeart={setStatusHeart}
                statusHeart={statusHeart}
                listWatched={listWatched}
              />
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
            </SC.BorderChart>
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
