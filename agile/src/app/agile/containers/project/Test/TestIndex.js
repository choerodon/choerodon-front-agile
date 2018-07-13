import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const testHome = asyncRouter(() => (import('./Test')));

const TestIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={testHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);
export default TestIndex;
