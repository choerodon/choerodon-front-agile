import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Input, Icon, Popover, Menu, Checkbox } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import _ from 'lodash';
import './IssueCard.scss';
import US from '../../../../../stores/project/userMap/UserMapStore';
import PriorityTag from '../../../../../components/PriorityTag';
import StatusTag from '../../../../../components/StatusTag';
import TypeTag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';
import { updateIssue } from '../../../../../api/NewIssueApi';

const { TextArea } = Input;
const { AppState } = stores;

class IssueCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      issue: {},
      summary: '',
      originSummary: '',
      isFocus: false,
    };
  }

  componentDidMount() {
    this.setIssueInState();
  }

  setIssueInState() {
    const { issue } = this.props;
    this.setState({
      issue,
      summary: issue.summary,
      originSummary: issue.summary,
    });
  }

  handleIssueNameChange = (e) => {
    this.setState({ summary: e.target.value });
  }

  handlePressEnter = (e) => {
    e.preventDefault();
    if (!this.state.summary) {
      return;
    }
    e.target.blur();
  }

  updateIssueName = (e) => {
    e.preventDefault();
    this.setState({ isFocus: false });
    const { issue } = this.props;
    const { issueId, objectVersionNumber } = issue;
    if (!this.state.summary) {
      this.setState({ summary: this.state.originSummary });
      return;
    }
    if (this.state.summary === this.state.originSummary) {
      return;
    }
    const obj = {
      issueId,
      objectVersionNumber,
      summary: this.state.summary,
    };
    updateIssue(obj)
      .then((res) => {
        if (this.props.handleUpdateIssueName) {
          this.props.handleUpdateIssueName();
        }
        US.freshIssue(issueId, res.objectVersionNumber);
      });
  }

  render() {
    const { issue } = this.props;
    return (
      <div className="c7n-userMap-issueCard">
        <div
          className="c7n-mask"
          style={{
            display: this.state.issue.statusCode === 'done' && !this.state.isFocus ? 'block' : 'none',
          }}
        />
        <div className="c7n-header">
          <div className="c7n-headerLeft">
            <UserHead
              user={{
                id: this.state.issue.assigneeId,
                loginName: '',
                realName: this.state.issue.assigneeName,
                avatar: this.state.issue.imageUrl,
              }}
              hiddenText
              size={30}
            />
            <span
              className="c7n-issueNum"
              style={{ 
                cursor: 'pointer',
                textDecoration: this.state.issue.statusCode === 'done' ? 'line-through' : 'unset',
              }}
              role="none"
              onClick={() => {
                const { history } = this.props;
                const urlParams = AppState.currentMenuType;
                history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${this.state.issue.issueNum}&paramIssueId=${this.state.issue.issueId}&paramUrl=usermap`);
              }}
            >
              {this.state.issue.issueNum}
            </span>
            <PriorityTag
              priority={this.state.issue.priorityCode}
            />
          </div>
          <Icon className="c7n-delete" type="delete" />
        </div>
        
        <div className="c7n-content">
          <TextArea
            className="c7n-textArea"
            autosize={{ minRows: 1, maxRows: 10 }}
            value={this.state.summary}
            onChange={this.handleIssueNameChange.bind(this)}
            onPressEnter={this.handlePressEnter}
            onFocus={(e) => {
              e.target.select();
              this.setState({ isFocus: true });
            }}
            onBlur={this.updateIssueName}
          />
        </div>
        <div className="c7n-footer">
          <TypeTag
            typeCode={this.state.issue.typeCode}
          />
          <span className="c7n-issueCard-storyPoints">{this.state.issue.storyPoints}</span>
          <StatusTag
            name={this.state.issue.statusName}
            color={this.state.issue.statusColor}
          />
        </div>
      </div>
    );
  }
}
export default withRouter(IssueCard);
