import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { DashBoardNavBar, stores, axios } from 'choerodon-front-boot';
import TypeTag from '../../components/TypeTag';
import PriorityTag from '../../components/PriorityTag';
import StatusTag from '../../components/StatusTag';
import './index.scss';

const { AppState } = stores;

class Undistributed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issues: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    const projectId = AppState.currentMenuType.id;
    axios.post(`/agile/v1/projects/${projectId}/issues/no_sub?page=0&size=6`, {
      advancedSearchArgs: {},
      searchArgs: {},
    })
      .then((res) => {
        this.setState({ issues: res.content });
      });
  }

  renderIssue(issue) {
    return (
      <div className="list">
        <div>
          <TypeTag
            typeCode={issue.typeCode}
          />
        </div>
        <span className="issueNum text-overflow-hidden">
          {issue.issueNum}
        </span>
        <div className="issueSummary-wrap">
          <p className="issueSummary text-overflow-hidden">
            {issue.summary}
          </p>
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

  render() {
    const { issues } = this.state;
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    return (
      <div className="c7n-agile-dashboard-undistributed">
        <div className="lists">
          {
            issues.map(issue => this.renderIssue(issue))
          }
        </div>
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
