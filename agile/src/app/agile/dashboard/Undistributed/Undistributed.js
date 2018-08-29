import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { DashBoardNavBar, stores, axios } from 'choerodon-front-boot';
import { Spin, Tooltip } from 'choerodon-ui';
import TypeTag from '../../components/TypeTag';
import PriorityTag from '../../components/PriorityTag';
import StatusTag from '../../components/StatusTag';
import EmptyBlockDashboard from '../../components/EmptyBlockDashboard';
import pic from './empty.png';
import './index.scss';

const { AppState } = stores;

class Undistributed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issues: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    const projectId = AppState.currentMenuType.id;
    this.setState({ loading: true });
    axios.get(`/agile/v1/projects/${projectId}/issues/undistributed`)
      .then((res) => {
        this.setState({
          issues: res,
          loading: false,
        });
      });
  }

  renderIssue(issue) {
    return (
      <div className="list" key={issue.issueNum}>
        <div>
          <TypeTag
            typeCode={issue.typeCode}
          />
        </div>
        <span className="issueNum text-overflow-hidden">
          {issue.issueNum}
        </span>
        <div className="issueSummary-wrap">
          <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={issue.summary}>
            <p className="issueSummary text-overflow-hidden">
              {issue.summary}
            </p>
          </Tooltip>
        </div>
        <div className="flex-shrink">
          <div className="priority">
            <PriorityTag
              priority={issue.priorityCode}
            />
          </div>
        </div>
        <div className="status flex-shrink">
          <div>
            <StatusTag
              name={issue.statusName}
              color={issue.statusColor}
            />
          </div>
        </div>
      </div>
    );
  }

  renderContent() {
    const { loading, issues } = this.state;
    if (loading) {
      return (
        <div className="loading-wrap">
          <Spin />
        </div>
      );
    }
    if (issues && !issues.length) {
      return (
        <div className="loading-wrap">
          <EmptyBlockDashboard
            pic={pic}
            des="当前没有未分配的任务"
          />
        </div>
      );
    }
    return (
      <div className="lists">
        {
          issues.map(issue => this.renderIssue(issue))
        }
      </div>
    );
  }

  render() {
    const { issues } = this.state;
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    return (
      <div className="c7n-agile-dashboard-undistributed">
        {this.renderContent()}
        <DashBoardNavBar>
          <a
            role="none"
            onClick={() => {
              history.push(`/agile/backlog?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
              return false;
            }}
          >
            {'转至待办事项'}
          </a>
        </DashBoardNavBar>
      </div>
    );
  }
}

export default withRouter(Undistributed);
