import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const ArtList = asyncRouter(() => (import('./ArtList')));
const CreateArt = asyncRouter(() => (import('./CreateArt')));
const ArtIndex = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}`} component={ArtList} />
    <Route exact path={`${match.url}/create`} component={CreateArt} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default ArtIndex;
