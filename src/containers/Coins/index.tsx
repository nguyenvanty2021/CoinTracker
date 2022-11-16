import { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import useAxios from "axios-hooks";
import numeral from "numeral";
import { constantCase } from "change-case";
import CoinChart from "containers/CoinChart";
import { CoinDataProps } from "./interfaces";
import { theme as themeColor } from "styles";
import { SC } from "./styled";
import { Pagination, Skeleton } from "@material-ui/lab";
import { useQueryParams, NumberParam } from "use-query-params";
import SwipeableViews from "react-swipeable-views";
import TableBody from "@material-ui/core/TableBody";
import { useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import { makeStyles } from "@material-ui/core/styles";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
const CHART_BOX_SIZE = {
  height: 40,
  width: 150,
};

const INITIAL_QUERY_PARAMS = {
  per_page: 20,
  page: 1,
};
const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});
const MAX_PAGE_COUNT = 250;
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}
const Coins = () => {
  const history = useHistory();
  const local: any = localStorage?.getItem("listWatched");
  const listWatched: {
    id: string;
    watched: boolean;
    price: string;
    coin: string;
    priceTo: string;
  }[] = local ? JSON.parse(local) : [];
  const theme = useTheme();
  const [value, setValue] = useState<number>(0);
  const classes = useStyles();
  const [queryParams, setQueryParams] = useQueryParams({
    per_page: NumberParam,
    page: NumberParam,
  });
  const [{ data, loading }, refecth] = useAxios<CoinDataProps[]>(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=${
      queryParams?.per_page || INITIAL_QUERY_PARAMS.per_page
    }&page=${
      queryParams?.page || INITIAL_QUERY_PARAMS.page
    }&sparkline=false&price_change_percentage=1h%2C24h%2C7d`
  );
  const objCurrency: any =
    data && data?.length > 0 && data.find((values) => values.symbol === "ltc");
  useEffect(() => {
    setQueryParams({
      per_page: queryParams?.per_page || INITIAL_QUERY_PARAMS.per_page,
      page: queryParams?.page || INITIAL_QUERY_PARAMS.page,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const TableHeader = () => {
    return (
      <thead>
        <SC.TableHeaderRow>
          <th align="left">#</th>
          <th align="left">Coin</th>
          <th align="left">Price</th>
          <th align="left">24h %</th>
          <th align="left">7d %</th>
          <th align="left">24h Volume</th>
          <th align="left">Mkt Cap</th>
          <th align="left">Last 7 days</th>
        </SC.TableHeaderRow>
      </thead>
    );
  };
  const TableBodyComp = () => {
    return (
      <tbody>
        {data?.length
          ? data.map((ele) => {
              return (
                <SC.TableBodyRow key={ele.id}>
                  <SC.TableData>{ele.market_cap_rank}</SC.TableData>
                  <SC.TableData>
                    <div>
                      <img
                        height="20rem"
                        width="20rem"
                        src={ele.image}
                        alt={ele.name}
                      />
                    </div>
                    <SC.CoinsName
                      onClick={() => {
                        const index = listWatched.findIndex(
                          (el) => el?.id === ele?.id
                        );
                        history.push({
                          pathname: `/coins/${ele.symbol}`,
                          search: `?currency=ltc&displayType=chart&id=${
                            ele.id
                          }&price=${numeral(ele.current_price).format(
                            "0,0.00"
                          )}&priceCurrency=${numeral(
                            objCurrency?.current_price || ""
                          ).format("0,0.00")}&range=1D&watched=${
                            index > -1 ? listWatched[index].watched : "false"
                          }`,
                        });
                      }}
                    >
                      {ele.name}
                    </SC.CoinsName>
                    <div style={{ color: themeColor.colors.primary }}>
                      {constantCase(ele.symbol)}
                    </div>
                  </SC.TableData>
                  <SC.TableData>
                    {numeral(ele.current_price).format("$0,0.00")}
                  </SC.TableData>
                  <SC.TableData
                    color={
                      Math.sign(ele.price_change_percentage_24h) >= 0
                        ? themeColor.colors.lime
                        : themeColor.colors.red
                    }
                  >
                    {numeral(ele.price_change_percentage_24h / 100).format(
                      "0.0%"
                    )}
                  </SC.TableData>
                  <SC.TableData
                    color={
                      Math.sign(ele.price_change_percentage_7d_in_currency) >= 0
                        ? themeColor.colors.lime
                        : themeColor.colors.red
                    }
                  >
                    {numeral(
                      ele.price_change_percentage_7d_in_currency / 100
                    ).format("0.0%")}
                  </SC.TableData>
                  <SC.TableData>
                    {numeral(ele.total_volume).format("$0,0")}
                  </SC.TableData>
                  <SC.TableData>
                    {numeral(ele.market_cap).format("$0,0")}
                  </SC.TableData>
                  <td width={CHART_BOX_SIZE.width}>
                    <CoinChart
                      height={CHART_BOX_SIZE.height}
                      width={CHART_BOX_SIZE.width}
                      color={
                        Math.sign(ele.price_change_percentage_7d_in_currency) >=
                        0
                          ? themeColor.colors.lime
                          : themeColor.colors.red
                      }
                      id={ele.id}
                    />
                  </td>
                </SC.TableBodyRow>
              );
            })
          : null}
      </tbody>
    );
  };
  const handleChange = (_: any, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };
  return (
    <SC.Container>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Coin List" {...a11yProps(0)} />
          <Tab label="Watched List" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          <SC.CoinsContainer>
            <Grid container justify="center">
              <SC.GridComp item xs={12} md={10}>
                {loading ? (
                  <Skeleton variant="rect" height="100vh" width="100%" />
                ) : (
                  <>
                    <SC.Table width="100%">
                      <TableHeader />
                      <TableBodyComp />
                    </SC.Table>
                    <SC.PaginationWrapper>
                      <Pagination
                        size="small"
                        count={MAX_PAGE_COUNT}
                        page={queryParams?.page || 1}
                        onChange={(e, pageNumber) => {
                          setQueryParams({
                            page: pageNumber,
                          });
                          refecth();
                        }}
                      />
                    </SC.PaginationWrapper>
                  </>
                )}
              </SC.GridComp>
            </Grid>
          </SC.CoinsContainer>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <TableContainer style={{ height: "70vh" }} component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Coin</TableCell>
                  <TableCell align="left">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listWatched.map((row, index) => {
                  const name = row.coin.split(" to ");
                  return (
                    <TableRow key={index}>
                      <TableCell align="left">{row.coin}</TableCell>
                      <TableCell align="left">
                        <p>{`1 ${name[0]} = $${row.price}`}</p>
                        <p>{`1 ${name[1]} = $${row.priceTo}`}</p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </SwipeableViews>
    </SC.Container>
  );
};

export default Coins;
