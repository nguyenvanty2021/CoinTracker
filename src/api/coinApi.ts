import axiosClient from "./axiosClient";

const coinApi = {
  getAllCoin(
    coin: string,
    currencyChange: string,
    timeFilter: string
  ): Promise<any> {
    const url = `/coins/${coin}/market_chart?vs_currency=${currencyChange}&days=${timeFilter}`;
    return axiosClient.get(url);
  },
  getAllMoney(): Promise<any> {
    const url = "/simple/supported_vs_currencies";
    return axiosClient.get(url);
  },
};
export default coinApi;
