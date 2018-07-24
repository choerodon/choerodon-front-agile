import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Droppable } from 'react-beautiful-dnd';
import { DatePicker, Input, Button, Select, Icon, Tooltip, Popover, Modal, Table, Avatar, Dropdown, Menu } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import moment from 'moment';
import CloseSprint from './CloseSprint';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import StartSprint from './StartSprint';
import emptyPng from '../../../../../assets/image/emptySprint.png';
import EasyEdit from '../../../../../components/EasyEdit/EasyEdit';
import AssigneeModal from './AssigneeModal';

const { Sidebar } = Modal;
const Option = Select.Option;
const confirm = Modal.confirm;
const { AppState } = stores;

@observer
class SprintItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editStartDate: false,
      editendDate: false,
      expand: true,
      createIssue: false,
      selectIssueType: 'story',
      createIssueValue: '',
      editName: false,
      editGoal: false,
      closeSprintVisible: false,
      startSprintVisible: false,
      visibleAssign: false,
      loading: false,
      total: {
        totalIssue: '无',
        totalStoryPoints: '无',
        totalTime: '无',
      },
    };
  }
  componentWillReceiveProps(nextProps) {
    const assignData = nextProps.item.assigneeIssues;
    let totalIssue = 0;
    let totalStoryPoints = 0;
    let totalTime = 0;
    if (Array.isArray(assignData)) {
      for (let index = 0, len = assignData.length; index < len; index += 1) {
        if (assignData[index].issueCount) {
          totalIssue += assignData[index].issueCount;
        }
        if (assignData[index].totalStoryPoints) {
          totalStoryPoints += assignData[index].totalStoryPoints;
        }
        if (assignData[index].totalRemainingTime) {
          totalTime += assignData[index].totalRemainingTime;
        }
      }
    }
    this.setState({
      total: {
        totalIssue,
        totalStoryPoints,
        totalTime,
      },
    });
  }
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
  updateDate(type, date2) {
    let date = date2;
    const data = {
      objectVersionNumber: this.props.item.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      sprintId: this.props.item.sprintId,
      [type]: date += ' 00:00:00',
    };
    BacklogStore.axiosUpdateSprint(data).then((res) => {
      this.props.refresh();
    }).catch((error) => {
    });
  }
  handleBlurCreateIssue() {
    this.setState({
      loading: true,
    });
    if (this.state.createIssueValue !== '') {
      const data = {
        priorityCode: BacklogStore.getProjectInfo.defaultPriorityCode ? BacklogStore.getProjectInfo.defaultPriorityCode : 'medium',
        projectId: AppState.currentMenuType.id,
        sprintId: !this.props.backlog ? this.props.item.sprintId : 0,
        summary: this.state.createIssueValue,
        typeCode: this.state.selectIssueType,
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
        parentIssueId: 0,
      };
      BacklogStore.axiosEasyCreateIssue(data).then((res) => {
        this.setState({
          // createIssue: false,
          createIssueValue: '',
          loading: false,
        });
        this.props.refresh();
      }).catch((error) => {
        this.setState({
          loading: false,
        });
      });
    }
  }
  handleBlurName(value) {
    const data = {
      objectVersionNumber: this.props.item.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      sprintId: this.props.item.sprintId,
      sprintName: value,
    };
    BacklogStore.axiosUpdateSprint(data).then((res) => {
      this.setState({
        editName: false,
      });
      this.props.refresh();
    }).catch((error) => {
    });
  }

  handleBlurGoal(value) {
    const data = {
      objectVersionNumber: this.props.item.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      sprintId: this.props.item.sprintId,
      sprintGoal: value,
    };
    BacklogStore.axiosUpdateSprint(data).then((res) => {
      this.setState({
        editGoal: false,
      });
      this.props.refresh();
    }).catch((error) => {
    });
  }
  handleFinishSprint() {
    BacklogStore.axiosGetSprintCompleteMessage(
      this.props.item.sprintId).then((res) => {
      BacklogStore.setSprintCompleteMessage(res);
      let flag = 0;
      if (res.parentsDoneUnfinishedSubtasks) {
        if (res.parentsDoneUnfinishedSubtasks.length > 0) {
          flag = 1;
          let issueNums = '';
          for (let index = 0, len = res.parentsDoneUnfinishedSubtasks.length; index < len; index += 1) {
            issueNums += `${res.parentsDoneUnfinishedSubtasks[index].issueNum} `;
          }
          confirm({
            title: 'warnning',
            content: `父卡${issueNums}有未完成的子任务，无法完成冲刺`,
            onCancel() {
            },
          });
        }
      }
      if (flag === 0) {
        this.setState({
          closeSprintVisible: true,
        });
      }
    }).catch((error) => {
    });
  }
  handleStartSprint() {
    if (!BacklogStore.getSprintData.sprintData.filter(items => items.statusCode === 'started').length > 0) {
      if (this.props.item.issueSearchDTOList.length > 0) {
        BacklogStore.axiosGetOpenSprintDetail(
          this.props.item.sprintId).then((res) => {
          BacklogStore.setOpenSprintDetail(res);
          this.setState({
            startSprintVisible: true,
          });
        }).catch((error) => {
        });
      }
    }
  }
  handleDeleteSprint(e) {
    if (e.key === '0') {
      BacklogStore.axiosDeleteSprint(this.props.item.sprintId).then((res) => {
        this.props.refresh();
      }).catch((error) => {
      });
    }
  }
  clearFilter() {
    BacklogStore.setChosenEpic('all');
    BacklogStore.setChosenVersion('all');
    BacklogStore.setOnlyMe(false);
    BacklogStore.setRecent(false);
    BacklogStore.setQuickFilters([]);
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
    });
  }
  renderIssueOrIntro(issues, sprintId) {
    if (issues) {
      if (issues.length > 0) {
        return this.props.renderSprintIssue(issues, sprintId);
      }
    }
    if (!this.props.backlog) {
      if (this.props.index === 0) {
        return (
          <div style={{ display: 'flex', height: 100 }} className="c7n-noissue-notzero">
            <img style={{ width: 80, height: 70 }} alt="空sprint" src={emptyPng} />
            <div style={{ marginLeft: 20 }}>
              <p>计划您的SPRINT</p>
              <p>这是一个Sprint。将问题拖拽至此来计划一个Sprint。</p>
            </div>
          </div>
        );
      } else if (BacklogStore.getChosenEpic !== 'all' || BacklogStore.getChosenVersion !== 'all') {
        return (
          <div className="c7n-noissue-notzero">在sprint中所有问题已筛选</div>
        );
      } else {
        return (
          <div className="c7n-noissue-notzero">要计划一次sprint, 可以拖动本次sprint页脚到某个问题的下方，或者把问题拖放到这里</div>
        );
      }
    }
    return '';
  }
  renderOpenColor(type) {
    if (BacklogStore.getSprintData.sprintData.filter(items => items.statusCode === 'started').length === 0) {
      if (this.props.item.issueSearchDTOList) {
        if (this.props.item.issueSearchDTOList.length > 0) {
          if (type === 'color') {
            return '#3f51b5';
          } else {
            return 'pointer';
          }
        }
      }
    }
    if (type === 'color') {
      return 'rgba(0,0,0,0.26)';
    } else {
      return 'not-allowed';
    }
  }
  renderData(item, type) {
    //   startDate endDate
    let result = '';
    if (!_.isNull(item[type])) {
      result = `${item[type].split('-')[0]}年${item[type].split('-')[1]}月${item[type].split('-')[2].substring(0, 2)}日 ${item[type].split(' ')[1]}`;
    } else {
      result = '无';
    }
    return result;
  }


  renderStatusCodeDom(item) {
    const menu = (
      <Menu
        onClick={this.handleDeleteSprint.bind(this)}
      >
        <Menu.Item key="0">
          删除sprint
        </Menu.Item>
      </Menu>
    );
    if (item.statusCode) {
      return (
        <div className="c7n-backlog-sprintTitleSide">
          {item.statusCode === 'started' ? (
            <p className="c7n-backlog-sprintStatus">活跃</p>
          ) : (
            <p className="c7n-backlog-sprintStatus2">未开始</p>
          )}
          {item.statusCode === 'started' ? (
            <div style={{ display: 'flex' }}>
              <p
                className="c7n-backlog-closeSprint"
                role="none"
                onClick={this.handleFinishSprint.bind(this)}
              >完成冲刺</p>
              {/* <Dropdown overlay={menu} trigger={['click']}>
                <Icon style={{ cursor: 'pointer', marginLeft: 5 }} type="more_vert" />
              </Dropdown> */}
            </div>
          ) : (
            <div style={{ display: 'flex' }}>
              <p
                className="c7n-backlog-openSprint"
                style={{
                  color: this.renderOpenColor('color'),
                  cursor: this.renderOpenColor('cursor'),
                }}
                role="none"
                onClick={this.handleStartSprint.bind(this)}
              >开启冲刺</p>
              <Dropdown overlay={menu} trigger={['click']}>
                <Icon style={{ cursor: 'pointer', marginLeft: 5 }} type="more_vert" />
              </Dropdown>
            </div>
          )}
          <StartSprint
            visible={this.state.startSprintVisible}
            onCancel={() => {
              this.setState({
                startSprintVisible: false,
              });
            }}
            data={this.props.item}
            refresh={this.props.refresh.bind(this)}
          />
          <CloseSprint
            visible={this.state.closeSprintVisible}
            onCancel={() => {
              this.setState({
                closeSprintVisible: false,
              });
            }}
            data={this.props.item}
            refresh={this.props.refresh.bind(this)}
          />
        </div>
      );
    }
    return '';
  }

  render() {
    const item = this.props.item;
    const data = BacklogStore.getSprintData.sprintData;
    const ifBacklog = this.props.backlog;
    return (
      <div id={this.props.index === data.length - 1 ? 'sprint_last' : undefined}>
        <div className="c7n-backlog-sprintTop">
          <div className="c7n-backlog-springTitle">
            <div className="c7n-backlog-sprintTitleSide">
              <p className="c7n-backlog-sprintName">
                {
                  !this.props.backlog ? (
                    <Icon
                      style={{ fontSize: 20, cursor: 'pointer' }}
                      type={this.state.expand ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}
                      role="none"
                      onClick={() => {
                        this.setState({
                          expand: !this.state.expand,
                        });
                      }}
                    />
                  ) : ''
                }
                <EasyEdit
                  type="input"
                  defaultValue={item.sprintName}
                  enterOrBlur={this.handleBlurName.bind(this)}
                  disabled={this.props.backlog}
                >
                  <span
                    style={{ marginLeft: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    role="none"
                  >{item.sprintName}</span>
                </EasyEdit>
              </p>
              <p className="c7n-backlog-sprintQuestion">
                {item.issueSearchDTOList && item.issueSearchDTOList.length > 0 ? `${item.issueSearchDTOList.length}个问题可见` : '0个问题可见'}
                {/* {!_.isNull(item.issueCount) ? ` 共${item.issueCount}个问题` : ' 共0个问题'} */}
              </p>
              <p 
                className="c7n-backlog-clearFilter"
                style={{
                  display: 
                    BacklogStore.getChosenVersion !== 'all' 
                    || BacklogStore.getChosenEpic !== 'all'
                    || BacklogStore.getOnlyMe
                    || BacklogStore.getRecent // 仅故事
                    || BacklogStore.getQuickFilters.length > 0 ? 'block' : 'none',
                }}
                role="none"
                onClick={this.clearFilter.bind(this)}
              >清空所有筛选器</p>
            </div>
            <div style={{ flexGrow: 1 }}>
              {this.renderStatusCodeDom(item)}
            </div>
          </div>
          <div
            className="c7n-backlog-sprintDes"
            style={{
              display: this.props.item.assigneeIssues && this.props.item.assigneeIssues.length > 0 ? 'flex' : 'none',
            }}
          >
            {
              this.props.item.assigneeIssues ? (
                this.props.item.assigneeIssues
                  .filter(ass => ass.assigneeId)
                  .map(ass2 => (
                    <Tooltip 
                      placement="bottom"
                      title={(
                        <div>
                          <p>{ass2.assigneeName}</p>
                          <p>{ass2.totalStoryPoints} story points</p>
                          <p>{ass2.totalRemainingTime ? ass2.totalRemainingTime : '无'} 剩余预估时间</p>
                          <p>{ass2.issueCount} 问题</p>
                        </div>
                      )}
                    >
                      {/* <div className="c7n-backlog-sprintIcon">{ass2.assigneeName ? 
                      ass2.assigneeName.substring(0, 1).toUpperCase() : ''}</div> */}
                      <Avatar
                        style={{ marginRight: 8 }}
                        src={ass2.imageUrl ? ass2.imageUrl : undefined}
                        size="small"
                      >
                        {
                          !ass2.imageUrl && ass2.assigneeName ? this.getFirst(ass2.assigneeName) : ''
                        }
                      </Avatar>
                    </Tooltip>
                  ))) : ''
            }
            <Icon 
              style={{ 
                cursor: 'pointer',
                fontSize: 20,
                marginLeft: 8,
                display: this.props.item.assigneeIssues && this.props.item.assigneeIssues.length > 0 ? 'block' : 'none',
              }}
              type="more_vert"
              role="none"
              onClick={() => {
                this.setState({
                  visibleAssign: true,
                });
              }}
            />
            <AssigneeModal
              visible={this.state.visibleAssign}
              onCancel={() => {
                this.setState({
                  visibleAssign: false,
                });
              }}
              data={this.props.item}
              total={this.state.total}
            />
            {item.statusCode === 'started' ? (
              <div
                className="c7n-backlog-sprintData"
                style={{
                  display: 'flex',
                }}
              >
                <EasyEdit
                  type="date"
                  time
                  defaultValue={item.startDate ? moment(item.startDate, 'YYYY-MM-DD HH-mm-ss') : ''}
                  disabledDate={item.endDate ? current => current > moment(item.endDate, 'YYYY-MM-DD HH:mm:ss') : ''}
                  onChange={(date, dateString) => {
                    this.updateDate('startDate', dateString);
                  }}
                >
                  <p
                    className="c7n-backlog-sprintDataItem"
                    role="none"
                  >{this.renderData(item, 'startDate')}</p>
                </EasyEdit>
                <p>~</p>
                <EasyEdit
                  type="date"
                  time
                  defaultValue={item.endDate ? moment(item.endDate, 'YYYY-MM-DD HH-mm-ss') : ''}
                  disabledDate={item.startDate ? current => current < moment(item.startDate, 'YYYY-MM-DD HH:mm:ss') : ''}
                  onChange={(date, dateString) => {
                    this.updateDate('endDate', dateString);
                  }}
                >
                  <p
                    className="c7n-backlog-sprintDataItem"
                    role="none"
                  >{this.renderData(item, 'endDate')}</p>
                </EasyEdit>
              </div>
            ) : ''}
          </div>
          <div
            className="c7n-backlog-sprintGoal"
            style={{
              display: item.statusCode === 'started' ? 'flex' : 'none',
            }} 
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p>本周冲刺目标：</p>
              <EasyEdit
                type="input"
                defaultValue={item.sprintGoal}
                enterOrBlur={this.handleBlurGoal.bind(this)}
              >
                <p
                  role="none"
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    this.setState({
                      editGoal: true,
                    });
                  }}
                >{item.sprintGoal ? item.sprintGoal : '无'}</p>
              </EasyEdit>
            </div>
            <div 
              style={{
                display: 'flex',
              }} 
              className="c7n-backlog-sprintGoalSide"
            >
              <Tooltip title={`待处理故事点: ${item.todoStoryPoint}`}>
                <div style={{ backgroundColor: '#FFB100' }}>{item.todoStoryPoint}</div>
              </Tooltip>
              <Tooltip title={`处理中故事点: ${item.doingStoryPoint}`}>
                <div style={{ backgroundColor: '#4D90FE' }}>{item.doingStoryPoint}</div>
              </Tooltip>
              <Tooltip title={`已完成故事点: ${item.doneStoryPoint}`}>
                <div style={{ backgroundColor: '#00BFA5' }}>{item.doneStoryPoint}</div>
              </Tooltip>
            </div>
          </div>
        </div>
        {this.state.expand ? (
          <Droppable 
            droppableId={item.sprintId}
            isDropDisabled={BacklogStore.getIsLeaveSprint}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                  // background: 'white',
                  padding: 'grid',
                  borderBottom: '1px solid rgba(0,0,0,0.12)',
                  marginBottom: ifBacklog ? 30 : 0,
                }}
              >
                {this.renderIssueOrIntro(item.issueSearchDTOList, item.sprintId)}
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
                    {this.state.createIssue ? (
                      <div className="c7n-backlog-sprintIssueSide" style={{ display: 'block', width: '100%' }}>
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
                                    marginRight: 0,
                                  }}
                                >
                                  <Icon style={{ color: 'white', fontSize: '14px' }} type="turned_in" />
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
                                    marginRight: 0,
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
                                    marginRight: 0,
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
                              maxLength={44}
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
                                createIssue: false,
                              });
                            }}
                          >取消</Button>
                          <Button
                            type="primary"
                            loading={this.state.loading}
                            onClick={this.handleBlurCreateIssue.bind(this)}
                          >确定</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="c7n-backlog-sprintIssueSide">
                        <Button 
                          className="leftBtn" 
                          functyp="flat" 
                          style={{
                            color: '#3f51b5',
                          }}
                          onClick={() => {
                            BacklogStore.axiosGetProjectInfo().then((res) => {
                              BacklogStore.setProjectInfo(res);
                              this.setState({
                                createIssue: true,
                                createIssueValue: '',
                              });
                            });
                          }}
                        >
                          <Icon type="playlist_add" />创建问题
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Droppable>
        ) : ''}
      </div>
    );
  }
}

export default SprintItem;
