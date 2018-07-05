import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const ReportHostHome = asyncRouter(() => (import('./ReportHostHome')));
const BurndownChart = asyncRouter(() => (import('./BurndownChart')));
const sprintReport = asyncRouter(() => (import('./Report')));
const Accumulation = asyncRouter(() => (import('./Accumulation')));

const ReportHostIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={ReportHostHome} />
    <Route path={`${match.url}/burndownchart`} component={BurndownChart} />
    <Route path={`${match.url}/sprintreport`} component={sprintReport} />
    <Route path={`${match.url}/accumulation`} component={Accumulation} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);
export default ReportHostIndex;
