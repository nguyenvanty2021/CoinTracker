import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Grid, Snackbar } from "@material-ui/core";
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
interface ListProps<T> {
  id: number;
  key: T;
  value: T;
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
  return (
    <SC.ImageComp
      onClick={() => {
        updateUrlGallery("watched", statusHeart === "true" ? "false" : "true");
        setStatusHeart(statusHeart === "true" ? "false" : "true");
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
  } = useContext(MarketContext);
  const [queryParams] = useQueryParams({
    id: StringParam,
    name: StringParam,
  });
  const [rows, setRows] = useState<
    {
      date: string;
      price: number;
    }[]
  >([]);
  const queryParam = getQueryParam<any>();
  const [displayType, setDisplayType] = useState<string>(
    queryParam["displayType"]
  );
  const [currencyChange, setCurrencyChange] = useState<string>(
    queryParam["currency"]
  );
  const [timeFilter, setTimeFilter] = useState<string>(queryParam["time"]);
  const [isErrorMessage, setIsErrorMessage] = useState<string>("");
  const [boxWidth, setBoxWidth] = useState<number>(0);
  const { height } = useWindowDimensions();
  const [statusHeart, setStatusHeart] = useState<string>("false");
  const local: any = localStorage?.getItem("listWatched");
  const listWatched: {
    id: string;
    watched: boolean;
  }[] = local && JSON.parse(local);
  const [{ data, loading, error }, fetch] = useAxios(
    {
      url: `https://api.coingecko.com/api/v3/coins/${queryParams?.id}/market_chart?vs_currency=${currencyChange}&days=${timeFilter}`,
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
  useEffect(() => {
    if (queryParams.id && queryParams.name) {
      fetch();
    }
  }, [fetch, queryParams, queryParams.id, queryParams.name]);
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
          },
        ])
      );
    }
    setStatusHeart(queryParam["watched"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Grid container justify="center">
        <Grid ref={gridItemRef} item xs={12} md={10} lg={8}>
          <SC.MarketHeader>
            <SC.Title>
              <InputLabel id="demo-simple-select-label">
                Select display type
              </InputLabel>
              <SC.SelectComp
                labelId="demo-simple-select-label"
                id="demo-simple-select-outlined"
                value={displayType}
                onChange={(e: any) => {
                  const { value } = e.target;
                  setDisplayType(value);
                  updateUrlGallery("displayType", value);
                }}
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
                onChange={(e: any) => {
                  const { value } = e.target;
                  setCurrencyChange(value);
                  updateUrlGallery("currency", value);
                }}
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
                onChange={(v) => {
                  setTimeFilter(v || "");
                  updateUrlGallery("time", v || "");
                }}
              />
            </SC.MarketHeader>
            <HeartComponent
              setStatusHeart={setStatusHeart}
              statusHeart={statusHeart}
              listWatched={listWatched}
            />
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
              <SC.Title>{`${
                queryParams?.name
              }/${currencyChange.toUpperCase()}`}</SC.Title>
              <TimeFilterButtons
                value={timeFilter}
                onChange={(v) => {
                  setTimeFilter(v || "");
                  updateUrlGallery("time", v || "");
                }}
              />
            </SC.MarketHeader>
            <HeartComponent
              setStatusHeart={setStatusHeart}
              statusHeart={statusHeart}
              listWatched={listWatched}
            />
            <TableContainer
              style={{ height: "70vh", marginTop: "2.5rem" }}
              component={Paper}
            >
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
