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
    };
    this.isEnter = false;
  }

  componentDidMount() {
    this.setIssueInState();
  }

  setIssueInState() {
    const { issue } = this.props;
    this.setState({
      issue,
      summary: issue.summary,
    });
  }

  handleIssueNameChange = (e) => {
    this.setState({ summary: e.target.value });
  }

  handlePressEnter = (e) => {
    this.isEnter = true;
    e.preventDefault();
    const target = e.target;
    const { issue } = this.props;
    const { issueId, objectVersionNumber } = issue;
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
        target.blur();
      });
  }

  updateIssueName = (e) => {
    if (this.isEnter) {
      this.isEnter = false;
      return;
    }
    e.preventDefault();
    const target = e.target;
    const { issue } = this.props;
    const { issueId, objectVersionNumber } = issue;
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
      });
  }

  render() {
    const { issue } = this.props;
    return (
      <div className="c7n-issueCard">
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
        
        {/* <div className="c7n-content">
          <Input
            className="c7n-textArea"
            // autosize={{ minRows: 1, maxRows: 10 }}
            defaultValue="作为部署管理员，我想看到对照版本里的Values修改参数并且每次只保存修改部分附件发挥第三的分…"
          />
        </div> */}
        <div className="c7n-content">
          <TextArea
            className="c7n-textArea"
            autosize={{ minRows: 1, maxRows: 10 }}
            value={this.state.summary}
            onChange={this.handleIssueNameChange.bind(this)}
            onPressEnter={this.handlePressEnter}
            onFocus={e => e.target.select()}
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
