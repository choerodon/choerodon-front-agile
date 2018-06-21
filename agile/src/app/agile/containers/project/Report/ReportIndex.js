/**
 * Created by Qyellow on 2018/6/14.
 */
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const ReportHome = asyncRouter(() => (import('./ReportHome')));

const ReportIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={ReportHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);
export default ReportIndex;
