import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const BoardHome = asyncRouter(() => (import('./BoardHome')));
// const EditArt = asyncRouter(() => (import('./EditArt')));
// const ArtCalendar = asyncRouter(() => (import('./ArtCalendar')));
const BoardIndex = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}`} component={BoardHome} />    
    {/* <Route exact path={`${match.url}/calendar/:id?`} component={ArtCalendar} /> */}
    <Route path="*" component={nomatch} />
  </Switch>
);

export default BoardIndex;
