/**
 * Created by Qyellow on 2018/4/10.
 */
import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter } from 'choerodon-front-boot';

const issueHome = asyncRouter(() => (import('./Issue')));

const IssueIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={issueHome} />
  </Switch>
);
export default IssueIndex;
