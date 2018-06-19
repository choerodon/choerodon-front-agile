import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const BurndownChartHome = asyncRouter(() => (import('./BurndownChartHome')));

const BurndownChartIndex = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}`} component={BurndownChartHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default BurndownChartIndex;
