import Market from "containers/Market";
import Coins from "containers/Coins";
import MarketProvider from "store/MarketProvider";

import { Switch, Route } from "react-router-dom";
import { SC } from "./styled";

const App = () => {
  return (
    <SC.DivComp>
      <Switch>
        <Route exact path="/">
          <Coins />
        </Route>
        <Route exact path="/coins/:id">
          <MarketProvider>
            <Market />
          </MarketProvider>
        </Route>
      </Switch>
    </SC.DivComp>
  );
};

export default App;
