import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Collapse, Button, Select, Input, Icon, Tooltip, Avatar } from 'choerodon-ui';
import _ from 'lodash';
import { axios, stores } from 'choerodon-front-boot';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import './Sprint.scss';
import SprintItem from './SprintItem';
import EmptyBacklog from '../../../../../assets/image/emptyBacklog.png';

const Panel = Collapse.Panel;
const Option = Select.Option;
let scroll;
const { AppState } = stores;

@observer
class Sprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keydown: '',
      selected: {
        droppableId: '',
        issueIds: [],
      },
      draggableId: '',
      createBacklogIssue: false,
      selectIssueType: 'story',
      createIssueValue: '',
    };
  }

  componentDidMount() {
    this.props.onRef(this);
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  componentDidUpdate() {
    BacklogStore.setSprintWidth();
  }

  onChangeState(params, data) {
    this.setState({
      [params]: data,
    });
  }
  

  onKeyUp(event) {
    this.setState({
      keydown: '',
    });
  }

  onKeyDown(event) {
    if (event.keyCode !== this.state.keydown) {
      this.setState({
        keydown: event.keyCode,
      });
    }
  }

  getCurrentState(data) {
    return this.state[data];
  }
  getFirst(str) {
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return '';
  }
  handleBlurCreateIssue() {
    this.setState({
      loading: true,
    });
    if (this.state.createIssueValue !== '') {
      const data = {
        priorityCode: 'medium',
        projectId: AppState.currentMenuType.id,
        sprintId: 0,
        summary: this.state.createIssueValue,
        typeCode: this.state.selectIssueType,
        parentIssueId: 0,
        ...!isNaN(BacklogStore.getChosenEpic) ? {
          epicId: BacklogStore.getChosenEpic,
        } : {},
        ...!isNaN(BacklogStore.getChosenVersion) ? {
          versionIssueRelDTOList: [
            {
              versionId: BacklogStore.getChosenVersion,
            },
          ],
        } : {},
      };
      BacklogStore.axiosEasyCreateIssue(data).then((res) => {
        this.setState({
          // createBacklogIssue: false,
          loading: false,
          createIssueValue: '',
        });
        this.props.refresh();
      }).catch((error) => {
        this.setState({
          loading: false,
        });
        window.console.log(error);
      });
    }
  }

  handleClickIssue(sprintId, item) {
    if (this.state.keydown === 91 || this.state.keydown === 16) {
      // 如果没点击
      if (this.state.selected.droppableId === '') {
        this.setState({
          selected: {
            droppableId: sprintId,
            issueIds: [item.issueId],
          },
        });
      } else if (String(
        this.state.selected.droppableId) === String(sprintId)) {
        // 如果点击的是当前列的卡片
        const originIssueIds = _.clone(this.state.selected.issueIds);
        // 如果不存在
        if (originIssueIds.indexOf(item.issueId) === -1) {
          this.setState({
            selected: {
              droppableId: sprintId,
              issueIds: [...originIssueIds, item.issueId],
            },
          });
        } else if (originIssueIds.length > 1) {
          // 如果存在 并且不是最后一个
          originIssueIds.splice(originIssueIds.indexOf(item.issueId), 1);
          this.setState({
            selected: {
              droppableId: sprintId,
              issueIds: originIssueIds,
            },
          });
        } else {
          this.setState({
            selected: {
              droppableId: '',
              issueIds: [],
            },
          });
        }
      }
    } else {
      this.setState({
        selected: {
          droppableId: '',
          issueIds: [],
        },
      });
      BacklogStore.setClickIssueDetail(item);
    }
  }

  renderTypecode(item, type) {
    if (item.typeCode === 'story') {
      if (type === 'background') {
        return '#00BFA5';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="class" />
        );
      }
    }
    if (item.typeCode === 'task') {
      if (type === 'background') {
        return '#4D90FE';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="assignment" />
        );
      }
    }
    if (item.typeCode === 'bug') {
      if (type === 'background') {
        return '#F44336';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="bug_report" />
        );
      }
    }
    return '';
  }

  renderIssueBackground(item) {
    if (BacklogStore.getClickIssueDetail.issueId === item.issueId) {
      return 'rgba(140,158,255,0.08)';
    } else if (BacklogStore.getIsDragging) {
      return 'white';
    } else {
      return 'unset';
    }
  }

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
  
  renderSprintIssue(data, sprintId) {
    const result = [];
    _.forEach(data, (item, index) => {
      result.push(
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
                    // background: snapshot1.isDragging ? 'lightgreen' : 'white',  
                    background: this.state.selected.issueIds.indexOf(item.issueId) !== -1 ? 'rgba(140,158,255,0.16)' : this.renderIssueBackground(item),
                    padding: '10px 36px 10px 20px',
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                    paddingLeft: 43,
                    ...provided1.draggableProps.style,
                    fontSize: 13,
                    display: this.renderIssueDisplay() ? 'block' : 'flex',
                    alignItems: 'center',
                    cursor: 'move',
                    flexWrap: 'wrap',
                    // position: 'relative',
                  }}
                  label="sprintIssue"
                  role="none"
                  onClick={this.handleClickIssue.bind(this, sprintId, item)}
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
                      display: String(this.state.draggableId) === String(item.issueId) && this.state.selected.issueIds.length > 0 ? 'flex' : 'none',
                    }}
                    label="sprintIssue"
                  >{this.state.selected.issueIds.length}</div>
                  <div 
                    label="sprintIssue" 
                    className="c7n-backlog-sprintIssueSide"
                    style={{
                      width: this.renderIssueDisplay() ? 'unset' : 0,
                    }}
                  >
                    <div
                      className="c7n-backlog-sprintType"
                      style={{
                        background: this.renderTypecode(item, 'background'),
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                      label="sprintIssue"
                    >
                      {this.renderTypecode(item, 'icon')}
                    </div>
                    <p 
                      label="sprintIssue" 
                      style={{ 
                        marginLeft: 8,
                        // whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        height: 20,
                      }}
                    >{`${item.issueNum} ${item.summary}`}</p>
                  </div>
                  <div 
                    style={{ 
                      marginTop: this.props.epicVisible || this.props.versionVisible || JSON.stringify(BacklogStore.getClickIssueDetail) !== '{}' ? 5 : 0,
                      justifyContent: this.renderIssueDisplay() ? 'space-between' : 'flex-end',
                      width: this.renderIssueDisplay() ? 'unset' : 0,
                      flex: 2,
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
                          <span 
                            label="sprintIssue" 
                            className="c7n-backlog-sprintIssuePriority"
                            style={{
                              color: this.renderPriorityStyle('color', item),
                              background: this.renderPriorityStyle('background', item),
                            }}
                          >{item.priorityName}</span>
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
                          <span label="sprintIssue" className="c7n-backlog-sprintIssueVersion">
                            <span>{item.versionNames.join(', ')}</span>
                          </span>
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
                          <span 
                            label="sprintIssue" 
                            className="c7n-backlog-sprintIssueEpic"
                            style={{
                              // border: `1px solid ${item.color}`,
                              color: item.color,
                            }}
                          >{item.epicName}</span>
                        ) : ''}
                      </div>
                    </div>
                    <div className="c7n-backlog-sprintSideRightItems">
                      <div 
                        style={{ 
                          maxWidth: 105,
                          marginLeft: !_.isNull(item.assigneeName) ? '12px' : 0,
                        }} 
                        label="sprintIssue" 
                        className="c7n-backlog-sprintIssueRight"
                      >
                        {!_.isNull(item.assigneeName) ? (
                          <div style={{ display: 'inline-block' }} label="sprintIssue">
                            {/* <div label="sprintIssue" className
                          // ="c7n-backlog-sprintPeople">M</div> */}
                            <Avatar
                              size="small"
                              src={item.imageUrl ? item.imageUrl : undefined}
                            >
                              {
                                !item.imageUrl && item.assigneeName ? this.getFirst(item.assigneeName) : ''
                              }
                            </Avatar>
                            <span style={{ color: 'rgba(0,0,0,0.65)' }} label="sprintIssue">{item.assigneeName}</span>
                          </div>
                        ) : ''}
                      </div>
                      <div 
                        style={{ 
                          maxWidth: 60,
                          marginLeft: !_.isNull(item.statusName) ? '12px' : 0,
                        }} 
                        label="sprintIssue"
                        className="c7n-backlog-sprintIssueRight"
                      >
                        {!_.isNull(item.statusName) ? (
                          <span 
                            label="sprintIssue" 
                            className="c7n-backlog-sprintIssueStatus"
                            style={{
                              background: item.statusColor ? item.statusColor : '#4d90fe',
                            }}
                          >{item.statusName}</span>
                        ) : ''}
                      </div>
                      <div 
                        style={{ 
                          maxWidth: 20,
                          marginLeft: !_.isNull(item.storyPoints) ? '12px' : 0,
                        }}
                        label="sprintIssue"
                        className="c7n-backlog-sprintIssueRight"
                      >
                        {!_.isNull(item.storyPoints) ? (
                          <div label="sprintIssue" className="c7n-backlog-sprintIssueStoryPoint">{item.storyPoints}</div>
                        ) : ''}
                      </div>
                    </div>
                  </div>
                </div>
                {provided1.placeholder}
              </div>
            )
          }
        </Draggable>,
      );
    });
    return result;
  }
  renderSprint() {
    let result = [];
    if (JSON.stringify(BacklogStore.getSprintData) !== '{}') {
      const data = BacklogStore.getSprintData.sprintData;
      if (data) {
        if (data.length > 0) {
          _.forEach(data, (item, index) => {
            result.push(
              <SprintItem
                item={item}
                renderSprintIssue={this.renderSprintIssue.bind(this)}
                refresh={this.props.refresh.bind(this)}
                index={index}
              />
              ,
            );
          });
        } else {
          result = (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 0',
              }}
            >
              <img style={{ width: 172 }} alt="emptybacklog" src={EmptyBacklog} />
              <div>
                <p style={{ color: 'rgba(0,0,0,0.65)' }}>用问题填充您的待办事项</p>
                <p style={{ fontSize: 16, lineHeight: '28px', marginTop: 8 }}>这是您的团队待办事项。创建并预估新的问题，并通<br />过上下拖动来对待办事项排优先级</p>
              </div>
            </div>
          );
        }
      }
    }
    return result;
  }
  renderBacklog() {
    if (JSON.stringify(BacklogStore.getSprintData) !== '{}') {
      const data = BacklogStore.getSprintData.backlogData;
      if (data) {
        return (
          <div>
            <div className="c7n-backlog-sprintTop">
              <div className="c7n-backlog-springTitle">
                <div className="c7n-backlog-sprintTitleSide">
                  <p className="c7n-backlog-sprintName">
                    {/* <Icon style={{ fontSize: 20 }} type="keyboard_arrow_down" /> */}
                    <span style={{ marginLeft: 8 }}>待办事项</span>
                  </p>
                  <p className="c7n-backlog-sprintQuestion">
                    {data.backLogIssue && data.backLogIssue.length > 0 ? `${data.backLogIssue.length}个问题可见` : '0个问题可见'}
                    {/* {!_.isNull(data.backlogIssueCount) ? ` 
                  共${data.backlogIssueCount}个问题` : ' 共0个问题'} */}
                  </p>
                </div>
              </div>
            </div>
            <Droppable droppableId={'backlog'} isDropDisabled={BacklogStore.getIsLeaveSprint}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={{
                    background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                    // background: 'white',
                    padding: 'grid',
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                  }}
                >
                  {this.renderSprintIssue(data.backLogIssue, 'backlog')}
                  {provided.placeholder}
                  <div className="c7n-backlog-sprintIssue">
                    <div
                      style={{
                        userSelect: 'none',
                        background: 'white',  
                        padding: '10px 0 10px 43px',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {this.state.createBacklogIssue ? (
                        <div className="c7n-backlog-sprintIssueSide" style={{ display: 'block' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Select
                              value={this.state.selectIssueType}
                              style={{
                                width: 50,
                                height: 20,
                              }}
                              onChange={(value) => {
                                this.setState({
                                  selectIssueType: value,
                                });
                              }}
                              dropdownMatchSelectWidth={false}
                            >
                              <Option value="story">
                                <Tooltip title="故事">
                                  <div
                                    className="c7n-backlog-sprintType"
                                    style={{
                                      background: '#00BFA5',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Icon style={{ color: 'white', fontSize: '14px' }} type="class" />
                                  </div>
                                </Tooltip>
                              </Option>
                              <Option value="task">
                                <Tooltip title="任务">
                                  <div
                                    className="c7n-backlog-sprintType"
                                    style={{
                                      background: '#4D90FE',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Icon style={{ color: 'white', fontSize: '14px' }} type="assignment" />
                                  </div>
                                </Tooltip>
                              </Option>
                              <Option value="bug">
                                <Tooltip title="缺陷">
                                  <div
                                    className="c7n-backlog-sprintType"
                                    style={{
                                      background: '#F44336',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Icon style={{ color: 'white', fontSize: '14px' }} type="bug_report" />
                                  </div>
                                </Tooltip>
                              </Option>
                            </Select>
                            <div style={{ marginLeft: 8, flexGrow: 1 }}>
                              <Input 
                                autoFocus
                                value={this.state.createIssueValue}
                                placeholder="需要做什么"
                                onChange={(e) => {
                                  this.setState({
                                    createIssueValue: e.target.value,
                                  });
                                }}
                                maxLength={30}
                                onPressEnter={this.handleBlurCreateIssue.bind(this)}
                                // onBlur={this.handleBlurCreateIssue.bind(this)}
                              />
                            </div>
                          </div>
                          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-start', paddingRight: 70 }}>
                            <Button 
                              type="primary"
                              onClick={() => {
                                this.setState({
                                  createBacklogIssue: false,
                                });
                              }}
                            >取消</Button>
                            <Button loading={this.state.loading} onClick={this.handleBlurCreateIssue.bind(this)} type="primary">确定</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="c7n-backlog-sprintIssueSide">
                          <Icon
                            className="c7n-backlog-createIssue"
                            type="playlist_add"
                            role="none"
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              this.setState({
                                createBacklogIssue: true,
                                createIssueValue: '',
                              });
                            }}
                          >创建问题</Icon>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        );
      }
    }
    return '';
  }
  render() {
    return (
      <div
        role="none"
        className="c7n-backlog-sprint"
        onMouseEnter={() => {
          BacklogStore.setIsLeaveSprint(false);
        }}
        onMouseLeave={() => {
          BacklogStore.setIsLeaveSprint(true);
        }}
      >
        {this.renderSprint()}
        {this.renderBacklog()}
      </div>
    );
  }
}

export default Sprint;

