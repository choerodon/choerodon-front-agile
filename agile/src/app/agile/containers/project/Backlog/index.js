import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter } from 'choerodon-front-boot';

const BacklogHome = asyncRouter(() => (import('./BacklogHome')));
const test = asyncRouter(() => (import('./muilDrag')));

const BacklogIndex = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}`} component={BacklogHome} />
    <Route path={`${match.url}/test`} component={test} />
  </Switch>
);

export default BacklogIndex;
