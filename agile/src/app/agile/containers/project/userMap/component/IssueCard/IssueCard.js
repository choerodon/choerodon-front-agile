import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Input, Icon } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { Draggable } from 'react-beautiful-dnd';
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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.issue.issueId === this.props.issue.issueId
      && nextProps.issue.objectVersionNumber === this.props.issue.objectVersionNumber
      && nextProps.selected === this.props.selected
      && nextProps.dragged === this.props.dragged
      && nextProps.index === this.props.index
      && nextState.summary === this.state.summary
    ) {
      return false;
    }
    return true;
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
        US.freshIssue(issueId, res.objectVersionNumber, res.summary);
      });
  }

  onIssueClick = (id) => {
    this.props.handleClickIssue(id);
  };

  handleClickDelete() {
    const { issue: { issueId } } = this.state;
    US.deleteIssue(issueId);
  }

  render() {
    window.console.log('issue card render');
    const { issue, borderTop, history, selected, dragged, draggableId, index } = this.props;
    const selectIssueIds = US.getSelectIssueIds;
    return (
      <Draggable draggableId={draggableId} index={index} key={draggableId}>
        {(provided1, snapshot1) => (
          <div
            ref={provided1.innerRef}
            {...provided1.draggableProps}
            {...provided1.dragHandleProps}
            style={{
              cursor: 'move',
              ...provided1.draggableProps.style,
            }}
            role="none"
          >
            {/* {issue.issueId} */}
            <div
              role="none"
              style={{
                background: selected ? 'rgb(235, 242, 249)' : '',
                borderTop: borderTop ? '1px solid rgba(0, 0, 0, 0.2)' : 'unset',
              }}
              className="c7n-userMap-issueCard"
              onClick={this.onIssueClick.bind(this, issue.issueId, issue.epicId)}
            >
              <div
                style={{
                  display: selectIssueIds.length > 1 && dragged ? 'block' : 'none',
                  width: 20,
                  height: 20,
                  color: 'white',
                  background: '#F44336',
                  borderRadius: '50%',
                  textAlign: 'center',
                  float: 'right',
                }}
              >
                {selectIssueIds.length}
              </div>
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
                      textDecoration: this.state.issue.statusCode === 'done' ? 'line-through' : 'unset',
                    }}
                    role="none"
                    onClick={() => {
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
                <Icon
                  className="c7n-delete"
                  type="delete"
                  onClick={this.handleClickDelete.bind(this)}
                />
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
                  spellCheck="false"
                />
              </div>
              <div className="c7n-footer">
                <TypeTag
                  typeCode={this.state.issue.typeCode}
                />
                <span className="c7n-issueCard-storyPoints">
                  {this.state.issue.storyPoints}
                </span>
                <StatusTag
                  name={this.state.issue.statusName}
                  color={this.state.issue.statusColor}
                />
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}
export default withRouter(IssueCard);
