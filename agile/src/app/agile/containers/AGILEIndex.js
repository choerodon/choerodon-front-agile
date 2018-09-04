import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { inject } from 'mobx-react';
import {
  asyncRouter, asyncLocaleProvider, stores, nomatch, 
} from 'choerodon-front-boot';

const Home = asyncRouter(() => import('./Home'));
const RELEASEINDEX = asyncRouter(() => import('./project/Release'));
const BACKLOGINDEX = asyncRouter(() => import('./project/Backlog'));
const SCRUMBOARDINDEX = asyncRouter(() => import('./project/ScrumBoard'));
const ISSUEIndex = asyncRouter(() => import('./project/Issue'));
const COMPONENTIndex = asyncRouter(() => import('./project/Component'));
const PROJECTSETTINGINDEX = asyncRouter(() => import('./project/ProjectSetting'));
const FASTSEARCHINDEX = asyncRouter(() => import('./project/FastSearch'));
const REPORTHOSTINDEX = asyncRouter(() => import('./project/ReportHost'));
const ISSUELINKINDEX = asyncRouter(() => import('./project/IssueLink'));
const STATUSINDEX = asyncRouter(() => import('./project/Status'));
const USERMAPINDEX = asyncRouter(() => import('./project/userMap'));
// const INERATIONBOARDINDEX = asyncRouter(() => import('./project/IterationBoard'));
// const ISSUETYPE = asyncRouter(() => import('./project/IterationBoard/IterationBoardComponent/IssueTypeComponent/IssueType'));
// const SPRINTTDETAIIL = asyncRouter(() => import('./project/IterationBoard/IterationBoardComponent/SprintDetailsComponent/SprintDetails'));
const INERATIONBOARDINDEX = asyncRouter(() => import('./project/IterationBoard'));

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
          {/* 发布版本 */}
          <Route path={`${match.url}/release`} component={RELEASEINDEX} />
          {/* 待办事项 */}
          <Route path={`${match.url}/backlog`} component={BACKLOGINDEX} />
          {/* 活跃冲刺 */}
          <Route path={`${match.url}/scrumboard`} component={SCRUMBOARDINDEX} /> 
          {/* 问题管理 */}
          <Route path={`${match.url}/issue`} component={ISSUEIndex} />
          {/* 模块管理 */}
          <Route path={`${match.url}/component`} component={COMPONENTIndex} />
          {/* 报告 */}
          <Route path={`${match.url}/reporthost`} component={REPORTHOSTINDEX} />
          {/* <Route path={`${match.url}/burndownchart`} component={BURNDOWNCHART} /> */}
          {/* 项目设置 */}
          <Route path={`${match.url}/projectSetting`} component={PROJECTSETTINGINDEX} />
          {/* 快速搜索 */}
          <Route path={`${match.url}/fastSearch`} component={FASTSEARCHINDEX} />
          {/* 问题链接 */}
          <Route path={`${match.url}/issueLink`} component={ISSUELINKINDEX} />
          {/* 状态 */}
          <Route path={`${match.url}/status`} component={STATUSINDEX} />
          <Route path={`${match.url}/userMap`} component={USERMAPINDEX} />
          {/* 迭代工作台 */}
          {/* <Route path={`${match.url}/iterationBoard`} component={INERATIONBOARDINDEX} /> */}

          {/* 迭代工作台/迭代问题类型分布 */}
          {/* <Route path={`${match.url}/iterationBoard/issueType`} component={ISSUETYPE} />
          <Route path={`${match.url}/iterationBoard/sprintDetail`} component={SPRINTTDETAIIL} /> */}
          <Route path={`${match.url}/iterationBoard`} component={INERATIONBOARDINDEX} />
          <Route path="*" component={nomatch} />
        </Switch>
      </IntlProviderAsync>
    );
  }
}

export default AGILEIndex;
