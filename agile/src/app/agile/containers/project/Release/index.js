import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter } from 'choerodon-front-boot';

const ReleaseHome = asyncRouter(() => (import('./ReleaseHome')));
const ReleaseDetail = asyncRouter(() => (import('./ReleaseDetail')));

const ReleaseIndex = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}`} component={ReleaseHome} />
    <Route path={`${match.url}/detail/:id`} component={ReleaseDetail} />
  </Switch>
);

export default ReleaseIndex;
