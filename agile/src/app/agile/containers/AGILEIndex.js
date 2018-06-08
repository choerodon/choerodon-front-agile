import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncRouter, asyncLocaleProvider, stores } from 'choerodon-front-boot';

const Home = asyncRouter(() => import('./Home'));
const RELEASEINDEX = asyncRouter(() => import('./project/Release'));
const BACKLOGINDEX = asyncRouter(() => import('./project/Backlog'));
const SCRUMBOARDINDEX = asyncRouter(() => import('./project/ScrumBoard'));
const ISSUEIndex = asyncRouter(() => import('./project/Issue'));
const COMPONENTIndex = asyncRouter(() => import('./project/Component'));

class AGILEIndex extends React.Component {
  render() {
    const { match } = this.props;
    const { AppState } = stores;
    const langauge = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`../locale/${langauge}`));
    return (
      <IntlProviderAsync>
        <Switch>
          <Route exact path={match.url} component={Home} />
          <Route path={`${match.url}/release`} component={RELEASEINDEX} />
          <Route path={`${match.url}/backlog`} component={BACKLOGINDEX} />
          <Route path={`${match.url}/scrumboard`} component={SCRUMBOARDINDEX} /> 
          <Route path={`${match.url}/issue`} component={ISSUEIndex} />
          <Route path={`${match.url}/component`} component={COMPONENTIndex} />
        </Switch>
      </IntlProviderAsync>
    );
  }
}

export default AGILEIndex;
