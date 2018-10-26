import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import Typetag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';

class IssueItem extends Component {
  /**
   *渲染issue背景色
   *
   * @param {*} item
   * @returns
   * @memberof SprintIssue
   */
  renderIssueBackground =(item) => {
    if (this.props.store.getClickIssueDetail.issueId === item.issueId) {
      return 'rgba(140,158,255,0.08)';
    } else if (this.props.store.getIsDragging) {
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
  renderIssueDisplay=() => {
    let flag = 0;
    if (this.props.epicVisible) {
      flag += 1;
    }
    if (this.props.versionVisible) {
      flag += 1;
    }
    if (JSON.stringify(this.props.store.getClickIssueDetail) !== '{}') {
      flag += 1;
    }
    return flag >= 2;
  };
  render() {
    return this.props.data.map((item, index) => (
      <Draggable key={item.issueId} draggableId={item.issueId} index={index}>
        {(provided1, snapshot1) =>
          (
            <div
              className={this.props.store.getIsDragging ? 'c7n-backlog-sprintIssue' : 'c7n-backlog-sprintIssue c7n-backlog-sprintIssueHover'}
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
                  background: this.props.store.getSelectIssue.includes(item.issueId) ? 'rgb(235, 242, 249)' : this.renderIssueBackground(item),
                  padding: '10px 20px',
                  borderBottom: '1px solid rgba(0,0,0,0.12)',
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
                onClick={this.props.handleClickIssue.bind(this, this.props.sprintId, item)}
              >
                <div
                  className="c7n-backlog-issueSideBorder"
                  style={{
                    display: this.props.store.getClickIssueDetail.issueId === item.issueId ? 'block' : 'none',
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
                    typeCode={item.typeCode}
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
                    marginTop: this.props.epicVisible || this.props.versionVisible || JSON.stringify(this.props.store.getClickIssueDetail) !== '{}' ? 6 : 0,
                    justifyContent: this.renderIssueDisplay() ? 'space-between' : 'flex-end',
                    // width: this.props.renderIssueDisplay() ? 'unset' : 0,
                    // flex: 2,
                  }}
                  label="sprintIssue"
                  className="c7n-backlog-sprintIssueSide"
                >
                  <div className="c7n-backlog-sprintSideRightItems">
                    <div
                      style={{
                        maxWidth: 34,
                        marginLeft: !_.isNull(item.priorityDTO.name) && !this.renderIssueDisplay() ? '12px' : 0,
                      }}
                      label="sprintIssue"
                      className="c7n-backlog-sprintIssueRight"
                    >
                      {!_.isNull(item.priorityDTO.name) ? (
                        <Tooltip title={`优先级: ${item.priorityDTO.name}`}>
                          <span
                            label="sprintIssue"
                            className="c7n-backlog-sprintIssuePriority"
                            style={{
                              color: item.priorityDTO.colour,
                              background: `${item.priorityDTO.colour}33`,
                            }}
                          >
                            {item.priorityDTO.name}
                          </span>
                        </Tooltip>
                      ) : ''}
                    </div>
                    <div
                      style={{
                        padding: '0 3px',
                        maxWidth: 50,
                        marginLeft: item.versionNames.length ? '12px' : 0,
                        border: '1px solid rgba(0, 0, 0, 0.36)',
                        color: 'rgba(0, 0, 0, 0.36)',
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
                        padding: '0 3px',
                        maxWidth: 86,
                        marginLeft: !_.isNull(item.epicName) ? '12px' : 0,
                        border: `1px solid ${item.color}`,
                        display: !_.isNull(item.epicName) ? 'block' : 'none',
                        color: 'rgba(0,0,0,0.36)',
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
                      {item.assigneeId && <UserHead
                        user={{
                          id: item.assigneeId,
                          loginName: '',
                          realName: item.assigneeName,
                          avatar: item.imageUrl,
                        }}
                      />}

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
                        maxWidth: 27,
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
    ));
  }
}

export default IssueItem;
