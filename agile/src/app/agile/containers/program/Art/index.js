import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const ArtList = asyncRouter(() => (import('./ArtList')));
const EditArt = asyncRouter(() => (import('./EditArt')));
const ArtCalendar = asyncRouter(() => (import('./ArtCalendar')));
const ArtIndex = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}`} component={ArtList} />
    <Route exact path={`${match.url}/edit/:id?`} component={EditArt} />
    <Route exact path={`${match.url}/calendar/:id?`} component={ArtCalendar} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default ArtIndex;
