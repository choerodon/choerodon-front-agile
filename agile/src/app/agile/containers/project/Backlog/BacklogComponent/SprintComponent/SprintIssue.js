import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Draggable } from 'react-beautiful-dnd';
import { fromJS, is } from 'immutable';
import { Icon, Avatar, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import Typetag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';

@observer
class SprintIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: {
        issueIds: [],
      },
    };
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    if (thisProps.size !== nextProps.size ||
      thisState.size !== nextState.size) {
      return true;
    }
    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
  };

  /**
   *拿到首字母
   *
   * @param {*} str
   * @returns
   * @memberof SprintIssue
   */
  getFirst(str) {
    if (!str) {
      return '';
    }
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return str[0];
  }
  /**
   *渲染优先级样式
   *
   * @param {*} type
   * @param {*} item
   * @returns
   * @memberof SprintIssue
   */
  renderPriorityStyle(type, item) {
    if (type === 'color') {
      if (item.priorityCode === 'medium') {
        return 'rgb(53, 117, 223)';
      } else if (item.priorityCode === 'high') {
        return 'rgb(255, 177, 0)';
      } else {
        return 'rgba(0, 0, 0, 0.36)';
      }
    } else if (item.priorityCode === 'medium') {
      return 'rgba(77, 144, 254, 0.2)';
    } else if (item.priorityCode === 'high') {
      return 'rgba(255, 177, 0, 0.12)';
    } else {
      return 'rgba(0, 0, 0, 0.08)';
    }
  }
  /**
   *渲染issue背景色
   *
   * @param {*} item
   * @returns
   * @memberof SprintIssue
   */
  renderIssueBackground(item) {
    if (BacklogStore.getClickIssueDetail.issueId === item.issueId) {
      return 'rgba(140,158,255,0.08)';
    } else if (BacklogStore.getIsDragging) {
      return 'white';
    } else {
      return 'unset';
    }
  }
  /**
   *根据打开的组件个数 判断issue样式
   *
   * @returns
   * @memberof SprintIssue
   */
  renderIssueDisplay() {
    let flag = 0;
    if (this.props.epicVisible) {
      flag += 1;
    }
    if (this.props.versionVisible) {
      flag += 1;
    }
    if (JSON.stringify(BacklogStore.getClickIssueDetail) !== '{}') {
      flag += 1;
    }
    return flag >= 2;
  }
  render() {
    const item = this.props.data;
    const index = this.props.index;
    const sprintId = this.props.sprintId;
    return (
      <Draggable key={item.issueId} draggableId={item.issueId} index={index}>
        {(provided1, snapshot1) => 
          (
            <div
              className={BacklogStore.getIsDragging ? 'c7n-backlog-sprintIssue' : 'c7n-backlog-sprintIssue c7n-backlog-sprintIssueHover'}
              style={{
                position: 'relative',
              }}
              label="sprintIssue"
            >
              <div
                className="c7n-backlog-sprintIssueItem"
                ref={provided1.innerRef}
                {...provided1.draggableProps}
                {...provided1.dragHandleProps}
                style={{
                  userSelect: 'none',
                  background: this.props.selected.issueIds.includes(item.issueId) ? 'rgb(235, 242, 249)' : this.renderIssueBackground(item),
                  padding: '10px 36px 10px 20px',
                  borderBottom: '1px solid rgba(0,0,0,0.12)',
                  paddingLeft: 43,
                  ...provided1.draggableProps.style,
                  fontSize: 13,
                  display: this.renderIssueDisplay() ? 'block' : 'flex',
                  alignItems: 'center',
                  cursor: 'move',
                  flexWrap: 'nowrap',
                  justifyContent: 'space-between',
                  // position: 'relative',
                }}
                label="sprintIssue"
                role="none"
                onClick={this.props.handleClickIssue.bind(this, sprintId, item)}
              >
                <div
                  className="c7n-backlog-issueSideBorder"
                  style={{
                    display: BacklogStore.getClickIssueDetail.issueId === item.issueId ? 'block' : 'none',
                  }}
                />
                <div
                  className="c7n-backlog-sprintCount"
                  style={{
                    display: String(this.props.draggableId) === String(item.issueId) && this.props.selected.issueIds.length > 0 ? 'flex' : 'none',
                  }}
                  label="sprintIssue"
                >{this.props.selected.issueIds.length}</div>
                <div
                  label="sprintIssue"
                  className="c7n-backlog-sprintIssueSide"
                  style={{
                    // width: 0,
                    flexGrow: 1,
                    width: this.renderIssueDisplay() ? 'unset' : 0,
                  }}
                >
                  <Typetag
                    type={{
                      typeCode: item.typeCode,
                    }}
                  />
                  <div
                    label="sprintIssue"
                    style={{
                      marginLeft: 8,
                      whiteSpace: this.renderIssueDisplay() ? 'normal' : 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      height: this.renderIssueDisplay ? 'auto' : 20,
                      wordBreak: 'break-all',
                    }}
                  >{`${item.issueNum} `}
                    <Tooltip title={item.summary} placement="topLeft">
                      {item.summary}
                    </Tooltip>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: this.props.epicVisible || this.props.versionVisible || JSON.stringify(BacklogStore.getClickIssueDetail) !== '{}' ? 5 : 0,
                    justifyContent: this.renderIssueDisplay() ? 'space-between' : 'flex-end',
                    // width: this.renderIssueDisplay() ? 'unset' : 0,
                    // flex: 2,
                  }}
                  label="sprintIssue"
                  className="c7n-backlog-sprintIssueSide"
                >
                  <div className="c7n-backlog-sprintSideRightItems">
                    <div
                      style={{
                        maxWidth: 34,
                        marginLeft: !_.isNull(item.priorityName) && !this.renderIssueDisplay() ? '12px' : 0,
                      }}
                      label="sprintIssue"
                      className="c7n-backlog-sprintIssueRight"
                    >
                      {!_.isNull(item.priorityName) ? (
                        <Tooltip title={`优先级: ${item.priorityName}`}>
                          <span
                            label="sprintIssue"
                            className="c7n-backlog-sprintIssuePriority"
                            style={{
                              color: this.renderPriorityStyle('color', item),
                              background: this.renderPriorityStyle('background', item),
                            }}
                          >{item.priorityName}</span>
                        </Tooltip>
                      ) : ''}
                    </div>
                    <div
                      style={{
                        maxWidth: 50,
                        marginLeft: item.versionNames.length ? '12px' : 0,
                        border: '1px solid rgba(0, 0, 0, 0.36)',
                        borderRadius: '2px',
                        display: item.versionNames.length > 0 ? 'block' : 'none',
                      }}
                      label="sprintIssue"
                      className="c7n-backlog-sprintIssueRight"
                    >
                      {item.versionNames.length > 0 ? (
                        <Tooltip title={`版本: ${item.versionNames.join(', ')}`}>
                          <span label="sprintIssue" className="c7n-backlog-sprintIssueVersion">
                            <span>{item.versionNames.join(', ')}</span>
                          </span>
                        </Tooltip>
                      ) : ''}
                    </div>
                    <div
                      style={{
                        maxWidth: 86,
                        marginLeft: !_.isNull(item.epicName) ? '12px' : 0,
                        border: `1px solid ${item.color}`,
                        display: !_.isNull(item.epicName) ? 'block' : 'none',
                      }}
                      label="sprintIssue"
                      className="c7n-backlog-sprintIssueRight"
                    >
                      {!_.isNull(item.epicName) ? (
                        <Tooltip title={`史诗: ${item.epicName}`}>
                          <span
                            label="sprintIssue"
                            className="c7n-backlog-sprintIssueEpic"
                            style={{
                            // border: `1px solid ${item.color}`,
                              color: item.color,
                            }}
                          >{item.epicName}</span>
                        </Tooltip>
                      ) : ''}
                    </div>
                  </div>
                  <div className="c7n-backlog-sprintSideRightItems">
                    <div
                      style={{
                        maxWidth: 105,
                        marginLeft: !_.isNull(item.assigneeName) ? '12px' : 0,
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      label="sprintIssue"
                      className="c7n-backlog-sprintIssueRight"
                    >
                      <UserHead
                        user={{
                          id: item.assigneeId,
                          loginName: '',
                          realName: item.assigneeName,
                          avatar: item.imageUrl,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: 60,
                        marginLeft: !_.isNull(item.statusName) ? '12px' : 0,
                      }}
                      label="sprintIssue"
                      className="c7n-backlog-sprintIssueRight"
                    >
                      {!_.isNull(item.statusName) ? (
                        <Tooltip title={`状态: ${item.statusName}`}>
                          <span
                            label="sprintIssue"
                            className="c7n-backlog-sprintIssueStatus"
                            style={{
                              background: item.statusColor ? item.statusColor : '#4d90fe',
                            }}
                          >{item.statusName}</span>
                        </Tooltip>
                      ) : ''}
                    </div>
                    <div
                      style={{
                        maxWidth: 20,
                        marginLeft: '12px',
                      }}
                      label="sprintIssue"
                      className="c7n-backlog-sprintIssueRight"
                    >
                      <Tooltip title={`故事点: ${item.storyPoints}`}>
                        <div
                          label="sprintIssue"
                          className="c7n-backlog-sprintIssueStoryPoint"
                          style={{
                            visibility: item.storyPoints && item.typeCode === 'story' ? 'visible' : 'hidden',
                          }}
                        >{item.storyPoints}</div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
              {provided1.placeholder}
            </div>
          )
        }
      </Draggable>
    );
  }
}

export default SprintIssue;
