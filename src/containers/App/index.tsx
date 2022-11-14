import Market from "containers/Market";
import Coins from "containers/Coins";
import MarketProvider from "store/MarketProvider";

import { Switch, Route } from "react-router-dom";

const App = () => {
  return (
    <div>
      <div style={{ height: "90vh" }}>
        <Switch>
          <Route exact path="/">
            <Coins />
          </Route>
          <Route exact path="/market">
            <MarketProvider>
              <Market />
            </MarketProvider>
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default App;
