import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const PIList = asyncRouter(() => (import('./PIList')));
const PIDetail = asyncRouter(() => (import('./PIDetail')));
const FeatureIndex = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}`} component={PIList} />
    <Route exact path={`${match.url}/detail/:id`} component={PIDetail} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default FeatureIndex;
