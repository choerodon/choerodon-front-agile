import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Input, Icon, Modal } from 'choerodon-ui';
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
const confirm = Modal.confirm;

class IssueCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    const {
      selected, dragged, index, issue: { issueId, objectVersionNumber },
    } = this.props;
    const { summary, isFocus } = this.state;
    if (nextProps.issue.issueId === issueId
      && nextProps.issue.objectVersionNumber === objectVersionNumber
      && nextProps.selected === selected
      && nextProps.dragged === dragged
      && nextProps.index === index
      && nextState.summary === summary
      && nextState.isFocus === isFocus
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

  handleClickTextArea = (e) => {
    if (e.defaultPrevented) return;

    e.stopPropagation();

    const { isFocus } = this.state;
    if (!isFocus) {
      const { target } = e;
      target.focus();
      target.select();
      this.setState({ isFocus: true });
    }
  }

  handleIssueNameChange = (e) => {
    this.setState({ summary: e.target.value });
  }

  handlePressEnter = (e) => {
    e.preventDefault();

    const { summary } = this.state;
    if (!summary) {
      return;
    }
    e.target.blur();
  }

  updateIssueName = (e) => {
    const { issue, handleUpdateIssueName } = this.props;
    const { issueId, objectVersionNumber } = issue;
    const { summary, originSummary } = this.state;

    e.preventDefault();
    this.setState({ isFocus: false });
    
    if (!summary) {
      this.setState({ summary: originSummary });
      return;
    }
    if (summary === originSummary) {
      return;
    }

    const obj = {
      issueId,
      objectVersionNumber,
      summary,
    };
    updateIssue(obj)
      .then((res) => {
        if (handleUpdateIssueName) {
          handleUpdateIssueName();
        }
        US.freshIssue(issueId, res.objectVersionNumber, res.summary);
      });
  }

  onIssueClick = (id) => {
    const { handleClickIssue } = this.props;
    handleClickIssue(id);
  };

  handleClickDelete() {
    const { issue: { issueId } } = this.state;
    confirm({
      width: 560,
      wrapClassName: 'deleteConfirm',
      title: '移除问题',
      content: (
        <div>
          <p style={{ marginBottom: 10 }}>请确认您要取消问题与史诗的关联。</p>
          <p style={{ marginBottom: 10 }}>这个操作将取消当前问题与史诗的关联，并从用户故事地图中移除，移除的问题将至于需求池的未规划部分</p>
        </div>
      ),
      onOk() {
        US.deleteIssue(issueId);
      },
      onCancel() {},
      okText: '移除',
      okType: 'danger',
    });
  }

  render() {
    const {
      issue, borderTop, history, selected, dragged, draggableId, index,
    } = this.props;
    const {
      isFocus,
      summary,
      issue: {
        issueId,
        statusCode,
        assigneeId,
        assigneeName,
        imageUrl,
        priorityCode,
        typeCode,
        storyPoints,
        statusName,
        statusColor,
        issueNum,
      },
    } = this.state;
    const selectIssueIds = US.getSelectIssueIds;
    
    return (
      <Draggable
        draggableId={draggableId}
        index={index}
        key={draggableId}
        disableInteractiveElementBlocking={!isFocus}
      >
        {provided1 => (
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
                  display: statusCode === 'done' && !isFocus ? 'block' : 'none',
                }}
              />
              <div className="c7n-header">
                <div className="c7n-headerLeft">
                  <UserHead
                    user={{
                      id: assigneeId,
                      loginName: '',
                      realName: assigneeName,
                      avatar: imageUrl,
                    }}
                    hiddenText
                    size={30}
                  />
                  <span
                    className="c7n-issueNum"
                    style={{ 
                      textDecoration: statusCode === 'done' ? 'line-through' : 'unset',
                    }}
                    role="none"
                    onClick={() => {
                      const urlParams = AppState.currentMenuType;
                      history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&paramName=${issueNum}&paramIssueId=${issueId}&paramOpenIssueId=${issueId}&paramUrl=usermap`);
                    }}
                  >
                    {issueNum}
                  </span>
                  <PriorityTag
                    priority={priorityCode}
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
                  value={summary}
                  onChange={this.handleIssueNameChange.bind(this)}
                  onPressEnter={this.handlePressEnter}
                  onClick={this.handleClickTextArea}
                  onBlur={this.updateIssueName}
                  spellCheck="false"
                />
              </div>
              <div className="c7n-footer">
                <TypeTag
                  typeCode={typeCode}
                />
                <span className="c7n-issueCard-storyPoints">
                  {storyPoints}
                </span>
                <StatusTag
                  name={statusName}
                  color={statusColor}
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
