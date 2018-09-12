import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const ReportHostHome = asyncRouter(() => (import('./Home')));
const BurndownChart = asyncRouter(() => (import('./BurndownChart')));
const sprintReport = asyncRouter(() => (import('./SprintReport')));
const Accumulation = asyncRouter(() => (import('./Accumulation')));
const VersionReport = asyncRouter(() => (import('./VersionReport')));
const VelocityReport = asyncRouter(() => (import('./VelocityChart')));
const EpicReport = asyncRouter(() => (import('./EpicReport')));
const PieChartReport = asyncRouter(() => (import('./pieChart')));
const VersionReportNew = asyncRouter(() => (import('./VersionReportNew')));
const EpicBurndown = asyncRouter(() => (import('./EpicBurndown')));
const VersionBurndown = asyncRouter(() => (import('./VersionBurndown')));


const ReportHostIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={ReportHostHome} />
    <Route path={`${match.url}/burndownchart`} component={BurndownChart} />
    <Route path={`${match.url}/sprintreport`} component={sprintReport} />
    <Route path={`${match.url}/accumulation`} component={Accumulation} />
    {/* <Route path={`${match.url}/versionReport`} component={VersionReport} /> */}
    <Route path={`${match.url}/velocityChart`} component={VelocityReport} />
    <Route path={`${match.url}/EpicReport`} component={EpicReport} />
    <Route path={`${match.url}/pieReport`} component={PieChartReport} />
    <Route path={`${match.url}/versionReport`} component={VersionReportNew} />
    <Route path={`${match.url}/epicBurndown`} component={EpicBurndown} />
    <Route path={`${match.url}/versionBurndown`} component={VersionBurndown} />
    <Route path="*" component={nomatch} />
  </Switch>
);
export default ReportHostIndex;
