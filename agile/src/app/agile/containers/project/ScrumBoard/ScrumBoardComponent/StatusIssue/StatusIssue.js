import React, { Component, PureComponent } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Draggable } from 'react-beautiful-dnd';
import { Icon, Avatar, Tooltip } from 'choerodon-ui';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import './StatusIssue.scss';
import TypeTag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';
// 单个列的issueCard
// @observer
class StatusIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // shouldComponentUpdate(nextProps) {
  //   if (nextProps.ifClickMe !== this.props.ifClickMe) {
  //     return true;
  //   }
  //   if (nextProps.dragStartData !== this.props.dragStartData) {
  //     return true;
  //   }
  //   if (nextProps.data.objectVersionNumber !== this.props.data.objectVersionNumber) {
  //     return true;
  //   }
  //   return false;
  // }
  /**
   *获取首字母
   *
   * @param {*} str
   * @returns
   * @memberof StatusIssue
   */
  getFirst = (str) => {
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
  };

  /**
   *是否有父卡
   *
   * @param {*} parentId
   * @param {*} items
   * @returns
   * @memberof StatusIssue
   */
  getParent = (parentId, items) => {
    let result = false;
    if (parentId) {
      const { statusData: data } = this.props;
      // const data = this.props.statusData;
      for (let index = 0, len = data.length; index < len; index += 1) {
        for (let index2 = 0, len2 = data[index].issues.length; index2 < len2; index2 += 1) {
          if (data[index].issues[index2].issueId === parentId) {
            // 如果同一列有父卡
            if (data[index].issues[index2].assigneeId) {
              if (data[index].issues[index2].assigneeId === items.assigneeId) {
                result = true;
              }
            } else if (!items.assigneeId) {
              result = true;
            }
          }
        }
      }
    }
    return false;
  };

  /**
   *获取子卡
   *
   * @returns
   * @memberof StatusIssue
   */
  getChildren = () => {
    const {
      parentsIds,
      data: { issueId: itemIssueId },
      data: { assigneeId: itemAssigneeId },
      statusData: allStatus,
    } = this.props;

    let flag = 0;
    if (parentsIds.length > 0) {
      for (let i = 0, len = parentsIds.length; i < len; i += 1) {
        if (parentsIds[i].issueId === itemIssueId) {
          // 该任务是父卡
          flag = 1;
        }
      }
    }
    if (flag === 1) {
      const childrenList = [];
      for (let i = 0, len = allStatus.length; i < len; i += 1) {
        for (let j = 0, len2 = allStatus[i].issues.length; j < len2; j += 1) {
          const { assigneeId, parentIssueId } = allStatus[i].issues[j];
          if (assigneeId && assigneeId === itemAssigneeId) {
            if (parentIssueId === itemIssueId) {
              childrenList.push(allStatus[i].issues[j]);
            }
          } else if (!itemAssigneeId) {
            if (parentIssueId === itemIssueId) {
              childrenList.push(allStatus[i].issues[j]);
            }
          }
        }
      }
      const result = [];
      if (childrenList.length > 0) {
        // const issueId = JSON.parse(JSON.stringify(ScrumBoardStore.getClickIssueDetail)).issueId;

        childrenList.sort((a, b) => a.issueId - b.issueId).forEach((item, index) => {
          result.push(this.renderReturn(item, `sub-${index}`, 'child'));
        });
        // for (let index = 0, len = childrenList.length; index < len; index += 1) {
        //   result.push(this.renderReturn(childrenList[index], `sub-${index}`, 'child'));
        // }
        return result;
      }
    }
    return '';
  };

  /**
   *单个issue是否渲染
   *
   * @returns
   * @memberof StatusIssue
   */
  renderIssueDisplay = () => {
    const { dragStartData, issueId, droppableId } = this.props;
    // 没有开始拖
    if (JSON.stringify(dragStartData) === '{}') {
      return 'visible';
    } else {
      const jsonDraggableId = JSON.parse(dragStartData.draggableId);
      const jsonSource = JSON.parse(dragStartData.source.droppableId);
      if (String(issueId) === String(jsonDraggableId.issueId)) {
        // 如果是当前拖动元素
        return 'visible';
      } else if (String(droppableId) === String(jsonSource.code)) {
        //   如果是拖动同一列的
        return 'visible';
      } else {
        return 'hidden';
      }
    }
  };

  /**
   *issue类型
   *
   * @param {*} type
   * @param {*} item
   * @returns
   * @memberof StatusIssue
   */
  renderTypeCode = (type, item) => {
    const { typeCode } = item;
    if (typeCode === 'story') {
      if (type === 'background') {
        return '#00BFA5';
      } else {
        return (
          <Tooltip title="类型： 故事">
            <Icon style={{ color: 'white', fontSize: '14px' }} type="turned_in" />
          </Tooltip>
        );
      }
    } else if (typeCode === 'bug') {
      if (type === 'background') {
        return '#F44336';
      } else {
        return (
          <Tooltip title="类型： 缺陷">
            <Icon style={{ color: 'white', fontSize: '14px' }} type="bug_report" />
          </Tooltip>
        );
      }
    } else if (typeCode === 'task') {
      if (type === 'background') {
        return '#4D90FE';
      } else {
        return (
          <Tooltip title="类型： 任务">
            <Icon style={{ color: 'white', fontSize: '14px' }} type="assignment" />
          </Tooltip>
        );
      }
    } else if (type === 'background') {
      return '#4D90FE';
    } else {
      return (
        <Tooltip title="类型： 子任务">
          <Icon style={{ color: 'white', fontSize: '14px' }} type="relation" />
        </Tooltip>
      );
    }
  };

  renderStatusBackground = (categoryCode) => {
    if (categoryCode === 'todo') {
      return 'rgb(255, 177, 0)';
    } else if (categoryCode === 'doing') {
      return 'rgb(77, 144, 254)';
    } else if (categoryCode === 'done') {
      return 'rgb(0, 191, 165)';
    } else {
      return 'gray';
    }
  };

  /**
   *优先级样式
   *
   * @param {*} type
   * @param {*} item
   * @returns
   * @memberof StatusIssue
   */
  renderPriorityStyle = (type, item) => {
    if (type === 'color') {
      if (item.priorityName === '中') {
        return 'rgb(53, 117, 223)';
      } else if (item.priorityName === '高') {
        return 'rgb(255, 177, 0)';
      } else {
        return 'rgba(0, 0, 0, 0.36)';
      }
    } else if (item.priorityName === '中') {
      return 'rgba(77, 144, 254, 0.2)';
    } else if (item.priorityName === '高') {
      return 'rgba(255, 177, 0, 0.12)';
    } else {
      return 'rgba(0, 0, 0, 0.08)';
    }
  };

  // 控制是否显示子任务
  renderSubDisplay = (item, type, border) => {
    let result = 'block';
    const { statusData: columnData, swimLaneCode } = this.props;
    if (item.parentIssueId) {
      for (let index = 0, len = columnData.length; index < len; index += 1) {
        for (let index2 = 0, len2 = columnData[index].issues.length; index2 < len2; index2 += 1) {
          if (columnData[index].issues[index2].issueId === item.parentIssueId) {
            if (columnData[index].issues[index2].assigneeId) {
              if (columnData[index].issues[index2].assigneeId === item.assigneeId) {
                if (!type) {
                  if (swimLaneCode === 'assignee') {
                    result = 'none';
                  }
                }
              }
            } else if (!item.assigneeId) {
              if (!type) {
                if (swimLaneCode === 'assignee') {
                  result = 'none';
                }
              }
            }
          }
        }
      }
      if (border) {
        return true;
      } else {
        return result;
      }
    }
    if (border) {
      return false;
    } else {
      return result;
    }
  };

  /**
   *渲染史诗
   *
   * @param {*} param
   * @returns
   * @memberof StatusIssue
   */
  renderEpicData = (param) => {
    const { data, item } = this.props;
    let result;
    for (let index = 0, len = data.length; index < len; index += 1) {
      if (String(data[index].epicId) === String(item.epicId)) {
        result = data[index][param];
      }
    }
    return result;
  }

  /**
   *渲染issue逻辑
   *
   * @param {*} item
   * @param {*} index
   * @param {*} issueId
   * @param {*} type
   * @returns
   * @memberof StatusIssue
   */
  renderReturn = (item, index, type) => {
    const clickItem = ScrumBoardStore.getClickIssueDetail;
    const ifClickMe = String(clickItem.issueId) === String(item.issueId);

    const {
      isCompleted, statusName, categoryCode, swimLaneCode, statusId,
    } = this.props;
    // 子任务和父任务分离显示！
    if (true || this.renderSubDisplay(item, type) === 'block') {
      return (
        <div
          key={item.issueId}
          className="c7n-boardIssue"
          style={{
            // borderTop: this.renderSubDisplay(item, type, 'border') ?
            // '1px solid rgba(0, 0, 0, 0.20)' : 'unset',
            // display: this.renderSubDisplay(item, type),
          }}
        >
          <Draggable
            key={item.issueId}
            draggableId={JSON.stringify({
              objectVersionNumber: item.objectVersionNumber,
              issueId: item.issueId,
              typeId: item.issueTypeDTO.id,
              statusId,
            })}
            index={index}
          >
            {(provided, snapshot) => (
              <div style={{ margin: 6 }}>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    userSelect: 'none',
                    // background: snapshot.isDragging ? 'lightgreen' : 'white',
                    minHeight: 102,
                    // borderLeft: '1px solid rgba(0,0,0,0.20)',
                    // borderRight: '1px solid rgba(0,0,0,0.20)',
                    cursor: 'move',
                    // visibility: this.renderIssueDisplay(),
                    ...provided.draggableProps.style,
                    // display: 'flex',
                    overflow: 'hidden',
                  }}
                  role="none"
                  onClick={(e) => {
                    ScrumBoardStore.setClickIssueDetail(item);
                  }}
                >
                  {/* {
                      item.parentIssueId && ScrumBoardStore.getSwimLaneCode === 'assignee' ?
                        this.getParent(item.parentIssueId)
                        : ''
                    } */}
                  <div
                    className="c7n-scrumboard-issue"
                    style={{
                      // marginLeft: item.parentIssueId && this.props.swimLaneCode === '
                      // assignee' && this.getParent(item.parentIssueId, item) ? 16 : 0,
                      background: ifClickMe ? 'rgba(140, 158, 255, 0.08)' : 'white',
                      borderTop: item.parentIssueId && swimLaneCode === 'assignee' && this.getParent(item.parentIssueId, item) ? 'unset' : '1px solid rgba(0, 0, 0, 0.20)',
                    }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <div
                      // label={ScrumBoardStore.getClickIssueDetail.issueId}
                        className="c7n-scrumboard-issueTop"
                        style={{
                          // display: issueId ? 'block' : 'flex',
                          // flexWrap: 'wrap',
                          display: 'flex',
                          justifyContent: 'space-between',
                          // flexDirection: ScrumBoardStore.getClickIssueDetail.issueId ?
                          // 'column' : 'row',
                          // alignItems: 'center',
                          // height: '32px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            flex: 1,
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexGrow: '7',
                              marginBottom: 4,
                            }}
                          >
                            <Tooltip title={item.issueTypeDTO ? item.issueTypeDTO.name : ''}>
                              <TypeTag
                                data={item.issueTypeDTO}
                              />
                            </Tooltip>
                            <p
                              style={{ marginLeft: 5, textDecoration: isCompleted ? 'line-through' : '' }}
                              className="textDisplayOneColumn"
                            >
                              {item.issueNum}
                            </p>
                          </div>
                          <div style={{
                            display: 'flex',
                            // paddingLeft: ScrumBoardStore.getClickIssueDetail.issueId ? 0 : 24,
                            alignItems: 'center',
                            flexGrow: '1',
                            marginBottom: 4,
                          }}
                          >
                            <Tooltip title={`状态: ${statusName}`}>
                              <p
                                style={{
                                  borderRadius: 2,
                                  paddingLeft: 4,
                                  paddingRight: 4,
                                  background: this.renderStatusBackground(categoryCode),
                                  color: 'white',
                                  maxWidth: 50,
                                  minWidth: 20,
                                  textAlign: 'center',
                                  height: 20,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {statusName}
                              </p>
                            </Tooltip>
                            <Tooltip title={`优先级: ${item.priorityDTO && item.priorityDTO.name}`}>
                              <p
                                style={{
                                  background: `${item.priorityDTO ? item.priorityDTO.colour : '#FFFFFF'}1F`,
                                  color: item.priorityDTO ? item.priorityDTO.colour : '#FFFFFF',
                                  textAlign: 'center',
                                  marginLeft: '8px',
                                  minWidth: 16,
                                  maxWidth: 46,
                                  paddingLeft: 2,
                                  paddingRight: 2,
                                  height: 20,
                                  borderRadius: 2,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {item.priorityDTO && item.priorityDTO.name}
                              </p>
                            </Tooltip>
                          </div>
                        </div>
                        {
                          <Tooltip title={item.assigneeName ? `经办人: ${item.assigneeName}` : ''}>
                            {
                                item.assigneeName ? (
                                  <UserHead
                                    hiddenText
                                    size={32}
                                    style={{ marginLeft: 8 }}
                                    user={{
                                      id: item.assigneeId,
                                      loginName: item.assigneeName,
                                      realName: item.assigneeName,
                                      avatar: item.imageUrl,
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: 32,
                                    height: 32,
                                    flexShrink: 0,
                                    marginLeft: 8,
                                    marginBottom: 4,
                                  }}
                                  />
                                )
                              }
                          </Tooltip>
                        }
                      </div>
                      <div className="c7n-scrumboard-issueBottom">
                        <Tooltip title={item.summary} placement="topLeft">
                          <p className="textDisplayTwoColumn">
                            {item.summary}
                          </p>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
                {provided.placeholder}
              </div>
            )
            }
          </Draggable>
          {
            // 父子任务分离显示
            // !type && swimLaneCode === 'assignee' ? this.getChildren() : ''
          }
        </div>
      );
    }
    return '';
  };

  render() {
    const { data: item, index } = this.props;
    // const issueId = JSON.parse(JSON.stringify(ScrumBoardStore.getClickIssueDetail)).issueId;
    return this.renderReturn(item, index);
  }
}

export default StatusIssue;
